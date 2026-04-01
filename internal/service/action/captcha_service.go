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

package action

import (
	"context"
	"strings"

	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/schema"
	"github.com/apache/answer/pkg/token"
	"github.com/apache/answer/plugin"
	"github.com/mojocn/base64Captcha"
	"github.com/segmentfault/pacman/log"
)

var demoFormCaptchaDriver = base64Captcha.NewDriverDigit(44, 140, 4, 0.6, 48)

// CaptchaRepo captcha repository
type CaptchaRepo interface {
	SetCaptcha(ctx context.Context, key, captcha string) (err error)
	GetCaptcha(ctx context.Context, key string) (captcha string, err error)
	DelCaptcha(ctx context.Context, key string) (err error)
	SetActionType(ctx context.Context, unit, actionType, config string, amount int) (err error)
	GetActionType(ctx context.Context, unit, actionType string) (actioninfo *entity.ActionRecordInfo, err error)
	DelActionType(ctx context.Context, unit, actionType string) (err error)
}

// CaptchaService kit service
type CaptchaService struct {
	captchaRepo CaptchaRepo
}

// NewCaptchaService captcha service
func NewCaptchaService(captchaRepo CaptchaRepo) *CaptchaService {
	return &CaptchaService{
		captchaRepo: captchaRepo,
	}
}

// ActionRecord action record
func (cs *CaptchaService) ActionRecord(ctx context.Context, req *schema.ActionRecordReq) (resp *schema.ActionRecordResp, err error) {
	resp = &schema.ActionRecordResp{}
	unit := req.IP
	switch req.Action {
	case entity.CaptchaActionEditUserinfo:
		unit = req.UserID
	case entity.CaptchaActionQuestion:
		unit = req.UserID
	case entity.CaptchaActionAnswer:
		unit = req.UserID
	case entity.CaptchaActionComment:
		unit = req.UserID
	case entity.CaptchaActionEdit:
		unit = req.UserID
	case entity.CaptchaActionInvitationAnswer:
		unit = req.UserID
	case entity.CaptchaActionSearch:
		if req.UserID != "" {
			unit = req.UserID
		}
	case entity.CaptchaActionReport:
		unit = req.UserID
	case entity.CaptchaActionDelete:
		unit = req.UserID
	case entity.CaptchaActionVote:
		unit = req.UserID
	case entity.CaptchaActionDemoForm:
		unit = req.IP
	}
	verificationResult := cs.ValidationStrategy(ctx, unit, req.Action)
	if !verificationResult {
		resp.Verify = true
		resp.CaptchaID, resp.CaptchaImg, err = cs.GenerateCaptcha(ctx, req.Action)
		if err != nil {
			log.Errorf("GenerateCaptcha error: %v", err)
		}
	}
	return
}

// ActionRecordVerifyCaptcha
// Verify that you need to enter a CAPTCHA, and that the CAPTCHA is correct
func (cs *CaptchaService) ActionRecordVerifyCaptcha(
	ctx context.Context, actionType string, unit string, captchaID string, captchaCode string,
) bool {
	verificationResult := cs.ValidationStrategy(ctx, unit, actionType)
	if verificationResult {
		return true
	}
	pass, err := cs.VerifyCaptcha(ctx, actionType, captchaID, captchaCode)
	if err != nil {
		return false
	}
	return pass
}

func (cs *CaptchaService) ActionRecordAdd(ctx context.Context, actionType string, unit string) (int, error) {
	info, err := cs.captchaRepo.GetActionType(ctx, unit, actionType)
	if err != nil {
		log.Error(err)
		return 0, err
	}
	amount := 1
	if info != nil {
		amount = info.Num + 1
	}
	err = cs.captchaRepo.SetActionType(ctx, unit, actionType, "", amount)
	if err != nil {
		return 0, err
	}
	return amount, nil
}

func (cs *CaptchaService) ActionRecordDel(ctx context.Context, actionType string, unit string) {
	err := cs.captchaRepo.DelActionType(ctx, unit, actionType)
	if err != nil {
		log.Error(err)
	}
}

// GenerateCaptcha generate captcha
func (cs *CaptchaService) GenerateCaptcha(ctx context.Context, actionType string) (key, captchaBase64 string, err error) {
	if actionType == entity.CaptchaActionDemoForm {
		return cs.generateDemoFormCaptcha(ctx)
	}

	realCaptcha := ""
	key = token.GenerateToken()
	_ = plugin.CallCaptcha(func(fn plugin.Captcha) error {
		if captcha, code := fn.Create(); len(code) > 0 {
			captchaBase64 = captcha
			realCaptcha = code
		}
		return nil
	})
	if len(realCaptcha) == 0 {
		return key, captchaBase64, nil
	}

	err = cs.captchaRepo.SetCaptcha(ctx, key, realCaptcha)
	return key, captchaBase64, err
}

// VerifyCaptcha generate captcha
func (cs *CaptchaService) VerifyCaptcha(ctx context.Context, actionType string, key, captcha string) (isCorrect bool, err error) {
	if actionType == entity.CaptchaActionDemoForm {
		return cs.verifyDemoFormCaptcha(ctx, key, captcha)
	}

	realCaptcha, _ := cs.captchaRepo.GetCaptcha(ctx, key)

	_ = plugin.CallCaptcha(func(fn plugin.Captcha) error {
		isCorrect = fn.Verify(realCaptcha, captcha)
		return nil
	})

	_ = cs.captchaRepo.DelCaptcha(ctx, key)
	return isCorrect, nil
}

func (cs *CaptchaService) generateDemoFormCaptcha(ctx context.Context) (key, captchaBase64 string, err error) {
	key, content, realCaptcha := demoFormCaptchaDriver.GenerateIdQuestionAnswer()
	item, err := demoFormCaptchaDriver.DrawCaptcha(content)
	if err != nil {
		return "", "", err
	}
	captchaBase64 = item.EncodeB64string()
	err = cs.captchaRepo.SetCaptcha(ctx, key, realCaptcha)
	return key, captchaBase64, err
}

func (cs *CaptchaService) verifyDemoFormCaptcha(ctx context.Context, key, captcha string) (bool, error) {
	realCaptcha, err := cs.captchaRepo.GetCaptcha(ctx, key)
	if err != nil {
		return false, err
	}
	_ = cs.captchaRepo.DelCaptcha(ctx, key)
	return strings.EqualFold(strings.TrimSpace(realCaptcha), strings.TrimSpace(captcha)), nil
}
