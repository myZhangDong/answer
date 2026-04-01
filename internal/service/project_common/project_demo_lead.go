/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package projectcommon

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/schema"
	"github.com/gin-gonic/gin"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
)

const (
	projectDemoLeadCRMSource   = "community"
	projectDemoLeadDefaultMsg  = "暂无需求，了解一下"
	projectDemoLeadHTTPTimeout = 10 * time.Second
)

type demoLeadUTMParameters struct {
	Referrer    string `json:"referrer"`
	Device      string `json:"device"`
	Browser     string `json:"browser"`
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
	UTMContent  string `json:"utm_content"`
	UTMTerm     string `json:"utm_term"`
}

type demoLeadCRMLoginResp struct {
	Result  bool   `json:"result"`
	Binding string `json:"binding"`
}

type demoLeadCRMInsertResp struct {
	Result bool `json:"result"`
}

func (ps *ProjectCommon) SubmitDemoLead(ctx context.Context, req *schema.SubmitProjectDemoLeadReq) (*schema.SubmitProjectDemoLeadResp, error) {
	log.Infof("demo_lead submit request project_id=%s phone=%s captcha_id=%s referer=%s",
		req.ProjectID, maskPhone(req.Phone), req.CaptchaID, getDemoLeadReferer(ctx))

	_, exist, err := ps.projectRepo.GetProject(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errors.BadRequest(reason.ObjectNotFound)
	}

	if strings.TrimSpace(ps.serviceConf.DemoLeadCRMURL) == "" ||
		strings.TrimSpace(ps.serviceConf.DemoLeadCRMUsername) == "" ||
		strings.TrimSpace(ps.serviceConf.DemoLeadCRMPassword) == "" {
		log.Errorf("demo_lead config incomplete crm_url=%q username_set=%t password_set=%t",
			ps.serviceConf.DemoLeadCRMURL,
			strings.TrimSpace(ps.serviceConf.DemoLeadCRMUsername) != "",
			strings.TrimSpace(ps.serviceConf.DemoLeadCRMPassword) != "")
		return nil, errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交配置不完整")
	}

	utmParameters := parseDemoLeadUTMParameters(ctx)
	log.Infof("demo_lead utm payload=%s", mustJSON(utmParameters))
	binding, err := ps.loginDemoLeadCRM(ctx)
	if err != nil {
		return nil, err
	}

	if err = ps.insertDemoLeadCRM(ctx, binding, req.Phone, utmParameters); err != nil {
		return nil, err
	}

	return &schema.SubmitProjectDemoLeadResp{Success: true}, nil
}

func (ps *ProjectCommon) loginDemoLeadCRM(ctx context.Context) (string, error) {
	params := url.Values{}
	params.Set("serviceName", "clogin")
	params.Set("userName", ps.serviceConf.DemoLeadCRMUsername)
	params.Set("password", ps.serviceConf.DemoLeadCRMPassword)

	loginURL := fmt.Sprintf("%s?%s", ps.serviceConf.DemoLeadCRMURL, params.Encode())
	resp := &demoLeadCRMLoginResp{}
	log.Infof("demo_lead crm login request url=%s", maskDemoLeadLoginURL(loginURL))
	if err := ps.doDemoLeadCRMRequest(ctx, "crm_login", loginURL, resp); err != nil {
		return "", errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交登录 CRM 失败")
	}
	log.Infof("demo_lead crm login response=%s", mustJSON(resp))
	if !resp.Result || strings.TrimSpace(resp.Binding) == "" {
		return "", errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交登录 CRM 失败")
	}
	return resp.Binding, nil
}

