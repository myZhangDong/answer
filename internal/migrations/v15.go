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

package migrations

import (
	"context"

	"github.com/apache/answer/internal/entity"
	"xorm.io/xorm"
)

func addNoticeConfig(ctx context.Context, x *xorm.Engine) error {
	return x.Context(ctx).Sync(new(entity.UserNotificationConfig))
}

func addQuestionType(ctx context.Context, x *xorm.Engine) error {
	type Question struct {
		ID   string `xorm:"not null pk BIGINT(20) id"`
		Type int    `xorm:"not null default 1 INT(11) type"`
	}

	// 添加type字段
	err := x.Context(ctx).Sync(new(Question))
	if err != nil {
		return err
	}

	// 为现有数据设置默认值（问题类型）
	_, err = x.Context(ctx).Exec("UPDATE question SET type = 1 WHERE type = 0 OR type IS NULL")
	return err
}
