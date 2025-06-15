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

package videocommon

import (
	"context"
	"time"

	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/schema"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
)

// VideoRepo video repository interface
type VideoRepo interface {
	GetVideo(ctx context.Context, id string) (video *entity.Video, exist bool, err error)
	GetVideoPage(ctx context.Context, page, pageSize int, orderCond, videoType, search string) (videoList []*entity.Video, total int64, err error)
	UpdateViewCount(ctx context.Context, videoID string) (err error)
	GetVideoCount(ctx context.Context) (count int64, err error)
	CreateVideo(ctx context.Context, video *entity.Video) (err error)
	UpdateVideo(ctx context.Context, video *entity.Video) (err error)
	DeleteVideo(ctx context.Context, videoID string) (err error)
	BatchDeleteVideo(ctx context.Context, videoIDs []string) (err error)
}

// VideoCommon video service
type VideoCommon struct {
	videoRepo VideoRepo
}

// NewVideoCommon new video service
func NewVideoCommon(videoRepo VideoRepo) *VideoCommon {
	return &VideoCommon{
		videoRepo: videoRepo,
	}
}

// GetVideo get video info
func (vs *VideoCommon) GetVideo(ctx context.Context, req *schema.GetVideoReq) (resp *schema.VideoInfoResp, err error) {
	video, exist, err := vs.videoRepo.GetVideo(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errors.BadRequest(reason.ObjectNotFound)
	}

	// Update view count
	_ = vs.videoRepo.UpdateViewCount(ctx, req.ID)

	resp = &schema.VideoInfoResp{
		ID:           video.ID,
		Title:        video.Title,
		IsRecommend:  video.IsRecommend == entity.VideoRecommend,
		IsShow:       video.IsShow == entity.VideoShow,
		Cover:        video.Cover,
		Description:  video.Description,
		Content:      video.Content,
		AuthorAvatar: video.AuthorAvatar,
		AuthorName:   video.AuthorName,
		AuthorIntro:  video.AuthorIntro,
		ExternalLink: video.ExternalLink,
		Code:         video.Code,
		Duration:     video.Duration,
		Type:         video.Type,
		Datetime:     video.Datetime,
		UID:          video.UID,
		ViewCount:    video.ViewCount + 1, // Include the new view
		Status:       video.Status,
		CreatedAt:    video.CreatedAt.Unix(),
		UpdatedAt:    video.UpdatedAt.Unix(),
	}
	return resp, nil
}

// GetVideoPage get video page
func (vs *VideoCommon) GetVideoPage(ctx context.Context, req *schema.VideoPageReq) (resp []*schema.VideoPageResp, total int64, err error) {
	page := req.Page
	pageSize := req.PageSize
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	videoList, total, err := vs.videoRepo.GetVideoPage(ctx, page, pageSize, req.OrderCond, req.Type, req.Search)
	if err != nil {
		return nil, 0, err
	}

	resp = make([]*schema.VideoPageResp, 0, len(videoList))
	for _, video := range videoList {
		resp = append(resp, &schema.VideoPageResp{
			ID:           video.ID,
			Title:        video.Title,
			IsRecommend:  video.IsRecommend == entity.VideoRecommend,
			IsShow:       video.IsShow == entity.VideoShow,
			Cover:        video.Cover,
			Description:  video.Description,
			AuthorAvatar: video.AuthorAvatar,
			AuthorName:   video.AuthorName,
			AuthorIntro:  video.AuthorIntro,
			ExternalLink: video.ExternalLink,
			Code:         video.Code,
			Duration:     video.Duration,
			Type:         video.Type,
			ViewCount:    video.ViewCount,
			CreatedAt:    video.CreatedAt.Unix(),
		})
	}

	return resp, total, nil
}

// GetVideoCount get video count
func (vs *VideoCommon) GetVideoCount(ctx context.Context) (count int64, err error) {
	return vs.videoRepo.GetVideoCount(ctx)
}

