import { FC, useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

import { UploadImg } from '@/components';

interface ProjectFormData {
  title: string;
  description: string;
  cover: string;
  content: string;
  repo_url: Record<string, string>;
  code_type: number;
  tags: string[];
  question_id: string;
}

interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProjectFormData>;
  onSave: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProjectForm: FC<ProjectFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    cover: '',
    content: '',
    repo_url: {},
    code_type: 1,
    tags: [],
    question_id: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [githubUrl, setGithubUrl] = useState('');
  const [giteeUrl, setGiteeUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      // 初始化仓库地址
      if (initialData.repo_url) {
        setGithubUrl(initialData.repo_url.github || '');
        setGiteeUrl(initialData.repo_url.gitee || '');
      }

      // 初始化标签
      if (initialData.tags) {
        setTagsInput(initialData.tags.join(', '));
      }
    }
  }, [initialData]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除字段错误
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleRepoUrlChange = () => {
    const repoUrl: Record<string, string> = {};
    if (githubUrl.trim()) {
      repoUrl.github = githubUrl.trim();
    }
    if (giteeUrl.trim()) {
      repoUrl.gitee = giteeUrl.trim();
    }
    handleFormChange('repo_url', repoUrl);
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    handleFormChange('tags', tags);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '项目名称不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '代码简介不能为空';
    }

    if (!formData.content.trim()) {
      newErrors.content = '代码详情不能为空';
    }

    if (!formData.question_id.trim()) {
      newErrors.question_id = '对应文章ID不能为空';
    }

    if (Object.keys(formData.repo_url).length === 0) {
      newErrors.repo_url = '至少需要填写一个仓库地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // 更新仓库地址
    handleRepoUrlChange();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{mode === 'create' ? '创建项目' : '编辑项目'}</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>代码名称 *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="请输入代码名称"
                isInvalid={!!errors.title}
              />
              {errors.title && (
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>代码图片</Form.Label>
              <div className="mb-2">
                <UploadImg
                  type="project"
                  uploadCallback={(url) => handleFormChange('cover', url)}>
                  选择文件
                </UploadImg>
                <span className="ms-2 text-muted">
                  {formData.cover ? '已选择文件' : '未选择任何文件'}
                </span>
              </div>
              <div className="text-center p-4 border rounded bg-light">
                {formData.cover ? (
                  <img
                    src={formData.cover}
                    alt="项目封面"
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                    className="img-fluid"
                  />
                ) : (
                  <div className="text-muted">暂无图片</div>
                )}
              </div>
              <Form.Control
                type="text"
                value={formData.cover}
                onChange={(e) => handleFormChange('cover', e.target.value)}
                placeholder="或直接输入图片URL"
                className="mt-2"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>代码类型</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="web"
                  name="code_type"
                  label="Web"
                  checked={formData.code_type === 1}
                  onChange={() => handleFormChange('code_type', 1)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="mobile"
                  name="code_type"
                  label="Mobile"
                  checked={formData.code_type === 2}
                  onChange={() => handleFormChange('code_type', 2)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="desktop"
                  name="code_type"
                  label="Desktop"
                  checked={formData.code_type === 3}
                  onChange={() => handleFormChange('code_type', 3)}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>标签</Form.Label>
              <Form.Control
                type="text"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="多个标签请以英文逗号分隔，如：React, TypeScript, Node.js"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>代码简介 *</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="请输入代码简介"
            isInvalid={!!errors.description}
          />
          {errors.description && (
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>代码详情 *</Form.Label>
          <div
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '0.375rem',
              minHeight: '200px',
            }}>
            <div
              style={{
                borderBottom: '1px solid #dee2e6',
                padding: '8px 12px',
                backgroundColor: '#f8f9fa',
              }}>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  B
                </Button>
                <Button variant="outline-secondary" size="sm">
                  I
                </Button>
                <Button variant="outline-secondary" size="sm">
                  U
                </Button>
                <Button variant="outline-secondary" size="sm">
                  🔗
                </Button>
                <Button variant="outline-secondary" size="sm">
                  📷
                </Button>
              </div>
            </div>
            <Form.Control
              as="textarea"
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder="请输入代码详情"
              style={{ border: 'none', minHeight: '150px', resize: 'none' }}
              isInvalid={!!errors.content}
            />
          </div>
          {errors.content && (
            <div className="text-danger small mt-1">{errors.content}</div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>资源地址 *</Form.Label>
          <Row>
            <Col md={6}>
              <Form.Control
                type="text"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  handleRepoUrlChange();
                }}
                placeholder="GitHub 地址"
                className="mb-2"
              />
            </Col>
            <Col md={6}>
              <Form.Control
                type="text"
                value={giteeUrl}
                onChange={(e) => {
                  setGiteeUrl(e.target.value);
                  handleRepoUrlChange();
                }}
                placeholder="Gitee 地址"
              />
            </Col>
          </Row>
          {errors.repo_url && (
            <div className="text-danger small mt-1">{errors.repo_url}</div>
          )}
          <Form.Text className="text-muted">请输入 JSON 格式数据</Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>对应文章ID *</Form.Label>
          <Form.Control
            type="text"
            value={formData.question_id}
            onChange={(e) => handleFormChange('question_id', e.target.value)}
            placeholder="请输入对应的问题文章ID"
            isInvalid={!!errors.question_id}
          />
          {errors.question_id && (
            <Form.Control.Feedback type="invalid">
              {errors.question_id}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading
              ? '保存中...'
              : mode === 'create'
                ? '保存信息'
                : '更新信息'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectForm;
