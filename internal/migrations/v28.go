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

package migrations

import (
	"context"
	"time"

	"github.com/apache/answer/internal/entity"
	"xorm.io/xorm"
)

func addVideoTestData(ctx context.Context, x *xorm.Engine) error {
	// 插入测试视频数据
	now := time.Now()

	videos := []*entity.Video{
		{
			ID:           "1000000000000001",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "Go语言入门教程",
			IsRecommend:  entity.VideoRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover1.jpg",
			Description:  "这是一个关于Go语言基础入门的视频教程，适合初学者学习。",
			Content:      "# Go语言入门教程\n\n本视频将带你从零开始学习Go语言...",
			AuthorAvatar: "https://example.com/avatar1.jpg",
			AuthorName:   "张老师",
			AuthorIntro:  "Go语言资深开发者，5年开发经验",
			ExternalLink: "https://www.youtube.com/watch?v=example1",
			Code:         "GO_TUTORIAL_001",
			Duration:     3600,
			Type:         "tutorial",
			Datetime:     now,
			UID:          "1",
			ViewCount:    0,
			Status:       entity.VideoStatusAvailable,
		},
		{
			ID:           "1000000000000002",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "React开发实战",
			IsRecommend:  entity.VideoRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover2.jpg",
			Description:  "从零到一构建React应用，包含最新的React Hooks使用方法。",
			Content:      "# React开发实战\n\n本课程将教你如何使用React构建现代化的Web应用...",
			AuthorAvatar: "https://example.com/avatar2.jpg",
			AuthorName:   "李老师",
			AuthorIntro:  "前端开发专家，React核心贡献者",
			ExternalLink: "https://www.youtube.com/watch?v=example2",
			Code:         "REACT_ADVANCED_002",
			Duration:     5400,
			Type:         "advanced",
			Datetime:     now,
			UID:          "2",
			ViewCount:    15,
			Status:       entity.VideoStatusAvailable,
		},
		{
			ID:           "1000000000000003",
			CreatedAt:    now,
			UpdatedAt:    now,
			Title:        "数据库设计原理",
			IsRecommend:  entity.VideoNotRecommend,
			IsShow:       entity.VideoShow,
			Cover:        "https://example.com/cover3.jpg",
			Description:  "深入理解数据库设计原理，掌握高效的数据库设计方法。",
			Content:      "# 数据库设计原理\n\n本视频将深入讲解数据库设计的核心原理...",
			AuthorAvatar: "https://example.com/avatar3.jpg",
			AuthorName:   "王老师",
			AuthorIntro:  "数据库架构师，10年数据库设计经验",
			ExternalLink: "https://www.youtube.com/watch?v=example3",
			Code:         "DB_DESIGN_003",
			Duration:     4800,
			Type:         "theory",
			Datetime:     now,
			UID:          "3",
			ViewCount:    8,
			Status:       entity.VideoStatusAvailable,
		},
	}

	for _, video := range videos {
		// 检查是否已存在，避免重复插入
		exists, err := x.Context(ctx).Where("id = ?", video.ID).Exist(&entity.Video{})
		if err != nil {
			return err
		}
		if !exists {
			_, err = x.Context(ctx).Insert(video)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
