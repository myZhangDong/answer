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

import { FC } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import { usePageTags } from '@/hooks';
import {
  FollowingTags,
  QuestionList,
  HotQuestions,
  CustomSidebar,
} from '@/components';
import { loggedUserInfoStore } from '@/stores';
import { useArticleList } from '@/services';
import * as Type from '@/common/interface';
import { QUESTION_ORDER_KEYS } from '@/components/QuestionList';

const Articles: FC = () => {
  const { user: loggedUser } = loggedUserInfoStore((_) => _);
  const [urlSearchParams] = useSearchParams();
  const curPage = Number(urlSearchParams.get('page')) || 1;
  const curOrder = (urlSearchParams.get('order') ||
    QUESTION_ORDER_KEYS[0]) as Type.QuestionOrderBy;
  const reqParams: Type.QueryQuestionsReq = {
    page_size: 20,
    page: curPage,
    order: curOrder as Type.QuestionOrderBy,
  };
  const { data: listData, isLoading: listLoading } = useArticleList(reqParams);
  const pageTitle = '技术文章';
  const slogan = '分享技术知识，交流开发经验';

  usePageTags({ title: pageTitle, subtitle: slogan });
  return (
    <Row className="pt-4 mb-5">
      <Col className="page-main flex-auto">
        <QuestionList
          source="questions"
          data={listData}
          order={curOrder}
          orderList={QUESTION_ORDER_KEYS.filter((key) => key !== 'recommend')}
          isLoading={listLoading}
        />
      </Col>
      <Col className="page-right-side mt-4 mt-xl-0">
        <CustomSidebar />
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">关于技术文章</h5>
            <p className="card-text">
              这里汇集了优质的技术文章，涵盖各种编程语言、框架和最佳实践。
            </p>
          </div>
        </div>
        {loggedUser.access_token && <FollowingTags />}
        <HotQuestions />
      </Col>
    </Row>
  );
};

export default Articles;
