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
	"encoding/json"
)

// CreateProjectReq 创建项目请求
type CreateProjectReq struct {
	Title       string            `validate:"required,gte=1,lte=255" json:"title"`
	Description string            `validate:"required,gte=1,lte=1000" json:"description"`
	Cover       string            `validate:"omitempty,url" json:"cover"`
	Content     string            `validate:"required,gte=1" json:"content"`
	RepoURL     map[string]string `validate:"required" json:"repo_url"`
	CodeType    int               `validate:"required,oneof=1 2 3" json:"code_type"`
	Tags        []string          `validate:"omitempty" json:"tags"`
	QuestionID  string            `validate:"required" json:"question_id"`
}

// UpdateProjectReq 更新项目请求
type UpdateProjectReq struct {
	ID          string            `validate:"required" json:"id"`
	Title       string            `validate:"required,gte=1,lte=255" json:"title"`
	Description string            `validate:"required,gte=1,lte=1000" json:"description"`
	Cover       string            `validate:"omitempty,url" json:"cover"`
	Content     string            `validate:"required,gte=1" json:"content"`
	RepoURL     map[string]string `validate:"required" json:"repo_url"`
	CodeType    int               `validate:"required,oneof=1 2 3" json:"code_type"`
	Tags        []string          `validate:"omitempty" json:"tags"`
}

// GetProjectReq 获取项目请求
type GetProjectReq struct {
	ID string `validate:"required" form:"id"`
}

// ProjectPageReq 项目分页请求
type ProjectPageReq struct {
	Page     int    `validate:"omitempty,min=1" form:"page"`
	PageSize int    `validate:"omitempty,min=1" form:"page_size"`
	Search   string `validate:"omitempty,gte=1,lte=100" form:"search"`
	CodeType int    `validate:"omitempty,oneof=1 2 3" form:"code_type"`
	Tags     string `validate:"omitempty" form:"tags"`
	OrderBy  string `validate:"omitempty,oneof=created newest active hot" form:"order"`
}

// ProjectResp 项目响应
type ProjectResp struct {
	ID           string            `json:"id"`
	Title        string            `json:"title"`
	Description  string            `json:"description"`
	Cover        string            `json:"cover"`
	Content      string            `json:"content"`
	RepoURL      map[string]string `json:"repo_url"`
	CodeType     int               `json:"code_type"`
	CodeTypeName string            `json:"code_type_name"`
	Tags         []string          `json:"tags"`
	QuestionID   string            `json:"question_id"`
	UserID       string            `json:"user_id"`
	UserInfo     *UserBasicInfo    `json:"user_info"`
	ViewCount    int64             `json:"view_count"`
	VoteCount    int               `json:"vote_count"`
	AnswerCount  int               `json:"answer_count"`
	CreatedAt    int64             `json:"created_at"`
	UpdatedAt    int64             `json:"updated_at"`
}

// ProjectPageResp 项目分页响应
type ProjectPageResp struct {
	Count int64          `json:"count"`
	List  []*ProjectResp `json:"list"`
}

// RemoveProjectReq 删除项目请求
type RemoveProjectReq struct {
	ID string `validate:"required" json:"id"`
}

// BatchRemoveProjectReq 批量删除项目请求
type BatchRemoveProjectReq struct {
	IDs []string `validate:"required,min=1" json:"ids"`
}

type SubmitProjectDemoLeadReq struct {
	ProjectID   string `validate:"required" json:"project_id"`
	Phone       string `validate:"required,len=11,numeric" json:"phone"`
	CaptchaID   string `validate:"required" json:"captcha_id"`
	CaptchaCode string `validate:"required" json:"captcha_code"`
}

type SubmitProjectDemoLeadResp struct {
	Success bool `json:"success"`
}

// GetProjectRepoURLs 获取仓库地址
func (r *CreateProjectReq) GetProjectRepoURLs() string {
	if len(r.RepoURL) == 0 {
		return ""
	}
	data, _ := json.Marshal(r.RepoURL)
	return string(data)
}

// GetProjectTags 获取标签
func (r *CreateProjectReq) GetProjectTags() string {
	if len(r.Tags) == 0 {
		return ""
	}
	data, _ := json.Marshal(r.Tags)
	return string(data)
}

// GetProjectRepoURLs 获取仓库地址
func (r *UpdateProjectReq) GetProjectRepoURLs() string {
	if len(r.RepoURL) == 0 {
		return ""
	}
	data, _ := json.Marshal(r.RepoURL)
	return string(data)
}

// GetProjectTags 获取标签
func (r *UpdateProjectReq) GetProjectTags() string {
	if len(r.Tags) == 0 {
		return ""
	}
	data, _ := json.Marshal(r.Tags)
	return string(data)
}

// ParseRepoURL 解析仓库地址
func (r *ProjectResp) ParseRepoURL(repoURLStr string) {
	if repoURLStr == "" {
		r.RepoURL = make(map[string]string)
		return
	}
	var repoURL map[string]string
	if err := json.Unmarshal([]byte(repoURLStr), &repoURL); err != nil {
		r.RepoURL = make(map[string]string)
		return
	}
	r.RepoURL = repoURL
}

// ParseTags 解析标签
func (r *ProjectResp) ParseTags(tagsStr string) {
	if tagsStr == "" {
		r.Tags = make([]string, 0)
		return
	}
	var tags []string
	if err := json.Unmarshal([]byte(tagsStr), &tags); err != nil {
		r.Tags = make([]string, 0)
		return
	}
	r.Tags = tags
}

// GetCodeTypeName 获取代码类型名称
func (r *ProjectResp) GetCodeTypeName() {
	switch r.CodeType {
	case 1:
		r.CodeTypeName = "Web"
	case 2:
		r.CodeTypeName = "Mobile"
	case 3:
		r.CodeTypeName = "Desktop"
	default:
		r.CodeTypeName = "Unknown"
	}
}
