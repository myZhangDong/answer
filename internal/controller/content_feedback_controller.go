package controller

import (
	"net/url"

	"github.com/apache/answer/internal/base/constant"
	"github.com/apache/answer/internal/base/handler"
	"github.com/apache/answer/internal/schema"
	feedbackservice "github.com/apache/answer/internal/service/content_feedback"
	"github.com/apache/answer/internal/service/siteinfo_common"
	"github.com/gin-gonic/gin"
	"github.com/segmentfault/pacman/log"
)

type ContentFeedbackController struct {
	service               *feedbackservice.ContentFeedbackService
	siteInfoCommonService siteinfo_common.SiteInfoCommonService
}

func NewContentFeedbackController(
	service *feedbackservice.ContentFeedbackService,
	siteInfoCommonService siteinfo_common.SiteInfoCommonService,
) *ContentFeedbackController {
	return &ContentFeedbackController{
		service:               service,
		siteInfoCommonService: siteInfoCommonService,
	}
}

func (c *ContentFeedbackController) GetFeedback(ctx *gin.Context) {
	req := &schema.ContentFeedbackReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	anonToken, _ := ctx.Cookie(constant.ContentFeedbackAnonCookieKey)
	resp, err := c.service.GetFeedback(ctx, req, anonToken)
	handler.HandleResponse(ctx, err, resp)
}

func (c *ContentFeedbackController) BatchGetFeedback(ctx *gin.Context) {
	req := &schema.ContentFeedbackBatchReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	anonToken, _ := ctx.Cookie(constant.ContentFeedbackAnonCookieKey)
	resp, err := c.service.GetFeedbackBatch(ctx, req, anonToken)
	handler.HandleResponse(ctx, err, resp)
}

func (c *ContentFeedbackController) Like(ctx *gin.Context) {
	req := &schema.ContentFeedbackReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	anonToken, _ := ctx.Cookie(constant.ContentFeedbackAnonCookieKey)
	resp, tokenValue, created, err := c.service.SubmitLike(ctx, req, anonToken, ctx.ClientIP(), ctx.Request.UserAgent())
	if err == nil && created {
		c.setAnonTokenCookie(ctx, tokenValue)
	}
	handler.HandleResponse(ctx, err, resp)
}

func (c *ContentFeedbackController) Rating(ctx *gin.Context) {
	req := &schema.ContentFeedbackRatingReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	anonToken, _ := ctx.Cookie(constant.ContentFeedbackAnonCookieKey)
	resp, tokenValue, created, err := c.service.SubmitRating(ctx, req, anonToken, ctx.ClientIP(), ctx.Request.UserAgent())
	if err == nil && created {
		c.setAnonTokenCookie(ctx, tokenValue)
	}
	handler.HandleResponse(ctx, err, resp)
}

func (c *ContentFeedbackController) setAnonTokenCookie(ctx *gin.Context, anonToken string) {
	general, err := c.siteInfoCommonService.GetSiteGeneral(ctx)
	if err != nil {
		log.Errorf("get site general error: %v", err)
		ctx.SetCookie(constant.ContentFeedbackAnonCookieKey, anonToken, constant.ContentFeedbackAnonCookieTime, "/", "", false, true)
		return
	}

	parsedURL, err := url.Parse(general.SiteUrl)
	if err != nil {
		log.Errorf("parse site url error: %v", err)
		ctx.SetCookie(constant.ContentFeedbackAnonCookieKey, anonToken, constant.ContentFeedbackAnonCookieTime, "/", "", false, true)
		return
	}

	secure := parsedURL.Scheme == "https"
	ctx.SetCookie(
		constant.ContentFeedbackAnonCookieKey,
		anonToken,
		constant.ContentFeedbackAnonCookieTime,
		"/",
		parsedURL.Hostname(),
		secure,
		true,
	)
}
