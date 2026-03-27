import useSWR from 'swr';
import qs from 'qs';

import request from '@/utils/request';

// 用户基本信息接口
export interface UserBasicInfo {
  id: string;
  username: string;
  rank: number;
  display_name: string;
  avatar: string;
  website: string;
  location: string;
  language: string;
  status: string;
}

// 项目信息接口
export interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  cover: string;
  content: string;
  repo_url: Record<string, string>;
  code_type: number;
  code_type_name: string;
  tags: string[];
  question_id: string;
  user_id: string;
  user_info?: UserBasicInfo;
  view_count: number;
  vote_count: number;
  answer_count: number;
  created_at: number;
  updated_at: number;
}

// 项目分页请求参数
export interface ProjectPageReq {
  page?: number;
  page_size?: number;
  search?: string;
  code_type?: number;
  tags?: string;
  order?: 'created' | 'newest' | 'active' | 'hot';
}

// 项目分页响应
export interface ProjectPageResp {
  count: number;
  list: ProjectInfo[];
}

// 创建项目请求
export interface CreateProjectReq {
  title: string;
  description: string;
  cover?: string;
  content: string;
  repo_url: Record<string, string>;
  code_type: number;
  tags?: string[];
  question_id: string;
}

// 更新项目请求
export interface UpdateProjectReq {
  id: string;
  title: string;
  description: string;
  cover?: string;
  content: string;
  repo_url: Record<string, string>;
  code_type: number;
  tags?: string[];
}

// 删除项目请求
export interface RemoveProjectReq {
  id: string;
}

// 获取项目列表
export const useProjectList = (params: ProjectPageReq) => {
  const queryString = qs.stringify(params, { skipNulls: true });
  const apiUrl = `/answer/api/v1/project/page?${queryString}`;

  return useSWR<ProjectPageResp, Error>(
    apiUrl,
    (url: string) => request.get(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

// 获取单个项目详情
export const getProjectInfo = async (id: string): Promise<ProjectInfo> => {
  const url = `/answer/api/v1/project/info?id=${id}`;
  const res: ProjectInfo = await request.get(url);
  return res;
};

// 创建项目
export const createProject = (params: CreateProjectReq) => {
  return request.post('/answer/api/v1/project', params);
};

// 更新项目
export const updateProject = (params: UpdateProjectReq) => {
  return request.put('/answer/api/v1/project', params);
};

// 删除项目
export const removeProject = (params: RemoveProjectReq) => {
  return request.delete('/answer/api/v1/project', params);
};

// 批量删除项目
export const batchDeleteProject = (ids: string[]) => {
  return request.delete('/answer/api/v1/project/batch-delete', { ids });
};

// 代码类型选项
export const CODE_TYPE_OPTIONS = [
  { value: 1, label: 'Web' },
  { value: 2, label: 'Mobile' },
  { value: 3, label: 'Desktop' },
];

// 排序选项
export const ORDER_OPTIONS = [
  { value: 'newest', label: '最新' },
  { value: 'active', label: '活跃' },
  { value: 'hot', label: '热门' },
  { value: 'created', label: '创建时间' },
];

// 获取代码类型名称
export const getCodeTypeName = (codeType: number): string => {
  const option = CODE_TYPE_OPTIONS.find((opt) => opt.value === codeType);
  return option?.label || 'Unknown';
};

// 格式化仓库URL显示
export const formatRepoUrls = (repoUrl: Record<string, string>): string[] => {
  return Object.entries(repoUrl).map(
    ([platform, url]) => `${platform}: ${url}`,
  );
};

// 格式化标签显示
export const formatTags = (tags: string[]): string => {
  return tags.join(', ');
};
