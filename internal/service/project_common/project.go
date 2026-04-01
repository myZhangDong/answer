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

package projectcommon

import (
	"context"

	"github.com/apache/answer/internal/base/reason"
	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/schema"
	questioncommon "github.com/apache/answer/internal/service/question_common"
	"github.com/apache/answer/internal/service/service_config"
	usercommon "github.com/apache/answer/internal/service/user_common"
	"github.com/segmentfault/pacman/errors"
	"github.com/segmentfault/pacman/log"
)

// ProjectRepo project repository interface
type ProjectRepo interface {
	AddProject(ctx context.Context, project *entity.Project) (err error)
	RemoveProject(ctx context.Context, id string) (err error)
	UpdateProject(ctx context.Context, project *entity.Project, cols []string) (err error)
	GetProject(ctx context.Context, id string) (project *entity.Project, exist bool, err error)
	GetProjectList(ctx context.Context, req *schema.ProjectPageReq) (projectList []*entity.Project, total int64, err error)
	GetProjectByQuestionID(ctx context.Context, questionID string) (project *entity.Project, exist bool, err error)
}

// ProjectCommon project service
type ProjectCommon struct {
	projectRepo  ProjectRepo
	questionRepo questioncommon.QuestionRepo
	userRepo     usercommon.UserRepo
	serviceConf  *service_config.ServiceConfig
}

// NewProjectCommon new project service
func NewProjectCommon(
	projectRepo ProjectRepo,
	questionRepo questioncommon.QuestionRepo,
	userRepo usercommon.UserRepo,
	serviceConf *service_config.ServiceConfig,
) *ProjectCommon {
	return &ProjectCommon{
		projectRepo:  projectRepo,
		questionRepo: questionRepo,
		userRepo:     userRepo,
		serviceConf:  serviceConf,
	}
}

// AddProject add project
func (ps *ProjectCommon) AddProject(ctx context.Context, req *schema.CreateProjectReq) (err error) {
	// 检查问题是否存在
	questionInfo, exist, err := ps.questionRepo.GetQuestion(ctx, req.QuestionID)
	if err != nil {
		return err
	}
	if !exist {
		return errors.BadRequest(reason.QuestionNotFound)
	}

	// 检查该问题是否已经有项目
	_, exist, err = ps.projectRepo.GetProjectByQuestionID(ctx, req.QuestionID)
	if err != nil {
		return err
	}
	if exist {
		return errors.BadRequest(reason.RequestFormatError).WithMsg("该问题已经关联了项目")
	}

	// 创建项目
	projectEntity := &entity.Project{
		Title:       req.Title,
		Description: req.Description,
		Cover:       req.Cover,
		Content:     req.Content,
		RepoURL:     req.GetProjectRepoURLs(),
		CodeType:    req.CodeType,
		Tags:        req.GetProjectTags(),
		QuestionID:  req.QuestionID,
		UserID:      questionInfo.UserID,
		Status:      entity.ProjectStatusAvailable,
	}

	err = ps.projectRepo.AddProject(ctx, projectEntity)
	if err != nil {
		log.Errorf("add project failed: %v", err)
		return errors.InternalServer(reason.DatabaseError)
	}

	return nil
}

// RemoveProject remove project
func (ps *ProjectCommon) RemoveProject(ctx context.Context, req *schema.RemoveProjectReq) (err error) {
	// 检查项目是否存在
	_, exist, err := ps.projectRepo.GetProject(ctx, req.ID)
	if err != nil {
		return err
	}
	if !exist {
		return errors.BadRequest(reason.ObjectNotFound)
	}

	err = ps.projectRepo.RemoveProject(ctx, req.ID)
	if err != nil {
		log.Errorf("remove project failed: %v", err)
		return errors.InternalServer(reason.DatabaseError)
	}

	return nil
}

// BatchRemoveProject batch remove projects
func (ps *ProjectCommon) BatchRemoveProject(ctx context.Context, req *schema.BatchRemoveProjectReq) (err error) {
	if len(req.IDs) == 0 {
		return errors.BadRequest(reason.RequestFormatError).WithMsg("项目ID列表不能为空")
	}

	// 逐个删除项目（软删除）
	for _, id := range req.IDs {
		// 检查项目是否存在
		_, exist, err := ps.projectRepo.GetProject(ctx, id)
		if err != nil {
			log.Errorf("get project %s failed: %v", id, err)
			continue
		}
		if !exist {
			log.Warnf("project %s not exist", id)
			continue
		}

		// 删除项目
		err = ps.projectRepo.RemoveProject(ctx, id)
		if err != nil {
			log.Errorf("remove project %s failed: %v", id, err)
			return errors.InternalServer(reason.DatabaseError)
		}
	}

	return nil
}

// UpdateProject update project
func (ps *ProjectCommon) UpdateProject(ctx context.Context, req *schema.UpdateProjectReq) (err error) {
	// 检查项目是否存在
	projectInfo, exist, err := ps.projectRepo.GetProject(ctx, req.ID)
	if err != nil {
		return err
	}
	if !exist {
		return errors.BadRequest(reason.ObjectNotFound)
	}

	// 更新项目信息
	projectInfo.Title = req.Title
	projectInfo.Description = req.Description
	projectInfo.Cover = req.Cover
	projectInfo.Content = req.Content
	projectInfo.RepoURL = req.GetProjectRepoURLs()
	projectInfo.CodeType = req.CodeType
	projectInfo.Tags = req.GetProjectTags()

	cols := []string{"title", "description", "cover", "content", "repo_url", "code_type", "tags"}
	err = ps.projectRepo.UpdateProject(ctx, projectInfo, cols)
	if err != nil {
		log.Errorf("update project failed: %v", err)
		return errors.InternalServer(reason.DatabaseError)
	}

	return nil
}

