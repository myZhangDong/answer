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

package schema

import (
	"time"
)

// VideoPageReq video page request
type VideoPageReq struct {
	Page      int    `validate:"omitempty,min=1" form:"page"`
	PageSize  int    `validate:"omitempty,min=1" form:"page_size"`
	OrderCond string `validate:"omitempty,oneof=newest active hot recommend" form:"order"`
	Type      string `validate:"omitempty,lte=50" form:"type"`
	Search    string `validate:"omitempty,lte=100" form:"search"`
}

// VideoInfoResp video info response
type VideoInfoResp struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	IsRecommend  bool      `json:"is_recommend"`
	IsShow       bool      `json:"is_show"`
	Cover        string    `json:"cover"`
	Description  string    `json:"description"`
	Content      string    `json:"content"`
	AuthorAvatar string    `json:"author_avatar"`
	AuthorName   string    `json:"author_name"`
	AuthorIntro  string    `json:"author_intro"`
	ExternalLink string    `json:"external_link"`
	Code         string    `json:"code"`
	Duration     int       `json:"duration"`
	Type         string    `json:"type"`
	Datetime     time.Time `json:"datetime"`
	UID          string    `json:"uid"`
	ViewCount    int       `json:"view_count"`
	Status       int       `json:"status"`
	CreatedAt    int64     `json:"created_at"`
	UpdatedAt    int64     `json:"updated_at"`
}

// VideoPageResp video page response
type VideoPageResp struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	IsRecommend  bool   `json:"is_recommend"`
	IsShow       bool   `json:"is_show"`
	Cover        string `json:"cover"`
	Description  string `json:"description"`
	AuthorAvatar string `json:"author_avatar"`
	AuthorName   string `json:"author_name"`
	AuthorIntro  string `json:"author_intro"`
	ExternalLink string `json:"external_link"`
	Code         string `json:"code"`
	Duration     int    `json:"duration"`
	Type         string `json:"type"`
	ViewCount    int    `json:"view_count"`
	CreatedAt    int64  `json:"created_at"`
}

// GetVideoReq get video request
type GetVideoReq struct {
	ID string `validate:"required" form:"id"`
}

// CreateVideoReq create video request
type CreateVideoReq struct {
	UserID       string `json:"-"` // Set by controller, not from request body
	Title        string `validate:"required,lte=200" json:"title"`
	Category     string `validate:"omitempty,lte=50" json:"category"`
	Cover        string `validate:"omitempty,lte=500" json:"cover"`
	VideoType    string `validate:"omitempty,oneof=recorded live" json:"video_type"`
	IsRecommend  bool   `json:"is_recommend"`
	IsShow       bool   `json:"is_show"`
	StartTime    string `validate:"omitempty" json:"start_time"`
	Duration     int    `validate:"omitempty,min=0" json:"duration"`
	Description  string `validate:"omitempty,lte=1000" json:"description"`
	Content      string `validate:"omitempty" json:"content"`
	AuthorAvatar string `validate:"omitempty,lte=500" json:"author_avatar"`
	AuthorName   string `validate:"required,lte=100" json:"author_name"`
	AuthorIntro  string `validate:"omitempty,lte=500" json:"author_intro"`
	Topics       string `validate:"omitempty,lte=200" json:"topics"`
	EmbedCode    string `validate:"omitempty,lte=5000" json:"embed_code"`
	ExternalLink string `validate:"omitempty,lte=500" json:"external_link"`
}

// UpdateVideoReq update video request
type UpdateVideoReq struct {
	ID           string `validate:"required" json:"id"`
	Title        string `validate:"required,lte=200" json:"title"`
	Category     string `validate:"omitempty,lte=50" json:"category"`
	Cover        string `validate:"omitempty,lte=500" json:"cover"`
	VideoType    string `validate:"omitempty,oneof=recorded live" json:"video_type"`
	IsRecommend  bool   `json:"is_recommend"`
	IsShow       bool   `json:"is_show"`
	StartTime    string `validate:"omitempty" json:"start_time"`
	Duration     int    `validate:"omitempty,min=0" json:"duration"`
	Description  string `validate:"omitempty,lte=1000" json:"description"`
	Content      string `validate:"omitempty" json:"content"`
	AuthorAvatar string `validate:"omitempty,lte=500" json:"author_avatar"`
	AuthorName   string `validate:"required,lte=100" json:"author_name"`
	AuthorIntro  string `validate:"omitempty,lte=500" json:"author_intro"`
	Topics       string `validate:"omitempty,lte=200" json:"topics"`
	EmbedCode    string `validate:"omitempty,lte=5000" json:"embed_code"`
	ExternalLink string `validate:"omitempty,lte=500" json:"external_link"`
}

// DeleteVideoReq delete video request
type DeleteVideoReq struct {
	ID string `validate:"required" json:"id"`
}

// VideoCreateResp video create response
type VideoCreateResp struct {
	ID string `json:"id"`
}

// VideoUpdateResp video update response
type VideoUpdateResp struct {
	ID string `json:"id"`
}
