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

import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CustomSidebar } from '@/components';
import { loggedUserInfoStore, toastStore } from '@/stores';
import { scrollToDocTop } from '@/utils';
import { usePageTags, usePageUsers, useSkeletonControl } from '@/hooks';
import type { QuestionDetailRes } from '@/common/interface';
import { questionDetail } from '@/services';
import {
  Question,
  RelatedQuestions,
  Alert,
  ContentLoader,
  LinkedQuestions,
} from '../../Questions/Detail/components';

import './index.scss';

const ArticleDetail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('translation');
  const { aid = '' } = useParams();

  const [article, setArticle] = useState<QuestionDetailRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isSkeletonShow } = useSkeletonControl(isLoading);
  const { setUsers } = usePageUsers();
  const userInfo = loggedUserInfoStore((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.isReview) {
      toastStore.getState().show({
        msg: t('review', { keyPrefix: 'toast' }),
        variant: 'warning',
      });

      // remove state isReview
      const newLocation = { ...location };
      delete newLocation.state;
      window.history.replaceState(null, '', newLocation.pathname);
    }
  }, [location.state]);

  const getDetail = async () => {
    setIsLoading(true);
    try {
      const res = await questionDetail(aid);
      if (res) {
        setUsers([
          {
            id: res.user_info?.id,
            displayName: res.user_info?.display_name,
            userName: res.user_info?.username,
            avatar_url: res.user_info?.avatar,
          },
          {
            id: res?.update_user_info?.id,
            displayName: res?.update_user_info?.display_name,
            userName: res?.update_user_info?.username,
            avatar_url: res?.update_user_info?.avatar,
          },
        ]);
        setArticle(res);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const initPage = (type: string) => {
    if (type === 'delete_question') {
      setTimeout(() => {
        navigate('/articles', { replace: true });
      }, 1000);
      return;
    }
    if (type === 'default') {
      scrollToDocTop();
      getDetail();
    }
  };

  useEffect(() => {
    if (!aid) {
      return;
    }
    getDetail();
  }, [aid]);

  usePageTags({
    title: article?.title,
    description: article?.description,
    keywords: article?.tags.map((_) => _.slug_name).join(','),
  });

  const showLinkedQuestions = article?.id && article.id !== '';

  return (
    <Row className="articleDetailPage pt-4 mb-5">
      <Col className="page-main flex-auto">
        {article?.operation?.level && <Alert data={article.operation} />}
        {isSkeletonShow ? (
          <ContentLoader />
        ) : (
          <Question
            data={article}
            initPage={initPage}
            hasAnswer={false}
            isLogged={Boolean(userInfo?.access_token)}
          />
        )}

        {/* 文章详情页面不显示回答相关内容 */}
        {/* 这里可以添加文章特有的功能，比如分享、点赞等 */}
      </Col>
      <Col className="page-right-side mt-4 mt-xl-0">
        <CustomSidebar />
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">关于此文章</h5>
            <p className="card-text">
              这是一篇技术文章，您可以在下方留下评论与作者交流。
            </p>
          </div>
        </div>
        {showLinkedQuestions ? <LinkedQuestions id={article.id} /> : null}
        <RelatedQuestions id={article?.id || ''} />
      </Col>
    </Row>
  );
};

export default ArticleDetail;
