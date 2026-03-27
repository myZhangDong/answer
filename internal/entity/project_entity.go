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

import "time"

// Project 开源项目实体
type Project struct {
	ID          string    `xorm:"not null pk autoincr BIGINT(20) id"`
	Title       string    `xorm:"not null default '' VARCHAR(255) title"`
	Description string    `xorm:"TEXT description"`
	Cover       string    `xorm:"not null default '' VARCHAR(500) cover"`
	Content     string    `xorm:"LONGTEXT content"`
	RepoURL     string    `xorm:"TEXT repo_url"`
	CodeType    int       `xorm:"not null default 1 INT(11) code_type"`
	Tags        string    `xorm:"not null default '' VARCHAR(500) tags"`
	QuestionID  string    `xorm:"not null default 0 BIGINT(20) question_id"`
	UserID      string    `xorm:"not null default 0 BIGINT(20) user_id"`
	Status      int       `xorm:"not null default 1 INT(11) status"`
	CreatedAt   time.Time `xorm:"created TIMESTAMP created_at"`
	UpdatedAt   time.Time `xorm:"updated TIMESTAMP updated_at"`
}

// TableName 表名
func (Project) TableName() string {
	return "project"
}

// 项目状态常量
const (
	ProjectStatusAvailable = 1  // 可用
	ProjectStatusDeleted   = 10 // 已删除
)

// 代码类型常量
const (
	CodeTypeWeb     = 1 // Web项目
	CodeTypeMobile  = 2 // 移动端项目
	CodeTypeDesktop = 3 // 桌面应用
)
