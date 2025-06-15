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
import { useVideoList, VideoPageReq } from '@/services/client';

const Video: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<VideoPageReq>({
    page: 1,
    page_size: 12,
    order: 'newest',
  });

  const { data, isLoading, error } = useVideoList(searchParams);

  usePageTags({
    title: t('header.nav.video'),
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
      order: order as VideoPageReq['order'],
      page: 1,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Error loading videos: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>{t('header.nav.video')}</h1>
          </div>

          {/* 搜索和排序控件 */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search videos..."
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Form.Select
                style={{ width: 'auto' }}
                value={searchParams.order}
                onChange={(e) => handleOrderChange(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="active">Active</option>
                <option value="hot">Hot</option>
                <option value="recommend">Recommended</option>
              </Form.Select>
            </Col>
          </Row>

          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row>
              {data?.list?.map((video) => (
                <Col md={6} lg={4} key={video.id} className="mb-4">
                  <Card
                    className="h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleVideoClick(video.id)}>
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={
                          video.cover || 'https://via.placeholder.com/320x180'
                        }
                        alt={video.title}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      {video.is_recommend === 1 && (
                        <Badge
                          bg="primary"
                          className="position-absolute"
                          style={{ top: '8px', left: '8px' }}>
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6">{video.title}</Card.Title>
                      <Card.Text
                        className="text-muted small flex-grow-1"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                        {video.description}
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2">
                          <img
                            src={
                              video.author_avatar ||
                              'https://via.placeholder.com/24x24'
                            }
                            alt={video.author_name}
                            className="rounded-circle me-2"
                            style={{ width: '24px', height: '24px' }}
                          />
                          <small className="text-muted">
                            {video.author_name}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {video.view_count.toLocaleString()} views
                          </small>
                          <small className="text-muted">
                            {formatDate(video.created_at)}
                          </small>
                        </div>
                        <Badge bg="secondary" className="mt-1">
                          {video.type}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {data?.list?.length === 0 && !isLoading && (
            <div className="text-center py-5">
              <p className="text-muted">No videos found.</p>
            </div>
          )}

          {/* 视频总数显示 */}
          {data && data.count > 0 && (
            <div className="mt-4 text-center">
              <small className="text-muted">
                Showing {data.list.length} of {data.count} videos
              </small>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Video;
