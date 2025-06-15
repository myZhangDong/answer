import { FC, useState } from 'react';
import { Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FormatTime } from '@/components';

interface VideoItem {
  id: string;
  title: string;
  cover: string;
  view_count: number;
  duration?: number;
  type: string;
  author_name: string;
  author_avatar: string;
  created_at: number;
  is_show: number | boolean;
  is_recommend: number | boolean;
  description?: string;
}

interface VideoListProps {
  videos: VideoItem[];
  onEdit: (id: string) => void;
  onDelete: (ids: string[]) => void;
  isLoading?: boolean;
}

const VideoList: FC<VideoListProps> = ({
  videos,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(videos.map((video) => video.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      alert('请选择要删除的视频');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(selectedIds);
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

  // 移除这个提前返回，让空状态在表格后显示

  return (
    <>
      {/* 批量操作工具栏 */}
      {selectedIds.length > 0 && (
        <div className="mb-3 p-2 bg-light rounded">
          <span className="me-3">已选择 {selectedIds.length} 项</span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleBatchDelete}
            disabled={isLoading}>
            {isLoading ? '删除中...' : '批量删除'}
          </Button>
        </div>
      )}

      <Table hover responsive="md">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <Form.Check
                type="checkbox"
                checked={
                  selectedIds.length === videos.length && videos.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="min-w-15">Video</th>
            <th style={{ width: '10%' }}>Views</th>
            <th style={{ width: '10%' }}>Duration</th>
            <th style={{ width: '12%' }}>Type</th>
            <th style={{ width: '15%' }}>Author</th>
            <th style={{ width: '12%' }}>Created</th>
            <th style={{ width: '10%' }}>Status</th>
            <th style={{ width: '12%' }} className="text-end">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {videos.map((video) => (
            <tr key={video.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.includes(video.id)}
                  onChange={(e) => handleSelectItem(video.id, e.target.checked)}
                />
              </td>
              <td className="d-flex align-items-center">
                <img
                  src={video.cover}
                  alt={video.title}
                  width="60"
                  height="40"
                  className="rounded me-3"
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <div className="fw-medium text-break">{video.title}</div>
                  <div
                    className="text-body small text-truncate"
                    style={{ maxWidth: '200px' }}>
                    {video.description || '暂无描述'}
                  </div>
                  {(video.is_recommend === 1 ||
                    video.is_recommend === true) && (
                    <Badge bg="warning" className="mt-1">
                      推荐
                    </Badge>
                  )}
                </div>
              </td>
              <td>{video.view_count?.toLocaleString() || 0}</td>
              <td>{formatDuration(video.duration || 0)}</td>
              <td>
                <Badge bg="info">{video.type || 'tutorial'}</Badge>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={video.author_avatar}
                    alt={video.author_name}
                    width="20"
                    height="20"
                    className="rounded-circle me-1"
                  />
                  {video.author_name}
                </div>
              </td>
              <td>
                <FormatTime time={video.created_at} />
              </td>
              <td>
                <Badge
                  bg={
                    video.is_show === 1 || video.is_show === true
                      ? 'success'
                      : 'secondary'
                  }>
                  {video.is_show === 1 || video.is_show === true
                    ? 'Public'
                    : 'Private'}
                </Badge>
              </td>
              <td className="text-end">
                <div className="d-flex gap-1 justify-content-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(video.id)}
                    disabled={isLoading}>
                    编辑
                  </Button>
                  <Link
                    to={`/video/${video.id}`}
                    className="btn btn-sm btn-outline-secondary"
                    target="_blank">
                    查看
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 删除确认模态框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认删除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要删除选中的 {selectedIds.length} 个视频吗？此操作不可撤销。
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isLoading}>
            取消
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isLoading}>
            {isLoading ? '删除中...' : '确认删除'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VideoList;
