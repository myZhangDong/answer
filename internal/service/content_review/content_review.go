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

package content_review

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/service/service_config"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
)

const (
	ShumeiTextAPIURL = "https://api-text-bj.fengkongcloud.com/text/v4"
	AccessKey        = "7mi9nOhIzi4sLlWPst7Y"
	AppID            = "default"
	DefaultEventID   = "article"
)

// ContentReviewService 内容审核服务
type ContentReviewService struct {
	eventID string
	enabled bool
}

// NewContentReviewService 创建内容审核服务
func NewContentReviewService(serviceConf *service_config.ServiceConfig) *ContentReviewService {
	enabled := true
	if serviceConf != nil && serviceConf.DisableContentReview {
		enabled = false
	}
	return &ContentReviewService{
		eventID: DefaultEventID,
		enabled: enabled,
	}
}

// ShumeiRequest 数美请求结构
type ShumeiRequest struct {
	AccessKey string         `json:"accessKey"`
	AppID     string         `json:"appId"`
	EventID   string         `json:"eventId"`
	Type      string         `json:"type"`
	Data      ShumeiTextData `json:"data"`
}

// ShumeiTextData 文本数据
type ShumeiTextData struct {
	Text    string `json:"text"`
	TokenID string `json:"tokenId"`
}

// ShumeiResponse 数美响应结构
type ShumeiResponse struct {
	Code      int                  `json:"code"`
	Message   string               `json:"message"`
	RequestID string               `json:"requestId"`
	Score     int                  `json:"score"`
	RiskLevel string               `json:"riskLevel"`
	Detail    ShumeiResponseDetail `json:"detail"`
}

// ShumeiResponseDetail 详细信息
type ShumeiResponseDetail struct {
	Model       string       `json:"model"`
	Risks       []ShumeiRisk `json:"risks"`
	Description string       `json:"description"`
}

// ShumeiRisk 风险信息
type ShumeiRisk struct {
	Label       string `json:"label"`
	Level       string `json:"level"`
	Probability int    `json:"probability"`
	Description string `json:"description"`
}

// ShumeiTokenLabel 分词标签
type ShumeiTokenLabel struct {
	Label       string `json:"label"`
	Level       string `json:"level"`
	SubLabel    string `json:"subLabel"`
	Probability int    `json:"probability"`
}

// ReviewContent 审核内容
func (crs *ContentReviewService) ReviewContent(ctx context.Context, title, content, userID string) error {
	if !crs.enabled {
		log.Infof("content review disabled by config, skip review for user=%s", userID)
		return nil
	}

	// 构建要审核的文本内容
	reviewText := title
	if content != "" {
		if title != "" {
			reviewText += "\n" + content
		} else {
			reviewText = content
		}
	}

	// 生成简单的tokenId
	tokenID := fmt.Sprintf("user_%s_%d", userID, time.Now().Unix())

	// 构建请求
	request := ShumeiRequest{
		AccessKey: AccessKey,
		AppID:     AppID,
		EventID:   crs.eventID,
		Type:      "TEXTRISK_POLITY",
		Data: ShumeiTextData{
			Text:    reviewText,
			TokenID: tokenID,
		},
	}

	// 序列化请求
	requestData, err := json.Marshal(request)
	if err != nil {
		log.Errorf("Failed to marshal shumei request: %v", err)
		return errors.InternalServer(reason.UnknownError).WithError(err).WithStack()
	}

	log.Infof("Shumei request: %s", string(requestData))

	// 发送HTTP请求
	resp, err := http.Post(ShumeiTextAPIURL, "application/json", bytes.NewBuffer(requestData))
	if err != nil {
		log.Errorf("Failed to send request to shumei: %v", err)
		return errors.InternalServer(reason.UnknownError).WithError(err).WithStack()
	}
	defer resp.Body.Close()

	// 读取响应
	responseData, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("Failed to read shumei response: %v", err)
		return errors.InternalServer(reason.UnknownError).WithError(err).WithStack()
	}

	// 添加调试日志
	log.Infof("Shumei API response status: %d", resp.StatusCode)
	log.Infof("Shumei API response body: %s", string(responseData))

	// 检查HTTP状态码
	if resp.StatusCode != 200 {
		return errors.BadRequest(reason.RequestFormatError).WithMsg(fmt.Sprintf("数美API调用失败，状态码: %d, 响应: %s", resp.StatusCode, string(responseData)))
	}

	// 解析响应
	var shumeiResp ShumeiResponse
	if err := json.Unmarshal(responseData, &shumeiResp); err != nil {
		log.Errorf("Failed to unmarshal shumei response: %v", err)
		log.Errorf("Response body was: %s", string(responseData))
		return errors.InternalServer(reason.UnknownError).WithError(err).WithStack()
	}

	// 记录审核日志
	log.Infof("Content review result: code=%d, riskLevel=%s, score=%d",
		shumeiResp.Code, shumeiResp.RiskLevel, shumeiResp.Score)

	// 判断审核结果
	if shumeiResp.Code != 1100 {
		// 处理特殊错误码 - 配置相关问题时采用降级策略（暂时通过）
		if shumeiResp.Code == 1902 {
			log.Warnf("数美审核配置问题，采用降级策略通过审核: %s", shumeiResp.Message)
			return nil // 暂时通过审核
		}

		// 其他错误直接返回
		errorMsg := "内容审核失败"
		if shumeiResp.Message != "" {
			errorMsg = fmt.Sprintf("内容审核失败: %s", shumeiResp.Message)
		}
		return errors.BadRequest(reason.RequestFormatError).WithMsg(errorMsg)
	}

	// 检查风险等级
	switch shumeiResp.RiskLevel {
	case "PASS":
		// 审核通过
		return nil
	case "REVIEW":
		// 需要人工审核，暂时当作不通过处理
		errorMsg := "内容需要人工审核，请修改后重新提交"
		if shumeiResp.Detail.Description != "" {
			errorMsg = fmt.Sprintf("内容审核未通过: %s", shumeiResp.Detail.Description)
		}
		return errors.BadRequest(reason.RequestFormatError).WithMsg(errorMsg)
	case "REJECT":
		// 审核不通过
		errorMsg := "内容审核未通过，请修改后重新提交"
		if len(shumeiResp.Detail.Risks) > 0 {
			errorMsg = fmt.Sprintf("内容审核未通过: %s", shumeiResp.Detail.Risks[0].Description)
		} else if shumeiResp.Detail.Description != "" {
			errorMsg = fmt.Sprintf("内容审核未通过: %s", shumeiResp.Detail.Description)
		}
		return errors.BadRequest(reason.RequestFormatError).WithMsg(errorMsg)
	default:
		return errors.BadRequest(reason.RequestFormatError).WithMsg("内容审核状态未知，请重试")
	}
}
