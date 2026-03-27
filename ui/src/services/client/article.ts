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
import type * as Type from '@/common/interface';

// 文章列表查询接口，使用我们新实现的 /content/page 接口
export const useArticleList = (params: Type.QueryQuestionsReq) => {
  // 设置 content_type=2 只获取文章
  const apiParams = { ...params, content_type: 2 };
  const apiUrl = `/answer/api/v1/content/page?${qs.stringify(apiParams)}`;
  const { data, error } = useSWR<Type.ListResult, Error>(apiUrl, (url) =>
    request.get(url, { allow404: true }),
  );
  return {
    data,
    isLoading: !data && !error,
    error,
  };
};

// 热门文章查询接口
export const useHotArticles = (
  params: Type.QueryQuestionsReq = {
    page: 1,
    page_size: 6,
    order: 'hot',
    in_days: 7,
  },
) => {
  // 设置 content_type=2 只获取文章
  const apiParams = { ...params, content_type: 2 };
  const apiUrl = `/answer/api/v1/content/page?${qs.stringify(apiParams)}`;
  const { data, error } = useSWR<Type.ListResult, Error>(
    [apiUrl],
    request.instance.get,
  );
  return {
    data,
    isLoading: !data && !error,
    error,
  };
};

// 相似文章查询接口（基于标签）
export const useSimilarArticles = (params: {
  question_id: string;
  page_size: number;
}) => {
  const apiUrl = `/answer/api/v1/question/similar/tag?${qs.stringify(params)}`;

  const { data, error } = useSWR<Type.ListResult, Error>(
    params.question_id ? apiUrl : null,
    request.instance.get,
  );
  return {
    data,
    isLoading: !data && !error,
    error,
  };
};
