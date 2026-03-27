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
	"fmt"

	"xorm.io/xorm"
)

func updateVideoCodeFieldToText(ctx context.Context, x *xorm.Engine) error {
	// 检查当前数据库类型
	dialect := x.Dialect().URI().DBType

	var alterSQL string
	switch dialect {
	case "mysql":
		alterSQL = "ALTER TABLE `video` MODIFY COLUMN `code` TEXT NOT NULL"
	case "postgres":
		alterSQL = "ALTER TABLE video ALTER COLUMN code TYPE TEXT"
	case "sqlite3":
		// SQLite 不支持直接修改列类型，需要重建表
		// 但由于这是一个简单的扩展操作，SQLite通常能处理更大的文本
		// 我们可以跳过SQLite的处理，因为TEXT在SQLite中本来就是动态的
		return nil
	default:
		return fmt.Errorf("unsupported database type: %s", dialect)
	}

	// 执行ALTER TABLE语句
	_, err := x.Context(ctx).Exec(alterSQL)
	if err != nil {
		return fmt.Errorf("failed to alter video.code column: %w", err)
	}

	return nil
}
