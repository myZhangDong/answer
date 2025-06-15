import { FC, useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

interface VideoFormData {
  title: string;
  category: string;
  cover: string;
  video_type: 'recorded' | 'live';
  is_recommend: boolean;
  is_show: boolean;
  start_time: string;
  duration: string;
  description: string;
  content: string;
  author_avatar: string;
  author_name: string;
  author_intro: string;
  topics: string;
  embed_code: string;
  external_link: string;
}

interface VideoFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<VideoFormData>;
  onSave: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const VideoForm: FC<VideoFormProps> = ({
  mode,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    category: '',
    cover: '',
    video_type: 'recorded',
    is_recommend: false,
    is_show: true,
    start_time: '',
    duration: '',
    description: '',
    content: '',
    author_avatar: '',
    author_name: '',
    author_intro: '',
    topics: '',
    embed_code: '',
    external_link: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '视频名称不能为空';
    }

    if (!formData.author_name.trim()) {
      newErrors.author_name = '作者姓名不能为空';
    }

    if (formData.duration && Number.isNaN(Number(formData.duration))) {
      newErrors.duration = '视频时长必须是数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
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
        <h5 className="mb-0">{mode === 'create' ? '创建视频' : '编辑视频'}</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>视频名称 *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="请输入视频名称"
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
              <Form.Label>视频分类</Form.Label>
              <Form.Control
                type="text"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                placeholder="请输入视频分类"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>视频图片</Form.Label>
              <Form.Control
                type="text"
                value={formData.cover}
                onChange={(e) => handleFormChange('cover', e.target.value)}
                placeholder="请输入视频封面图片URL"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>视频类型</Form.Label>
              <Form.Select
                value={formData.video_type}
                onChange={(e) =>
                  handleFormChange('video_type', e.target.value)
                }>
                <option value="recorded">录播</option>
                <option value="live">直播</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>推荐</Form.Label>
              <Form.Select
                value={formData.is_recommend.toString()}
                onChange={(e) =>
                  handleFormChange('is_recommend', e.target.value === 'true')
                }>
                <option value="true">是</option>
                <option value="false">否</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>显示</Form.Label>
              <Form.Select
                value={formData.is_show.toString()}
                onChange={(e) =>
                  handleFormChange('is_show', e.target.value === 'true')
                }>
                <option value="true">是</option>
                <option value="false">否</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>视频时长（秒）</Form.Label>
              <Form.Control
                type="number"
                value={formData.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                placeholder="请输入视频时长（秒）"
                isInvalid={!!errors.duration}
              />
              {errors.duration && (
                <Form.Control.Feedback type="invalid">
                  {errors.duration}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>
            {formData.video_type === 'live' ? '直播开始时间' : '视频发布时间'}
          </Form.Label>
          <Form.Control
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => handleFormChange('start_time', e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>视频简介</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="请输入视频简介"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>视频内容</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={formData.content}
            onChange={(e) => handleFormChange('content', e.target.value)}
            placeholder="请输入视频详细内容"
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>作者头像</Form.Label>
              <Form.Control
                type="text"
                value={formData.author_avatar}
                onChange={(e) =>
                  handleFormChange('author_avatar', e.target.value)
                }
                placeholder="请输入作者头像URL"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>作者姓名 *</Form.Label>
              <Form.Control
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  handleFormChange('author_name', e.target.value)
                }
                placeholder="请输入作者姓名"
                isInvalid={!!errors.author_name}
              />
              {errors.author_name && (
                <Form.Control.Feedback type="invalid">
                  {errors.author_name}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>作者介绍</Form.Label>
              <Form.Control
                type="text"
                value={formData.author_intro}
                onChange={(e) =>
                  handleFormChange('author_intro', e.target.value)
                }
                placeholder="请输入作者介绍"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>所属话题</Form.Label>
          <Form.Control
            type="text"
            value={formData.topics}
            onChange={(e) => handleFormChange('topics', e.target.value)}
            placeholder="多个话题请以英文逗号 , 隔开"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>视频代码</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.embed_code}
            onChange={(e) => handleFormChange('embed_code', e.target.value)}
            placeholder="请输入视频嵌入代码"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>外部链接</Form.Label>
          <Form.Control
            type="text"
            value={formData.external_link}
            onChange={(e) => handleFormChange('external_link', e.target.value)}
            placeholder="输入外部链接则列表页点击直接跳转外部链接"
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading
              ? '保存中...'
              : mode === 'create'
                ? '保存视频'
                : '更新视频'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VideoForm;