// GetProject get project info
func (ps *ProjectCommon) GetProject(ctx context.Context, req *schema.GetProjectReq) (resp *schema.ProjectResp, err error) {
	projectInfo, exist, err := ps.projectRepo.GetProject(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errors.BadRequest(reason.ObjectNotFound)
	}

	// 获取问题信息
	questionInfo, exist, err := ps.questionRepo.GetQuestion(ctx, projectInfo.QuestionID)
	if err != nil {
		return nil, err
	}
	if !exist {
		return nil, errors.BadRequest(reason.QuestionNotFound)
	}

	// 获取用户信息
	userInfo, exist, err := ps.userRepo.GetByUserID(ctx, projectInfo.UserID)
	if err != nil {
		return nil, err
	}

	resp = &schema.ProjectResp{
		ID:          projectInfo.ID,
		Title:       projectInfo.Title,
		Description: projectInfo.Description,
		Cover:       projectInfo.Cover,
		Content:     projectInfo.Content,
		CodeType:    projectInfo.CodeType,
		QuestionID:  projectInfo.QuestionID,
		UserID:      projectInfo.UserID,
		ViewCount:   int64(questionInfo.ViewCount),
		VoteCount:   questionInfo.VoteCount,
		AnswerCount: questionInfo.AnswerCount,
		CreatedAt:   projectInfo.CreatedAt.Unix(),
		UpdatedAt:   projectInfo.UpdatedAt.Unix(),
	}

	// 解析仓库地址和标签
	resp.ParseRepoURL(projectInfo.RepoURL)
	resp.ParseTags(projectInfo.Tags)
	resp.GetCodeTypeName()

	// 设置用户信息
	if exist && userInfo != nil {
		resp.UserInfo = &schema.UserBasicInfo{
			ID:          userInfo.ID,
			Username:    userInfo.Username,
			DisplayName: userInfo.DisplayName,
			Avatar:      userInfo.Avatar,
		}
	}

	return resp, nil
}

// GetProjectPage get project page
func (ps *ProjectCommon) GetProjectPage(ctx context.Context, req *schema.ProjectPageReq) (resp *schema.ProjectPageResp, err error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}

	projectList, total, err := ps.projectRepo.GetProjectList(ctx, req)
	if err != nil {
		return nil, err
	}

	resp = &schema.ProjectPageResp{
		Count: total,
		List:  make([]*schema.ProjectResp, 0, len(projectList)),
	}

	// 获取所有相关的问题ID和用户ID
	questionIDs := make([]string, 0, len(projectList))
	userIDs := make([]string, 0, len(projectList))
	for _, project := range projectList {
		questionIDs = append(questionIDs, project.QuestionID)
		userIDs = append(userIDs, project.UserID)
	}

	// 批量获取问题信息
	questionMap := make(map[string]*entity.Question)
	for _, questionID := range questionIDs {
		if questionInfo, exist, err := ps.questionRepo.GetQuestion(ctx, questionID); err == nil && exist {
			questionMap[questionID] = questionInfo
		}
	}

	// 批量获取用户信息
	userMap := make(map[string]*entity.User)
	if len(userIDs) > 0 {
		users, err := ps.userRepo.BatchGetByID(ctx, userIDs)
		if err != nil {
			log.Errorf("batch get users failed: %v", err)
		} else {
			for _, u := range users {
				userMap[u.ID] = u
			}
		}
	}

	// 构建响应数据
	for _, project := range projectList {
		projectResp := &schema.ProjectResp{
			ID:          project.ID,
			Title:       project.Title,
			Description: project.Description,
			Cover:       project.Cover,
			Content:     project.Content,
			CodeType:    project.CodeType,
			QuestionID:  project.QuestionID,
			UserID:      project.UserID,
			CreatedAt:   project.CreatedAt.Unix(),
			UpdatedAt:   project.UpdatedAt.Unix(),
		}

		// 解析仓库地址和标签
		projectResp.ParseRepoURL(project.RepoURL)
		projectResp.ParseTags(project.Tags)
		projectResp.GetCodeTypeName()

		// 设置问题相关信息
		if questionInfo, ok := questionMap[project.QuestionID]; ok {
			projectResp.ViewCount = int64(questionInfo.ViewCount)
			projectResp.VoteCount = questionInfo.VoteCount
			projectResp.AnswerCount = questionInfo.AnswerCount
		}

		// 设置用户信息
		if userInfo, ok := userMap[project.UserID]; ok {
			projectResp.UserInfo = &schema.UserBasicInfo{
				ID:          userInfo.ID,
				Username:    userInfo.Username,
				DisplayName: userInfo.DisplayName,
				Avatar:      userInfo.Avatar,
			}
		}

		resp.List = append(resp.List, projectResp)
	}

	return resp, nil
}
