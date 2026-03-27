# Video 测试数据插入指南

本文档介绍了几种将 video 测试数据插入到 Answer 数据库的方法。

## 前提条件

1. Answer 项目已完成初始化
2. MySQL 数据库已运行（根据 config.yaml 配置：localhost:8889）
3. 数据库迁移已执行，video 表已创建

## 方法 1: 使用 MySQL 客户端直接执行 SQL

这是最直接的方法，适合有 MySQL 客户端访问权限的情况。

### 步骤：

```bash
# 查看MySQL连接命令
./insert_data_mysql.sh

# 执行SQL文件
mysql -h localhost -P 8889 -u root -proot answer < test_video_data.sql

# 或者交互式执行
mysql -h localhost -P 8889 -u root -proot answer
# 然后复制粘贴test_video_data.sql中的INSERT语句
```

### 验证数据：

```sql
SELECT COUNT(*) FROM video;
SELECT id, title, author_name, type FROM video;
```

## 方法 2: 使用数据库迁移

这种方法将测试数据插入作为数据库迁移的一部分，更加规范和可重复。

### 文件：

- `internal/migrations/v28.go` - 插入测试数据的迁移文件
- 已添加到 `internal/migrations/migrations.go` 中

### 执行：

```bash
# 运行数据库迁移（会自动执行所有未运行的迁移）
./answer upgrade

# 或者如果数据库已初始化，重启服务会自动执行迁移
./answer run
```

### 优点：

- ✅ 数据插入是可重复的（不会重复插入相同 ID 的数据）
- ✅ 与项目的数据库管理流程一致
- ✅ 可以版本控制

## 方法 3: 使用 Go 程序插入

创建了专门的 Go 程序来插入测试数据。

### 文件：

- `cmd/insert_video_data/main.go`

### 执行：

```bash
# 编译并运行数据插入程序
go run cmd/insert_video_data/main.go
```

### 特点：

- ✅ 自动检查数据库连接
- ✅ 检查 video 表是否存在
- ✅ 避免重复插入相同 ID 的数据
- ✅ 提供详细的执行日志

## 测试数据说明

插入的测试数据包含 3 个视频：

1. **Go 语言入门教程** (ID: 1000000000000001)

   - 类型: tutorial
   - 推荐: 是
   - 作者: 张老师

2. **React 开发实战** (ID: 1000000000000002)

   - 类型: advanced
   - 推荐: 是
   - 作者: 李老师

3. **数据库设计原理** (ID: 1000000000000003)
   - 类型: theory
   - 推荐: 否
   - 作者: 王老师

## 验证 Video 接口

数据插入完成后，可以通过以下方式验证 Video 接口：

### 1. 启动 Answer 服务

```bash
./answer run
```

### 2. 测试 API 接口

```bash
# 获取视频列表
curl "http://localhost:80/answer/api/v1/video/page?page=1&page_size=10"

# 搜索视频
curl "http://localhost:80/answer/api/v1/video/page?search=Go"

# 按类型筛选
curl "http://localhost:80/answer/api/v1/video/page?type=tutorial"

# 获取单个视频详情
curl "http://localhost:80/answer/api/v1/video/info?id=1000000000000001"
```

### 3. 使用测试脚本

```bash
# 运行API测试脚本
./test_video_api.sh
```

## 推荐方法

**推荐使用方法 2（数据库迁移）**，原因：

- 与项目架构一致
- 可重复执行
- 自动化程度高
- 不需要手动操作数据库

如果需要快速测试，可以使用方法 3（Go 程序）。

## 注意事项

1. 确保 MySQL 服务正在运行
2. 确保数据库连接配置正确
3. 如果修改了数据库配置，需要相应更新连接字符串
4. 测试数据使用固定 ID，避免与真实数据冲突
