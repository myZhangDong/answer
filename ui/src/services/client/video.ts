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

import useSWR from 'swr';
import qs from 'qs';

import request from '@/utils/request';

// 视频信息接口
export interface VideoInfo {
  id: string;
  title: string;
  type: string;
  is_recommend: number | boolean;
  is_show: number | boolean;
  cover: string;
  description: string;
  content: string;
  author_avatar: string;
  author_name: string;
  author_intro?: string;
  external_link?: string;
  code?: string;
  duration?: number;
  view_count: number;
  created_at: number;
  updated_at: number;
}

// 视频分页请求参数
export interface VideoPageReq {
  page?: number;
  page_size?: number;
  search?: string;
  type?: string;
  order?: 'newest' | 'active' | 'hot' | 'recommend';
}

// 视频分页响应
export interface VideoPageResp {
  count: number;
  list: VideoInfo[];
}

// 获取视频列表
export const useVideoList = (params: VideoPageReq) => {
  const apiUrl = `/answer/api/v1/video/page?${qs.stringify(params)}`;
  const { data, error, mutate } = useSWR<VideoPageResp, Error>(apiUrl, (url) =>
    request.get(url, { allow404: true }),
  );
  return {
    data,
    isLoading: !data && !error,
    error,
    mutate,
  };
};

// 获取单个视频详情
export const getVideoInfo = (id: string) => {
  const apiUrl = `/answer/api/v1/video/info?id=${id}`;
  return request.get<VideoInfo>(apiUrl);
};

// 创建视频请求参数
export interface CreateVideoReq {
  title: string;
  category: string;
  cover: string;
  video_type: 'recorded' | 'live';
  is_recommend: boolean;
  is_show: boolean;
  start_time: string;
  duration: number;
  description: string;
  content: string;
  author_avatar: string;
  author_name: string;
  author_intro: string;
  topics: string;
  embed_code: string;
  external_link: string;
}

// 更新视频请求参数
export interface UpdateVideoReq extends CreateVideoReq {
  id: string;
}

// 创建视频响应
export interface CreateVideoResp {
  id: string;
}

// 更新视频响应
export interface UpdateVideoResp {
  id: string;
}

// 删除视频请求参数
export interface DeleteVideoReq {
  id: string;
}

// 创建视频
export const createVideo = (data: CreateVideoReq) => {
  return request.post<CreateVideoResp>('/answer/api/v1/video/create', data);
};

// 更新视频
export const updateVideo = (data: UpdateVideoReq) => {
  return request.put<UpdateVideoResp>('/answer/api/v1/video/update', data);
};

// 删除视频
export const deleteVideo = (data: DeleteVideoReq) => {
  return request.delete('/answer/api/v1/video/delete', data);
};

// 批量删除视频
export const batchDeleteVideo = (videoIds: string[]) => {
  return request.delete('/answer/api/v1/video/batch-delete', videoIds);
};
