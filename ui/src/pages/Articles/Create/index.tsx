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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import fm from 'front-matter';

import { usePageTags, usePromptWithUnload } from '@/hooks';
import { Editor, EditorRef, TagSelector } from '@/components';
import type * as Type from '@/common/interface';
import { DRAFT_QUESTION_STORAGE_KEY } from '@/common/constants';
import {
  saveQuestion,
  queryQuestionByTitle,
  getTagsBySlugName,
} from '@/services';
import { handleFormError, SaveDraft, storageExpires } from '@/utils';
import { pathFactory } from '@/router/pathFactory';
import SearchQuestion from '../../Questions/Ask/components/SearchQuestion';

interface FormDataItem {
  title: Type.FormValue<string>;
  tags: Type.FormValue<Type.Tag[]>;
  content: Type.FormValue<string>;
}

const saveDraft = new SaveDraft({ type: 'question' });

const CreateArticle = () => {
  const initFormData = {
    title: {
      value: '',
      isInvalid: false,
      errorMsg: '',
    },
    tags: {
      value: [],
      isInvalid: false,
      errorMsg: '',
    },
    content: {
      value: '',
      isInvalid: false,
      errorMsg: '',
    },
  };
  const { t } = useTranslation('translation', { keyPrefix: 'ask' });
  const [formData, setFormData] = useState<FormDataItem>(initFormData);
  const [blockState, setBlockState] = useState(false);
  const [focusType, setForceType] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const resetForm = () => {
    setFormData(initFormData);
    setForceType('');
  };
  const [similarQuestions, setSimilarQuestions] = useState([]);

  const editorRef = useRef<EditorRef>({
    getHtml: () => '',
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const updateTags = (tags: string) => {
    getTagsBySlugName(tags).then((resp) => {
      // eslint-disable-next-line
      handleTagsChange(resp);
    });
  };

  const removeDraft = () => {
    saveDraft.save.cancel();
    saveDraft.remove();
    setHasDraft(false);
  };

  useEffect(() => {
    // order: 1. tags query. 2. prefill query. 3. draft
    const queryTags = searchParams.get('tags');
    if (queryTags) {
      updateTags(queryTags);
    }
    const draft = storageExpires.get(DRAFT_QUESTION_STORAGE_KEY);

    const prefill = searchParams.get('prefill');
    if (prefill || draft) {
      if (prefill) {
        const file = fm<any>(decodeURIComponent(prefill));
        formData.title.value = file.attributes?.title;
        formData.content.value = file.body;
        if (!queryTags && file.attributes?.tags) {
          // Remove spaces in file.attributes.tags
          const filterTags = file.attributes.tags
            .split(',')
            .map((tag) => tag.trim())
            .join(',');
          updateTags(filterTags);
        }
      } else if (draft) {
        formData.title.value = draft.title;
        formData.content.value = draft.content;
        formData.tags.value = draft.tags;
        setHasDraft(true);
      }
      setFormData({ ...formData });
    } else {
      resetForm();
    }

    return () => {
      resetForm();
    };
  }, []);

  useEffect(() => {
    const { title, tags, content } = formData;
    // write
    if (title.value || content.value || tags.value.length > 0) {
      setBlockState(true);
      const {
        title: draftTitle,
        tags: draftTags,
        content: draftContent,
      } = formData;
      saveDraft.save.cancel();
      saveDraft.save({
        params: {
          title: draftTitle.value,
          tags: draftTags.value,
          content: draftContent.value,
          answer_content: '', // 文章不需要回答内容
        },
        callback: () => setHasDraft(true),
      });
    } else {
      setBlockState(false);
    }
  }, [formData.title.value, formData.content.value, formData.tags.value]);

  usePromptWithUnload({
    when: blockState,
  });

  const searchQuestions = useCallback(
    debounce((value: string) => {
      queryQuestionByTitle(value).then((resp) => {
        setSimilarQuestions(resp?.list || []);
      });
    }, 200),
    [setSimilarQuestions],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      title: { value: e.target.value, isInvalid: false, errorMsg: '' },
    });
    if (e.target.value) {
      searchQuestions(e.target.value);
    }
  };

  const handleContentChange = (value: string) =>
    setFormData({
      ...formData,
      content: { value, errorMsg: '', isInvalid: false },
    });

  const handleTagsChange = (value) =>
    setFormData({
      ...formData,
      tags: { value, errorMsg: '', isInvalid: false },
    });

  const deleteDraft = () => {
    removeDraft();
    resetForm();
  };

  const submitQuestion = async (params) => {
    const { title, tags, content } = params;
    // 对于文章，设置type为2，且不回答自己的问题
    const articleParams = {
      title,
      content,
      tags, // 直接使用标签对象数组，不需要转换
      type: 2, // 文章类型
    };

    try {
      const res = await saveQuestion(articleParams);
      await removeDraft();
      navigate(pathFactory.articleLanding(res.id, res.url_title), {
        state: { isReview: res?.wait_for_review },
      });
    } catch (err: any) {
      if (err.isError) {
        const data = handleFormError(err, formData);
        setFormData({ ...data });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const params = {
      title: formData.title.value,
      content: editorRef.current?.getHtml() || '',
      tags: formData.tags.value,
      url_title: formData.title.value,
    };

    submitQuestion(params);
  };

  const bool = similarQuestions.length > 0;
  const pageTitle = '创建文章';

  usePageTags({
    title: pageTitle,
  });

  return (
    <div className="pt-4 mb-5">
      <h3 className="mb-4">创建文章</h3>
      <Row>
        <Col className="page-main flex-auto">
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group controlId="title" className="mb-3">
              <Form.Label>文章标题</Form.Label>
              <Form.Control
                type="text"
                value={formData.title.value}
                isInvalid={formData.title.isInvalid}
                onChange={handleTitleChange}
                placeholder="请输入文章标题"
                autoFocus
                contentEditable
              />
              <Form.Control.Feedback type="invalid">
                {formData.title.errorMsg}
              </Form.Control.Feedback>
              {bool && <SearchQuestion similarQuestions={similarQuestions} />}
            </Form.Group>

            <Form.Group controlId="content">
              <Form.Label>文章内容</Form.Label>
              <Editor
                value={formData.content.value}
                onChange={handleContentChange}
                className={classNames(
                  'form-control p-0',
                  focusType === 'content' && 'focus',
                  formData.content.isInvalid && 'is-invalid',
                )}
                onFocus={() => {
                  setForceType('content');
                }}
                onBlur={() => {
                  setForceType('');
                }}
                ref={editorRef}
              />
              <Form.Control.Feedback type="invalid">
                {formData.content.errorMsg}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="tags" className="my-3">
              <Form.Label>文章标签</Form.Label>
              <TagSelector
                value={formData.tags.value}
                onChange={handleTagsChange}
                showRequiredTag
                maxTagLength={5}
                isInvalid={formData.tags.isInvalid}
                errMsg={formData.tags.errorMsg}
              />
            </Form.Group>

            {/* 文章不显示回答自己问题的开关 */}

            <div className="mt-3">
              <Button type="submit" className="me-2">
                发布文章
              </Button>

              {hasDraft && (
                <Button variant="link" onClick={deleteDraft}>
                  {t('discard_draft', { keyPrefix: 'btns' })}
                </Button>
              )}
            </div>
          </Form>
        </Col>
        <Col className="page-right-side mt-4 mt-xl-0">
          <Card>
            <Card.Header>文章创建指南</Card.Header>
            <Card.Body className="fmt small">
              <p>创建优质文章的建议：</p>
              <ul>
                <li>使用清晰简洁的标题</li>
                <li>合理使用标签分类文章</li>
                <li>内容结构化，使用标题、列表等</li>
                <li>添加相关的代码示例或图片</li>
                <li>确保内容对读者有价值</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateArticle;
