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
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { usePageTags } from '@/hooks';
import { useProjectList, ProjectPageReq, ProjectInfo } from '@/services/client';

const Projects: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<ProjectPageReq>({
    page: 1,
    page_size: 12,
    order: 'newest',
  });

  const { data, isValidating: loading, error } = useProjectList(searchParams);

  usePageTags({
    title: t('header.nav.project'),
  });

  const handleSearch = (searchText: string) => {
    setSearchParams({
      ...searchParams,
      search: searchText,
      page: 1,
    });
  };

  const handleOrderChange = (order: string) => {
    setSearchParams({
      ...searchParams,
      order: order as ProjectPageReq['order'],
      page: 1,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleProjectClick = (project: ProjectInfo) => {
    navigate(`/articles/${project.question_id}`);
  };

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Error loading projects: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>开源项目</h5>
          </div>

          {/* 搜索和排序控件 - 改进移动端响应式布局 */}
          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder={t('header.search.placeholder')}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end">
              <Form.Select
                style={{ width: 'auto', minWidth: '120px' }}
                value={searchParams.order}
                onChange={(e) => handleOrderChange(e.target.value)}>
                <option value="newest">{t('question.newest')}</option>
                <option value="active">{t('question.active')}</option>
                <option value="hot">{t('question.hot')}</option>
                <option value="created">{t('question.created')}</option>
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row>
              {data?.list?.map((project) => (
                <Col xs={12} sm={6} lg={4} key={project.id} className="mb-4">
                  <Card
                    className="h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleProjectClick(project)}>
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={
                          project.cover || 'https://via.placeholder.com/320x180'
                        }
                        alt={project.title}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <Badge
                        bg="primary"
                        className="position-absolute"
                        style={{ top: '8px', left: '8px' }}>
                        {project.code_type_name}
                      </Badge>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6">{project.title}</Card.Title>
                      <Card.Text
                        className="text-muted small flex-grow-1"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                        {project.description}
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2">
                          <img
                            src={
                              project.user_info?.avatar ||
                              'https://via.placeholder.com/24x24'
                            }
                            alt={
                              project.user_info?.display_name ||
                              project.user_info?.username
                            }
                            className="rounded-circle me-2"
                            style={{ width: '24px', height: '24px' }}
                          />
                          <small className="text-muted">
                            {project.user_info?.display_name ||
                              project.user_info?.username}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <small className="text-muted">
                            {project.view_count.toLocaleString()}{' '}
                            {t('project.attributes.view_count')}
                          </small>
                          <small className="text-muted">
                            {formatDate(project.created_at)}
                          </small>
                        </div>
                        <div className="mt-2">
                          {project.tags.map((tag) => (
                            <Badge
                              key={tag}
                              bg="secondary"
                              className="me-1 mb-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {data?.list?.length === 0 && !loading && (
            <div className="text-center py-5">
              <p className="text-muted">没有找到项目。</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