// CreateVideo create video
func (vs *VideoCommon) CreateVideo(ctx context.Context, req *schema.CreateVideoReq) (resp *schema.VideoCreateResp, err error) {
	log.Infof("VideoService.CreateVideo: Starting, userID=%s", req.UserID)

	// Use UserID from request (set by controller)
	userID := req.UserID

	now := time.Now()
	video := &entity.Video{
		Title:        req.Title,
		Type:         req.Category,
		IsRecommend:  entity.VideoNotRecommend,
		IsShow:       entity.VideoHide,
		Cover:        req.Cover,
		Description:  req.Description,
		Content:      req.Content,
		AuthorAvatar: req.AuthorAvatar,
		AuthorName:   req.AuthorName,
		AuthorIntro:  req.AuthorIntro,
		ExternalLink: req.ExternalLink,
		Code:         req.EmbedCode,
		Duration:     req.Duration,
		CreatedAt:    now,
		UpdatedAt:    now,
		Datetime:     now,
		UID:          userID,
		ViewCount:    0,
		Status:       entity.VideoStatusAvailable,
	}

	log.Infof("VideoService.CreateVideo: Video entity created, Title=%s, AuthorName=%s, UID=%s, Type=%s",
		video.Title, video.AuthorName, video.UID, video.Type)

	// Ensure all NOT NULL fields have values (set defaults if empty)
	if video.Title == "" {
		video.Title = "Untitled Video"
		log.Warnf("VideoService.CreateVideo: Title was empty, set to default")
	}
	if video.Type == "" {
		video.Type = "general"
		log.Warnf("VideoService.CreateVideo: Type was empty, set to 'general'")
	}
	if video.Cover == "" {
		video.Cover = ""
	}
	if video.AuthorAvatar == "" {
		video.AuthorAvatar = ""
	}
	if video.AuthorName == "" {
		video.AuthorName = "Unknown Author"
		log.Warnf("VideoService.CreateVideo: AuthorName was empty, set to default")
	}
	if video.ExternalLink == "" {
		video.ExternalLink = ""
	}
	if video.Code == "" {
		video.Code = ""
	}

	// Set recommend status
	if req.IsRecommend {
		video.IsRecommend = entity.VideoRecommend
		log.Infof("VideoService.CreateVideo: Set as recommended")
	}

	// Set show status
	if req.IsShow {
		video.IsShow = entity.VideoShow
		log.Infof("VideoService.CreateVideo: Set as visible")
	}

	log.Infof("VideoService.CreateVideo: Final video entity - Title=%s, Type=%s, AuthorName=%s, UID=%s, Status=%d, IsShow=%d, IsRecommend=%d",
		video.Title, video.Type, video.AuthorName, video.UID, video.Status, video.IsShow, video.IsRecommend)

	log.Infof("VideoService.CreateVideo: Calling repository layer")
	err = vs.videoRepo.CreateVideo(ctx, video)
	if err != nil {
		log.Errorf("VideoService.CreateVideo: Repository error: %v", err)
		return nil, err
	}

	log.Infof("VideoService.CreateVideo: Repository success, video ID=%s", video.ID)

	resp = &schema.VideoCreateResp{
		ID: video.ID,
	}

	log.Infof("VideoService.CreateVideo: Completed successfully")
	return resp, nil
}

// UpdateVideo update video
func (vs *VideoCommon) UpdateVideo(ctx context.Context, req *schema.UpdateVideoReq) (resp *schema.VideoUpdateResp, err error) {
	// Check if video exists
	_, exist, err := vs.videoRepo.GetVideo(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errors.BadRequest(reason.ObjectNotFound)
	}

	video := &entity.Video{
		ID:           req.ID,
		Title:        req.Title,
		Type:         req.Category, // Use category as type
		IsRecommend:  entity.VideoNotRecommend,
		IsShow:       entity.VideoHide,
		Cover:        req.Cover,
		Description:  req.Description,
		Content:      req.Content,
		AuthorAvatar: req.AuthorAvatar,
		AuthorName:   req.AuthorName,
		AuthorIntro:  req.AuthorIntro,
		ExternalLink: req.ExternalLink,
		Code:         req.EmbedCode,
		Duration:     req.Duration,
	}

	// Set recommend status
	if req.IsRecommend {
		video.IsRecommend = entity.VideoRecommend
	}

	// Set show status
	if req.IsShow {
		video.IsShow = entity.VideoShow
	}

	err = vs.videoRepo.UpdateVideo(ctx, video)
	if err != nil {
		return nil, err
	}

	resp = &schema.VideoUpdateResp{
		ID: video.ID,
	}
	return resp, nil
}

// DeleteVideo delete video
func (vs *VideoCommon) DeleteVideo(ctx context.Context, req *schema.DeleteVideoReq) (err error) {
	// Check if video exists
	_, exist, err := vs.videoRepo.GetVideo(ctx, req.ID)
	if err != nil {
		return err
	}
	if !exist {
		return errors.BadRequest(reason.ObjectNotFound)
	}

	return vs.videoRepo.DeleteVideo(ctx, req.ID)
}

// BatchDeleteVideo batch delete videos
func (vs *VideoCommon) BatchDeleteVideo(ctx context.Context, videoIDs []string) (err error) {
	if len(videoIDs) == 0 {
		return nil
	}

	return vs.videoRepo.BatchDeleteVideo(ctx, videoIDs)
}
