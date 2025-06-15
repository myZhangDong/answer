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

import { FC, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Button,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

import { usePageTags } from '@/hooks';
import { getVideoInfo, VideoInfo } from '@/services/client';

const VideoDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  usePageTags({
    title: video?.title || 'Video Detail',
  });

  useEffect(() => {
    if (!id) {
      navigate('/video');
      return;
    }

    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await getVideoInfo(id);
        setVideo(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayVideo = () => {
    if (video?.code) {
      setIsPlaying(true);
    }
  };

  if (loading) {
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

  if (error || !video) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Video not found'}</Alert>
        <Button variant="primary" onClick={() => navigate('/video')}>
          Back to Videos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          {/* 视频播放器 */}
          <Card className="mb-4">
            <div className="position-relative" style={{ paddingTop: '56.25%' }}>
              {isPlaying ? (
                video.code ? (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    dangerouslySetInnerHTML={{ __html: video.code }}
                  />
                ) : (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                    <p className="text-muted">No video available</p>
                  </div>
                )
              ) : (
                <>
                  <img
                    src={video.cover || 'https://via.placeholder.com/800x450'}
                    alt={video.title}
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-50 start-50 translate-middle">
                    {video.code ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="rounded-circle p-3"
                        onClick={handlePlayVideo}
                        style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-play-fill fs-2" />
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-secondary"
                          style={{ width: '80px', height: '80px' }}>
                          <i className="bi bi-exclamation-triangle fs-2 text-white" />
                        </div>
                        <p className="mt-2 text-muted small">
                          Video not available
                        </p>
                      </div>
                    )}
                  </div>
                  {video.is_recommend === 1 && (
                    <Badge
                      bg="primary"
                      className="position-absolute"
                      style={{ top: '16px', left: '16px' }}>
                      Recommended
                    </Badge>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* 视频信息 */}
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="h3 mb-0">{video.title}</h1>
                <Badge bg="secondary">{video.type}</Badge>
              </div>

              <div className="d-flex align-items-center mb-3 text-muted">
                <span className="me-3">
                  <i className="bi bi-eye me-1" />
                  {video.view_count.toLocaleString()} views
                </span>
                <span className="me-3">
                  <i className="bi bi-calendar me-1" />
                  {formatDate(video.created_at)}
                </span>
                <span>
                  <i className="bi bi-clock me-1" />
                  {formatDuration(video.duration || 0)}
                </span>
              </div>

              <p className="text-muted mb-4">{video.description}</p>

              {/* 作者信息 */}
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <img
                  src={
                    video.author_avatar || 'https://via.placeholder.com/60x60'
                  }
                  alt={video.author_name}
                  className="rounded-circle me-3"
                  style={{ width: '60px', height: '60px' }}
                />
                <div>
                  <h5 className="mb-1">{video.author_name}</h5>
                  <p className="text-muted mb-0 small">
                    {video.author_intro || 'Video creator'}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 侧边栏 */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Video Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Type:</strong>
                <Badge bg="outline-secondary" className="ms-2">
                  {video.type}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Duration:</strong>
                <span className="ms-2">
                  {formatDuration(video.duration || 0)}
                </span>
              </div>
              <div className="mb-3">
                <strong>Views:</strong>
                <span className="ms-2">
                  {video.view_count.toLocaleString()}
                </span>
              </div>
              <div className="mb-3">
                <strong>Published:</strong>
                <span className="ms-2">{formatDate(video.created_at)}</span>
              </div>
              {video.updated_at && video.updated_at !== video.created_at && (
                <div className="mb-3">
                  <strong>Updated:</strong>
                  <span className="ms-2">{formatDate(video.updated_at)}</span>
                </div>
              )}
              <div className="mb-3">
                <strong>Status:</strong>
                <Badge
                  bg={video.is_show === 1 ? 'success' : 'secondary'}
                  className="ms-2">
                  {video.is_show === 1 ? 'Public' : 'Private'}
                </Badge>
              </div>
              {video.is_recommend === 1 && (
                <div className="mb-3">
                  <Badge bg="primary">
                    <i className="bi bi-star me-1" />
                    Recommended
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/video')}>
              <i className="bi bi-arrow-left me-2" />
              Back to Videos
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default VideoDetail;
