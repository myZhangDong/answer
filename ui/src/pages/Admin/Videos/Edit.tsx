import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';

import { getVideoInfo, updateVideo } from '@/services/client';

import VideoForm from './components/VideoForm';

interface VideoEditData {
  id: string;
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

const VideoEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState<VideoEditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadVideoData = async () => {
      if (!id) {
        setError('视频ID不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getVideoInfo(id);

        // 转换数据格式以匹配表单
        const formattedData: VideoEditData = {
          id: response.id,
          title: response.title || '',
          category: response.type || '', // 使用type作为category
          cover: response.cover || '',
          video_type: 'recorded', // 默认为录播，因为接口没有这个字段
          is_recommend:
            response.is_recommend === 1 || response.is_recommend === true,
          is_show: response.is_show === 1 || response.is_show === true,
          start_time: response.created_at
            ? new Date(response.created_at * 1000).toISOString().slice(0, 16)
            : '',
          duration: response.duration?.toString() || '',
          description: response.description || '',
          content: response.content || '',
          author_avatar: response.author_avatar || '',
          author_name: response.author_name || '',
          author_intro: response.author_intro || '',
          topics: '', // 接口没有这个字段，默认为空
          embed_code: response.code || '', // 使用code字段作为embed_code
          external_link: response.external_link || '', // 使用外部链接字段
        };

        setVideoData(formattedData);
      } catch (err) {
        console.error('Load video failed:', err);
        setError('加载视频数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadVideoData();
  }, [id]);

  const handleSave = async (formData: any) => {
    setSaving(true);
    try {
      // 转换表单数据为API请求格式
      const requestData = {
        id: id!,
        title: formData.title,
        category: formData.category,
        cover: formData.cover,
        video_type: formData.video_type,
        is_recommend: formData.is_recommend,
        is_show: formData.is_show,
        start_time: formData.start_time,
        duration: parseInt(formData.duration, 10) || 0,
        description: formData.description,
        content: formData.content,
        author_avatar: formData.author_avatar,
        author_name: formData.author_name,
        author_intro: formData.author_intro,
        topics: formData.topics,
        embed_code: formData.embed_code,
        external_link: formData.external_link,
      };

      await updateVideo(requestData);
      alert('视频更新成功！');
      navigate('/admin/videos');
    } catch (err) {
      console.error('Update failed:', err);
      alert('更新失败，请重试！');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/videos');
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}>
        <Spinner animation="border" />
        <span className="ms-2">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>加载失败</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-danger"
            onClick={() => navigate('/admin/videos')}>
            返回视频管理
          </button>
        </div>
      </Alert>
    );
  }

  if (!videoData) {
    return (
      <Alert variant="warning">
        <Alert.Heading>视频不存在</Alert.Heading>
        <p>找不到指定的视频数据。</p>
        <hr />
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate('/admin/videos')}>
            返回视频管理
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>编辑视频</h3>
        <button className="btn btn-outline-secondary" onClick={handleCancel}>
          返回列表
        </button>
      </div>

      <VideoForm
        mode="edit"
        initialData={videoData}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={saving}
      />
    </>
  );
};

export default VideoEdit;
