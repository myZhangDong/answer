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

package entity

import (
	"time"
)

const (
	VideoStatusAvailable = 1
	VideoStatusDeleted   = 10
	VideoStatusPending   = 11
	VideoShow            = 1
	VideoHide            = 2
	VideoRecommend       = 1
	VideoNotRecommend    = 2
)

// Video video entity
type Video struct {
	ID           string    `xorm:"not null pk BIGINT(20) id"`
	CreatedAt    time.Time `xorm:"not null default CURRENT_TIMESTAMP TIMESTAMP created_at"`
	UpdatedAt    time.Time `xorm:"updated_at TIMESTAMP"`
	Title        string    `xorm:"not null default '' VARCHAR(200) title"`
	IsRecommend  int       `xorm:"not null default 2 TINYINT(1) is_recommend"` // 1: recommend, 2: not recommend
	IsShow       int       `xorm:"not null default 1 TINYINT(1) is_show"`      // 1: show, 2: hide
	Cover        string    `xorm:"not null default '' VARCHAR(500) cover"`
	Description  string    `xorm:"TEXT description"`
	Content      string    `xorm:"MEDIUMTEXT content"`
	AuthorAvatar string    `xorm:"not null default '' VARCHAR(500) author_avatar"`
	AuthorName   string    `xorm:"not null default '' VARCHAR(100) author_name"`
	AuthorIntro  string    `xorm:"TEXT author_intro"`
	ExternalLink string    `xorm:"not null default '' VARCHAR(500) external_link"`
	Code         string    `xorm:"not null default '' TEXT code"`
	Duration     int       `xorm:"not null default 0 INT(11) duration"` // duration in seconds
	Type         string    `xorm:"not null default '' VARCHAR(50) type"`
	Datetime     time.Time `xorm:"not null default CURRENT_TIMESTAMP TIMESTAMP datetime"`
	UID          string    `xorm:"not null default 0 BIGINT(20) uid"`
	ViewCount    int       `xorm:"not null default 0 INT(11) view_count"`
	Status       int       `xorm:"not null default 1 INT(11) status"`
}

// TableName video table name
func (Video) TableName() string {
	return "video"
}
