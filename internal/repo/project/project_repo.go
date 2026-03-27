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

package project

import (
	"context"
	"fmt"
	"strings"

	"github.com/apache/answer/internal/base/data"
	"github.com/apache/answer/internal/entity"
	"github.com/apache/answer/internal/schema"
	projectcommon "github.com/apache/answer/internal/service/project_common"
	"github.com/apache/answer/internal/service/unique"
	"github.com/apache/answer/pkg/uid"
	"github.com/segmentfault/pacman/log"
)

// ProjectRepo 项目仓库接口
type ProjectRepo interface {
	AddProject(ctx context.Context, project *entity.Project) (err error)
	RemoveProject(ctx context.Context, id string) (err error)
	UpdateProject(ctx context.Context, project *entity.Project, cols []string) (err error)
	GetProject(ctx context.Context, id string) (project *entity.Project, exist bool, err error)
	GetProjectList(ctx context.Context, req *schema.ProjectPageReq) (projectList []*entity.Project, total int64, err error)
	GetProjectByQuestionID(ctx context.Context, questionID string) (project *entity.Project, exist bool, err error)
}

// projectRepo 项目仓库实现
type projectRepo struct {
	data         *data.Data
	uniqueIDRepo unique.UniqueIDRepo
}

// NewProjectRepo 创建项目仓库
func NewProjectRepo(data *data.Data, uniqueIDRepo unique.UniqueIDRepo) projectcommon.ProjectRepo {
	return &projectRepo{
		data:         data,
		uniqueIDRepo: uniqueIDRepo,
	}
}

// AddProject 添加项目
func (pr *projectRepo) AddProject(ctx context.Context, project *entity.Project) (err error) {
	project.ID, err = pr.uniqueIDRepo.GenUniqueIDStr(ctx, project.TableName())
	if err != nil {
		log.Errorf("generate unique id failed: %v", err)
		return err
	}

	_, err = pr.data.DB.Context(ctx).Insert(project)
	if err != nil {
		log.Errorf("add project failed: %v", err)
		return err
	}

	project.ID = uid.EnShortID(project.ID)
	return nil
}

// RemoveProject 删除项目
func (pr *projectRepo) RemoveProject(ctx context.Context, id string) (err error) {
	id = uid.DeShortID(id)
	project := &entity.Project{Status: entity.ProjectStatusDeleted}
	_, err = pr.data.DB.Context(ctx).Where("id = ?", id).Cols("status").Update(project)
	if err != nil {
		log.Errorf("remove project failed: %v", err)
		return err
	}
	return nil
}

// UpdateProject 更新项目
func (pr *projectRepo) UpdateProject(ctx context.Context, project *entity.Project, cols []string) (err error) {
	id := uid.DeShortID(project.ID)
	_, err = pr.data.DB.Context(ctx).Where("id = ?", id).Cols(cols...).Update(project)
	if err != nil {
		log.Errorf("update project failed: %v", err)
		return err
	}
	return nil
}

// GetProject 获取项目
func (pr *projectRepo) GetProject(ctx context.Context, id string) (project *entity.Project, exist bool, err error) {
	id = uid.DeShortID(id)
	project = &entity.Project{}
	exist, err = pr.data.DB.Context(ctx).Where("id = ? AND status = ?", id, entity.ProjectStatusAvailable).Get(project)
	if err != nil {
		log.Errorf("get project failed: %v", err)
		return nil, false, err
	}
	if exist {
		project.ID = uid.EnShortID(project.ID)
	}
	return project, exist, nil
}

// GetProjectList 获取项目列表
func (pr *projectRepo) GetProjectList(ctx context.Context, req *schema.ProjectPageReq) (projectList []*entity.Project, total int64, err error) {
	projectList = make([]*entity.Project, 0)

	session := pr.data.DB.Context(ctx).Where("status = ?", entity.ProjectStatusAvailable)

	// 搜索条件
	if len(req.Search) > 0 {
		session = session.And("(title LIKE ? OR description LIKE ?)",
			fmt.Sprintf("%%%s%%", req.Search),
			fmt.Sprintf("%%%s%%", req.Search))
	}

	// 代码类型过滤
	if req.CodeType > 0 {
		session = session.And("code_type = ?", req.CodeType)
	}

	// 标签过滤
	if len(req.Tags) > 0 {
		tags := strings.Split(req.Tags, ",")
		for _, tag := range tags {
			if len(strings.TrimSpace(tag)) > 0 {
				session = session.And("tags LIKE ?", fmt.Sprintf("%%%s%%", strings.TrimSpace(tag)))
			}
		}
	}

	// 排序
	switch req.OrderBy {
	case "newest":
		session = session.OrderBy("created_at DESC")
	case "active":
		session = session.OrderBy("updated_at DESC")
	case "hot":
		// 这里可以根据浏览量或其他热度指标排序，暂时用创建时间
		session = session.OrderBy("created_at DESC")
	default:
		session = session.OrderBy("created_at DESC")
	}

	// 获取总数
	countSession := pr.data.DB.Context(ctx).Where("status = ?", entity.ProjectStatusAvailable)

	// 重新应用搜索条件
	if len(req.Search) > 0 {
		countSession = countSession.And("(title LIKE ? OR description LIKE ?)",
			fmt.Sprintf("%%%s%%", req.Search),
			fmt.Sprintf("%%%s%%", req.Search))
	}

	if req.CodeType > 0 {
		countSession = countSession.And("code_type = ?", req.CodeType)
	}

	if len(req.Tags) > 0 {
		tags := strings.Split(req.Tags, ",")
		for _, tag := range tags {
			if len(strings.TrimSpace(tag)) > 0 {
				countSession = countSession.And("tags LIKE ?", fmt.Sprintf("%%%s%%", strings.TrimSpace(tag)))
			}
		}
	}

	total, err = countSession.Count(&entity.Project{})
	if err != nil {
		log.Errorf("count project failed: %v", err)
		return nil, 0, err
	}

	// 分页
	if req.Page > 0 && req.PageSize > 0 {
		session = session.Limit(req.PageSize, (req.Page-1)*req.PageSize)
	}

	err = session.Find(&projectList)
	if err != nil {
		log.Errorf("get project list failed: %v", err)
		return nil, 0, err
	}

	// Convert IDs to short format
	for _, project := range projectList {
		project.ID = uid.EnShortID(project.ID)
	}

	return projectList, total, nil
}

// GetProjectByQuestionID 根据问题ID获取项目
func (pr *projectRepo) GetProjectByQuestionID(ctx context.Context, questionID string) (project *entity.Project, exist bool, err error) {
	project = &entity.Project{}
	exist, err = pr.data.DB.Context(ctx).Where("question_id = ? AND status = ?", questionID, entity.ProjectStatusAvailable).Get(project)
	if err != nil {
		log.Errorf("get project by question id failed: %v", err)
		return nil, false, err
	}
	if exist {
		project.ID = uid.EnShortID(project.ID)
	}
	return project, exist, nil
}
