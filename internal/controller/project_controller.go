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
	"github.com/apache/answer/internal/schema"
	projectcommon "github.com/apache/answer/internal/service/project_common"
	"github.com/gin-gonic/gin"
)

// ProjectController 项目控制器
type ProjectController struct {
	projectService *projectcommon.ProjectCommon
}

// NewProjectController 创建项目控制器
func NewProjectController(projectService *projectcommon.ProjectCommon) *ProjectController {
	return &ProjectController{
		projectService: projectService,
	}
}

// AddProject 添加项目
// @Summary 添加项目
// @Description 添加项目
// @Tags Project
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body schema.CreateProjectReq true "project"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/project [post]
func (pc *ProjectController) AddProject(ctx *gin.Context) {
	req := &schema.CreateProjectReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	err := pc.projectService.AddProject(ctx, req)
	handler.HandleResponse(ctx, err, nil)
}

// RemoveProject 删除项目
// @Summary 删除项目
// @Description 删除项目
// @Tags Project
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body schema.RemoveProjectReq true "project"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/project [delete]
func (pc *ProjectController) RemoveProject(ctx *gin.Context) {
	req := &schema.RemoveProjectReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	err := pc.projectService.RemoveProject(ctx, req)
	handler.HandleResponse(ctx, err, nil)
}

// BatchRemoveProject 批量删除项目
// @Summary 批量删除项目
// @Description 批量删除项目
// @Tags Project
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body schema.BatchRemoveProjectReq true "project ids"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/project/batch-delete [delete]
func (pc *ProjectController) BatchRemoveProject(ctx *gin.Context) {
	req := &schema.BatchRemoveProjectReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	err := pc.projectService.BatchRemoveProject(ctx, req)
	handler.HandleResponse(ctx, err, nil)
}

// UpdateProject 更新项目
// @Summary 更新项目
// @Description 更新项目
// @Tags Project
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body schema.UpdateProjectReq true "project"
// @Success 200 {object} handler.RespBody
// @Router /answer/api/v1/project [put]
func (pc *ProjectController) UpdateProject(ctx *gin.Context) {
	req := &schema.UpdateProjectReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	err := pc.projectService.UpdateProject(ctx, req)
	handler.HandleResponse(ctx, err, nil)
}

// GetProject 获取项目详情
// @Summary 获取项目详情
// @Description 获取项目详情
// @Tags Project
// @Accept json
// @Produce json
// @Param id query string true "project id"
// @Success 200 {object} handler.RespBody{data=schema.ProjectResp}
// @Router /answer/api/v1/project/info [get]
func (pc *ProjectController) GetProject(ctx *gin.Context) {
	req := &schema.GetProjectReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	resp, err := pc.projectService.GetProject(ctx, req)
	handler.HandleResponse(ctx, err, resp)
}

// GetProjectPage 获取项目分页列表
// @Summary 获取项目分页列表
// @Description 获取项目分页列表
// @Tags Project
// @Accept json
// @Produce json
// @Param page query int false "page"
// @Param page_size query int false "page size"
// @Param search query string false "search"
// @Param code_type query int false "code type"
// @Param tags query string false "tags"
// @Param order query string false "order"
// @Success 200 {object} handler.RespBody{data=schema.ProjectPageResp}
// @Router /answer/api/v1/project/page [get]
func (pc *ProjectController) GetProjectPage(ctx *gin.Context) {
	req := &schema.ProjectPageReq{}
	if handler.BindAndCheck(ctx, req) {
		return
	}

	resp, err := pc.projectService.GetProjectPage(ctx, req)
	handler.HandleResponse(ctx, err, resp)
}
