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

import { FC, useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { getProjectInfo, updateProject } from '@/services/client';

import ProjectForm from './components/ProjectForm';

const ProjectEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getProjectInfo(id)
        .then((data) => {
          setInitialData(data);
        })
        .catch((err) => {
          console.error('Failed to load project:', err);
          setError('加载项目信息失败');
        });
    }
  }, [id]);

  const handleSave = async (formData: any) => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');

      const requestData = {
        id,
        title: formData.title,
        description: formData.description,
        cover: formData.cover,
        content: formData.content,
        repo_url: formData.repo_url,
        code_type: formData.code_type,
        tags: formData.tags || [],
      };

      await updateProject(requestData);
      alert('项目更新成功！');
      navigate('/admin/projects');
    } catch (err) {
      console.error('Update failed:', err);
      setError('更新项目失败，请重试！');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/projects');
  };

  if (!initialData && !error) {
    return <div>加载中...</div>;
  }

  return (
    <>
      <h3 className="mb-4">编辑项目</h3>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {initialData && (
        <ProjectForm
          mode="edit"
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={loading}
        />
      )}
    </>
  );
};

export default ProjectEdit;
