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

import { FC, useEffect } from 'react';
import {
  Container,
  Card,
  Badge,
  Alert,
  Spinner,
  Button,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import useSWR from 'swr';

import { usePageTags } from '@/hooks';
import { getProjectInfo } from '@/services/client';

const ProjectDetail: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: project,
    error,
    isValidating,
  } = useSWR(id ? `/api/projects/${id}` : null, () => getProjectInfo(id!));

  usePageTags({
    title: project?.title || t('project.title'),
  });

  useEffect(() => {
    if (error) {
      navigate('/projects', { replace: true });
    }
  }, [error, navigate]);

  if (isValidating) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Project not found</Alert>
      </Container>
    );
  }

  const handleQuestionClick = () => {
    navigate(`/questions/${project.question_id}`);
  };

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h1 className="h3 mb-2">{project.title}</h1>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={
                    project.user_info?.avatar ||
                    'https://via.placeholder.com/32x32'
                  }
                  alt={
                    project.user_info?.display_name ||
                    project.user_info?.username
                  }
                  className="rounded-circle me-2"
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="text-muted me-3">
                  {project.user_info?.display_name ||
                    project.user_info?.username}
                </span>
                <span className="text-muted me-3">
                  {project.view_count.toLocaleString()}{' '}
                  {t('project.attributes.view_count')}
                </span>
                <Badge bg="primary" className="me-3">
                  {project.code_type_name}
                </Badge>
              </div>
            </div>
            <div className="d-flex gap-2">
              {Object.entries(project.repo_url).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-box-arrow-up-right me-1" />
                  {platform}
                </a>
              ))}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleQuestionClick}>
                <i className="bi bi-question-circle me-1" />
                {t('project.view_question')}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <img
              src={project.cover || 'https://via.placeholder.com/800x400'}
              alt={project.title}
              className="img-fluid rounded"
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="mb-4">
            <h2 className="h5 mb-3">{t('project.attributes.description')}</h2>
            <p className="text-muted">{project.description}</p>
          </div>

          {project.content && (
            <div className="mb-4">
              <h2 className="h5 mb-3">{t('project.content')}</h2>
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <div>
              {project.tags.map((tag) => (
                <Badge key={tag} bg="secondary" className="me-2">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-muted">
              <small>
                {t('project.created_at')}:{' '}
                {new Date(project.created_at * 1000).toLocaleDateString()}
              </small>
              {project.updated_at > 0 && (
                <small className="ms-3">
                  {t('project.updated_at')}:{' '}
                  {new Date(project.updated_at * 1000).toLocaleDateString()}
                </small>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProjectDetail;
