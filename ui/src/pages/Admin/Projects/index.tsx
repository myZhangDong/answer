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

import { FC, useState } from 'react';
import { Form, Stack, Button, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Pagination, Empty } from '@/components';
import {
  useProjectList,
  createProject,
  batchDeleteProject,
} from '@/services/client';

import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';

const projectFilterItems = ['project_management', 'create_project'];

const projectFilterLabels = {
  project_management: '项目管理',
  create_project: '创建项目',
};

const PAGE_SIZE = 20;

const Projects: FC = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const curFilter = urlSearchParams.get('tab') || projectFilterItems[0];
  const curPage = Number(urlSearchParams.get('page')) || 1;
  const curQuery = urlSearchParams.get('query') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: listData, isValidating } = useProjectList({
    page_size: PAGE_SIZE,
    page: curPage,
    search: curQuery,
  });
  const count = listData?.count || 0;

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    urlSearchParams.set('query', e.target.value);
    urlSearchParams.delete('page');
    setUrlSearchParams(urlSearchParams);
  };

  const handleTabChange = (tab: string) => {
    urlSearchParams.set('tab', tab);
    urlSearchParams.delete('page');
    urlSearchParams.delete('query');
    setUrlSearchParams(urlSearchParams);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/projects/edit/${id}`);
  };

  const handleDelete = async (ids: string[]) => {
    try {
      setLoading(true);
      setError('');
      await batchDeleteProject(ids);
      alert(`成功删除 ${ids.length} 个项目！`);
      // 刷新列表
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('删除失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: any) => {
    try {
      setLoading(true);
      setError('');

      // 转换表单数据为API请求格式
      const requestData = {
        title: formData.title,
        description: formData.description,
        cover: formData.cover,
        content: formData.content,
        repo_url: formData.repo_url,
        code_type: formData.code_type,
        tags: formData.tags || [],
        question_id: formData.question_id,
      };

      await createProject(requestData);
      alert('项目创建成功！');
      // 切换到项目管理页面
      handleTabChange('project_management');
    } catch (err) {
      console.error('Create failed:', err);
      setError('创建项目失败，请重试！');
      throw err; // 让表单组件处理错误
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    handleTabChange('project_management');
  };

  return (
    <>
      <h3 className="mb-4">项目管理</h3>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 选项卡导航 */}
      <div className="mb-4">
        <Stack direction="horizontal" gap={2}>
          {projectFilterItems.map((item) => (
            <Button
              key={item}
              variant={curFilter === item ? 'primary' : 'outline-primary'}
              onClick={() => handleTabChange(item)}>
              {projectFilterLabels[item]}
            </Button>
          ))}
        </Stack>
      </div>

      {/* 根据选中的选项卡显示不同内容 */}
      {curFilter === 'create_project' ? (
        <ProjectForm
          mode="create"
          onSave={handleCreateProject}
          onCancel={handleCancelCreate}
          isLoading={loading}
        />
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <Form.Control
              value={curQuery}
              size="sm"
              type="search"
              placeholder="Search projects..."
              onChange={handleFilter}
              style={{ width: '12.25rem' }}
              className="mb-3"
            />
          </div>

          <ProjectList
            projects={listData?.list || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />

          {!isValidating && (!listData?.list || listData.list.length === 0) && (
            <Empty />
          )}

          <div className="mt-4 mb-2 d-flex justify-content-center">
            <Pagination
              currentPage={curPage}
              totalSize={count}
              pageSize={PAGE_SIZE}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Projects;
