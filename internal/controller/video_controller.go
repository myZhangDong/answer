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

package controller

import (
	"github.com/apache/answer/internal/base/handler"
	"github.com/apache/answer/internal/base/middleware"
	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/schema"
	videocommon "github.com/apache/answer/internal/service/video_common"
	"github.com/gin-gonic/gin"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
)

// VideoController video controller
type VideoController struct {
	videoService *videocommon.VideoCommon
}

// NewVideoController new video controller
func NewVideoController(videoService *videocommon.VideoCommon) *VideoController {
	return &VideoController{
		videoService: videoService,
	}
}

// GetVideo get video info
// @Summary get video info
// @Description get video info
// @Tags Video
// @Accept json
// @Produce json
// @Param id query string true "video id"
// @Success 200 {object} handler.RespBody{data=schema.VideoInfoResp}
// @Router /answer/api/v1/video/info [get]
func (vc *VideoController) GetVideo(ctx *gin.Context) {
	req := &schema.GetVideoReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	resp, err := vc.videoService.GetVideo(ctx, req)
	handler.HandleResponse(ctx, err, resp)
}

// VideoPage get video page
// @Summary get video page
// @Description get video page
// @Tags Video
// @Accept json
// @Produce json
// @Param page query int false "page number"
// @Param page_size query int false "page size"
// @Param order query string false "order condition" Enums(newest, active, hot, recommend)
// @Param type query string false "video type"
// @Param search query string false "search keyword"
// @Success 200 {object} handler.RespBody{data=pager.PageModel{list=[]schema.VideoPageResp}}
// @Router /answer/api/v1/video/page [get]
func (vc *VideoController) VideoPage(ctx *gin.Context) {
	req := &schema.VideoPageReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	resp, total, err := vc.videoService.GetVideoPage(ctx, req)
	if err != nil {
		handler.HandleResponse(ctx, err, nil)
		return
	}

	handler.HandleResponse(ctx, nil, gin.H{
		"count": total,
		"list":  resp,
	})
}

// CreateVideo create video
// @Summary create video
// @Description create video
// @Tags Video
// @Accept json
// @Produce json
// @Param data body schema.CreateVideoReq true "video data"
// @Success 200 {object} handler.RespBody{data=schema.VideoCreateResp}
// @Router /answer/api/v1/video/create [post]
func (vc *VideoController) CreateVideo(ctx *gin.Context) {
	log.Infof("CreateVideo: Starting request")

	req := &schema.CreateVideoReq{}
	if handler.BindAndCheck(ctx, req) {
		log.Errorf("CreateVideo: Request binding failed")
		return
	}

	log.Infof("CreateVideo: Request bound successfully, title=%s, author_name=%s", req.Title, req.AuthorName)

	// Set user ID from context
	req.UserID = middleware.GetLoginUserIDFromContext(ctx)
	log.Infof("CreateVideo: UserID from context=%s", req.UserID)

	if req.UserID == "" {
		log.Warnf("CreateVideo: UserID is empty, user might not be authenticated")
	}

	log.Infof("CreateVideo: Calling service layer")
	resp, err := vc.videoService.CreateVideo(ctx, req)
	if err != nil {
		log.Errorf("CreateVideo: Service layer error: %v", err)
	} else {
		log.Infof("CreateVideo: Service layer success, video ID=%s", resp.ID)
	}

	handler.HandleResponse(ctx, err, resp)
}

// UpdateVideo update video
// @Summary update video
// @Description update video
// @Tags Video
// @Accept json
// @Produce json
// @Param data body schema.UpdateVideoReq true "video data"
// @Success 200 {object} handler.RespBody{data=schema.VideoUpdateResp}
// @Router /answer/api/v1/video/update [put]
func (vc *VideoController) UpdateVideo(ctx *gin.Context) {
	req := &schema.UpdateVideoReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	resp, err := vc.videoService.UpdateVideo(ctx, req)
	handler.HandleResponse(ctx, err, resp)
}

// DeleteVideo delete video
// @Summary delete video
// @Description delete video
// @Tags Video
// @Accept json
// @Produce json
// @Param data body schema.DeleteVideoReq true "video id"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/video/delete [delete]
func (vc *VideoController) DeleteVideo(ctx *gin.Context) {
	req := &schema.DeleteVideoReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	err := vc.videoService.DeleteVideo(ctx, req)
	handler.HandleResponse(ctx, err, nil)
}

// BatchDeleteVideo batch delete videos
// @Summary batch delete videos
// @Description batch delete videos
// @Tags Video
// @Accept json
// @Produce json
// @Param data body []string true "video ids"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/video/batch-delete [delete]
func (vc *VideoController) BatchDeleteVideo(ctx *gin.Context) {
	var videoIDs []string
	if err := ctx.ShouldBindJSON(&videoIDs); err != nil {
		handler.HandleResponse(ctx, errors.BadRequest(reason.RequestFormatError), nil)
		return
	}

	// Validate that we have at least one ID
	if len(videoIDs) == 0 {
		handler.HandleResponse(ctx, errors.BadRequest(reason.RequestFormatError), nil)
		return
	}

	err := vc.videoService.BatchDeleteVideo(ctx, videoIDs)
	handler.HandleResponse(ctx, err, nil)
}
