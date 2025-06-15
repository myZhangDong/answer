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

package video

import (
	"context"

	"github.com/apache/answer/internal/base/data"
	"github.com/apache/answer/internal/base/pager"
	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/service/unique"
	videocommon "github.com/apache/answer/internal/service/video_common"
	"github.com/apache/answer/pkg/uid"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
	"xorm.io/builder"
)

// videoRepo video repository
type videoRepo struct {
	data         *data.Data
	uniqueIDRepo unique.UniqueIDRepo
}

// NewVideoRepo new repository
func NewVideoRepo(data *data.Data, uniqueIDRepo unique.UniqueIDRepo) videocommon.VideoRepo {
	return &videoRepo{
		data:         data,
		uniqueIDRepo: uniqueIDRepo,
	}
}

// GetVideo get video by id
func (vr *videoRepo) GetVideo(ctx context.Context, id string) (video *entity.Video, exist bool, err error) {
	id = uid.DeShortID(id)
	video = &entity.Video{}
	exist, err = vr.data.DB.Context(ctx).ID(id).Get(video)
	if err != nil {
		return nil, false, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	if exist {
		video.ID = uid.EnShortID(video.ID)
	}
	return video, exist, nil
}

// GetVideoPage get video page
func (vr *videoRepo) GetVideoPage(ctx context.Context, page, pageSize int, orderCond, videoType, search string) (
	videoList []*entity.Video, total int64, err error) {

	videoList = make([]*entity.Video, 0)
	session := vr.data.DB.Context(ctx).Where("status = ?", entity.VideoStatusAvailable).And("is_show = ?", entity.VideoShow)

	// Add search condition
	if search != "" {
		session = session.And(builder.Like{"title", search}.Or(builder.Like{"description", search}))
	}

	// Add type filter
	if videoType != "" {
		session = session.And("type = ?", videoType)
	}

	// Add order condition
	switch orderCond {
	case "newest":
		session = session.OrderBy("created_at DESC")
	case "active":
		session = session.OrderBy("updated_at DESC")
	case "hot":
		session = session.OrderBy("view_count DESC")
	case "recommend":
		session = session.And("is_recommend = ?", entity.VideoRecommend).OrderBy("created_at DESC")
	default:
		session = session.OrderBy("created_at DESC")
	}

	total, err = pager.Help(page, pageSize, &videoList, &entity.Video{}, session)
	if err != nil {
		err = errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
		return
	}

	// Convert IDs to short format
	for _, video := range videoList {
		video.ID = uid.EnShortID(video.ID)
	}

	return videoList, total, nil
}

// UpdateViewCount update video view count
func (vr *videoRepo) UpdateViewCount(ctx context.Context, videoID string) (err error) {
	videoID = uid.DeShortID(videoID)
	video := &entity.Video{}
	_, err = vr.data.DB.Context(ctx).Where("id = ?", videoID).Incr("view_count", 1).Update(video)
	if err != nil {
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	return nil
}

// GetVideoCount get video count
func (vr *videoRepo) GetVideoCount(ctx context.Context) (count int64, err error) {
	count, err = vr.data.DB.Context(ctx).Count(&entity.Video{Status: entity.VideoStatusAvailable})
	if err != nil {
		return 0, errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	return count, nil
}

// CreateVideo create video
func (vr *videoRepo) CreateVideo(ctx context.Context, video *entity.Video) (err error) {
	log.Infof("VideoRepo.CreateVideo: Starting, Title=%s, AuthorName=%s, UID=%s", video.Title, video.AuthorName, video.UID)

	video.ID, err = vr.uniqueIDRepo.GenUniqueIDStr(ctx, video.TableName())
	if err != nil {
		log.Errorf("VideoRepo.CreateVideo: Failed to generate unique ID: %v", err)
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	log.Infof("VideoRepo.CreateVideo: Generated ID=%s", video.ID)

	log.Infof("VideoRepo.CreateVideo: About to insert video entity: Title=%s, Type=%s, AuthorName=%s, UID=%s, Code length=%d",
		video.Title, video.Type, video.AuthorName, video.UID, len(video.Code))

	_, err = vr.data.DB.Context(ctx).Insert(video)
	if err != nil {
		log.Errorf("VideoRepo.CreateVideo: Database insert failed: %v", err)
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}

	log.Infof("VideoRepo.CreateVideo: Database insert successful")
	video.ID = uid.EnShortID(video.ID)
	log.Infof("VideoRepo.CreateVideo: Converted to short ID=%s", video.ID)

	return nil
}

// UpdateVideo update video
func (vr *videoRepo) UpdateVideo(ctx context.Context, video *entity.Video) (err error) {
	video.ID = uid.DeShortID(video.ID)
	_, err = vr.data.DB.Context(ctx).Where("id = ?", video.ID).Update(video)
	if err != nil {
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	video.ID = uid.EnShortID(video.ID)
	return nil
}

// DeleteVideo delete video
func (vr *videoRepo) DeleteVideo(ctx context.Context, videoID string) (err error) {
	videoID = uid.DeShortID(videoID)

	// Check if video exists
	video := &entity.Video{}
	exist, err := vr.data.DB.Context(ctx).ID(videoID).Get(video)
	if err != nil {
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}
	if !exist {
		return errors.BadRequest(reason.ObjectNotFound)
	}

	// Soft delete by updating status
	_, err = vr.data.DB.Context(ctx).Where("id = ?", videoID).Update(&entity.Video{
		Status: entity.VideoStatusDeleted,
	})
	if err != nil {
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}

	return nil
}

// BatchDeleteVideo batch delete videos
func (vr *videoRepo) BatchDeleteVideo(ctx context.Context, videoIDs []string) (err error) {
	if len(videoIDs) == 0 {
		return nil
	}

	// Convert short IDs to long IDs
	longIDs := make([]string, len(videoIDs))
	for i, id := range videoIDs {
		longIDs[i] = uid.DeShortID(id)
	}

	// Batch soft delete by updating status
	_, err = vr.data.DB.Context(ctx).In("id", longIDs).Update(&entity.Video{
		Status: entity.VideoStatusDeleted,
	})
	if err != nil {
		return errors.InternalServer(reason.DatabaseError).WithError(err).WithStack()
	}

	return nil
}
