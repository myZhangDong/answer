import { FC, useState } from 'react';
import { Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FormatTime } from '@/components';
import { ProjectInfo } from '@/services/client';

interface ProjectListProps {
  projects: ProjectInfo[];
  onEdit: (id: string) => void;
  onDelete: (ids: string[]) => void;
  isLoading?: boolean;
}

const ProjectList: FC<ProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(projects.map((project) => project.id));
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
      alert('请选择要删除的项目');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(selectedIds);
    setSelectedIds([]);
    setShowDeleteModal(false);
  };

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
                  selectedIds.length === projects.length && projects.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="min-w-15">项目</th>
            <th style={{ width: '10%' }}>浏览量</th>
            <th style={{ width: '8%' }}>投票</th>
            <th style={{ width: '8%' }}>回答</th>
            <th style={{ width: '12%' }}>类型</th>
            <th style={{ width: '15%' }}>作者</th>
            <th style={{ width: '12%' }}>创建时间</th>
            <th style={{ width: '12%' }} className="text-end">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.includes(project.id)}
                  onChange={(e) =>
                    handleSelectItem(project.id, e.target.checked)
                  }
                />
              </td>
              <td className="d-flex align-items-center">
                {project.cover && (
                  <img
                    src={project.cover}
                    alt={project.title}
                    width="60"
                    height="40"
                    className="rounded me-3"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div className="fw-medium text-break">{project.title}</div>
                  <div
                    className="text-body small text-truncate"
                    style={{ maxWidth: '200px' }}>
                    {project.description || '暂无描述'}
                  </div>
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge
                          bg="secondary"
                          className="me-1"
                          key={`${project.id}-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge bg="light" text="dark">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td>{project.view_count?.toLocaleString() || 0}</td>
              <td>{project.vote_count || 0}</td>
              <td>{project.answer_count || 0}</td>
              <td>
                <Badge bg="info">{project.code_type_name || 'Unknown'}</Badge>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  {project.user_info?.avatar && (
                    <img
                      src={project.user_info.avatar}
                      alt={project.user_info.display_name}
                      width="20"
                      height="20"
                      className="rounded-circle me-1"
                    />
                  )}
                  {project.user_info?.display_name || '未知用户'}
                </div>
              </td>
              <td>
                <FormatTime time={project.created_at} />
              </td>
              <td className="text-end">
                <div className="d-flex gap-1 justify-content-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(project.id)}
                    disabled={isLoading}>
                    编辑
                  </Button>
                  <Link
                    to={`/projects/${project.id}`}
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

      {/* 删除确认对话框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认删除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要删除选中的 {selectedIds.length} 个项目吗？此操作不可撤销。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            确认删除
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProjectList;