func (ps *ProjectCommon) insertDemoLeadCRM(ctx context.Context, binding string, phone string, utmParameters demoLeadUTMParameters) error {
	data := []map[string]string{
		{
			"fwly":    utmParameters.Referrer,
			"yhsb":    utmParameters.Device,
			"yhllq":   utmParameters.Browser,
			"ggly":    utmParameters.UTMSource,
			"ggmj":    utmParameters.UTMMedium,
			"ggmc":    utmParameters.UTMCampaign,
			"ggnr":    utmParameters.UTMContent,
			"gggjc":   utmParameters.UTMTerm,
			"email":   "",
			"hangye":  "",
			"name":    "",
			"dianhua": phone,
			"company": "",
			"sjly":    projectDemoLeadCRMSource,
			"zcrq":    time.Now().Format("2006-01-02 15:04:05"),
			"beizhu":  buildProjectDemoLeadRemark(ctx),
			"cplx":    "",
		},
	}

	rawData, err := json.Marshal(data)
	if err != nil {
		return errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交序列化失败")
	}
	log.Infof("demo_lead crm insert payload=%s", string(rawData))

	params := url.Values{}
	params.Set("serviceName", "insert")
	params.Set("objectApiName", "Lead")
	params.Set("data", string(rawData))
	params.Set("binding", binding)

	insertURL := fmt.Sprintf("%s?%s", ps.serviceConf.DemoLeadCRMURL, params.Encode())
	resp := &demoLeadCRMInsertResp{}
	log.Infof("demo_lead crm insert request url=%s", maskDemoLeadInsertURL(insertURL))
	if err = ps.doDemoLeadCRMRequest(ctx, "crm_insert", insertURL, resp); err != nil {
		return errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交到 CRM 失败")
	}
	log.Infof("demo_lead crm insert response=%s", mustJSON(resp))
	if !resp.Result {
		return errors.InternalServer(reason.UnknownError).WithMsg("Demo 线索提交到 CRM 失败")
	}
	return nil
}

func (ps *ProjectCommon) doDemoLeadCRMRequest(ctx context.Context, requestName, requestURL string, target interface{}) error {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: projectDemoLeadHTTPTimeout}
	response, err := client.Do(request)
	if err != nil {
		log.Errorf("demo_lead %s http error: %v", requestName, err)
		return err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.Errorf("demo_lead %s read response body error: %v", requestName, err)
		return err
	}
	log.Infof("demo_lead %s raw response status=%d body=%s", requestName, response.StatusCode, string(body))

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("crm request status %d", response.StatusCode)
	}

	return json.Unmarshal(body, target)
}

func parseDemoLeadUTMParameters(ctx context.Context) demoLeadUTMParameters {
	utmParameters := demoLeadUTMParameters{}
	ginCtx, ok := ctx.(*gin.Context)
	if !ok {
		return utmParameters
	}

	rawCookie, err := ginCtx.Cookie("utmParameters")
	if err != nil || strings.TrimSpace(rawCookie) == "" {
		return utmParameters
	}
	_ = json.Unmarshal([]byte(rawCookie), &utmParameters)
	return utmParameters
}

func buildProjectDemoLeadRemark(ctx context.Context) string {
	ginCtx, ok := ctx.(*gin.Context)
	if !ok {
		return "意向情况: " + projectDemoLeadDefaultMsg
	}

	referer := strings.TrimSpace(ginCtx.GetHeader("Referer"))
	if referer == "" {
		return "意向情况: " + projectDemoLeadDefaultMsg
	}

	return fmt.Sprintf("访问页面:%s;意向情况: %s", referer, projectDemoLeadDefaultMsg)
}

func getDemoLeadReferer(ctx context.Context) string {
	ginCtx, ok := ctx.(*gin.Context)
	if !ok {
		return ""
	}
	return strings.TrimSpace(ginCtx.GetHeader("Referer"))
}

func maskPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if len(phone) < 7 {
		return phone
	}
	return phone[:3] + "****" + phone[len(phone)-4:]
}

func maskDemoLeadLoginURL(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	query := parsedURL.Query()
	if query.Get("password") != "" {
		query.Set("password", "***")
	}
	parsedURL.RawQuery = query.Encode()
	return parsedURL.String()
}

func maskDemoLeadInsertURL(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	query := parsedURL.Query()
	if query.Get("binding") != "" {
		query.Set("binding", "***")
	}
	if query.Get("data") != "" {
		query.Set("data", "[omitted-see-log-payload]")
	}
	parsedURL.RawQuery = query.Encode()
	return parsedURL.String()
}

func mustJSON(value any) string {
	raw, err := json.Marshal(value)
	if err != nil {
		return fmt.Sprintf("%v", value)
	}
	return string(raw)
}
