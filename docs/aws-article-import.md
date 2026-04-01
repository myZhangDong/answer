# aws_article 数据迁移说明

本文档说明如何使用仓库内置命令，将旧站 `aws_article` 迁移到当前 Answer 的文章模型。

## 目标

迁移目标是当前 Answer 的文章链路，而不是旧问题链路：

- `question.type = 2`
- `meta.key = question.article.author`
- `tag/tag_rel`
- `revision`

说明：

- 本命令只读取旧库 `aws_article/aws_users/aws_category`
- 不迁移旧问题表
- 不迁移评论明细、点赞明细、收藏明细
- 同一篇文章重复执行会自动跳过，不会重复导入

## 前置条件

上线执行前，建议先完成这几件事：

1. 备份目标库
2. 确认线上 `data` 目录
3. 确认新站中用于挂载迁移文章的本地用户 ID
4. 重新编译二进制

编译命令：

```bash
go build -o ./answer ./cmd/answer
```

## 命令

命令名：

```bash
./answer import-aws-article
```

常用参数：

- `-C, --data-path`
  指向当前 Answer 运行配置目录，例如 `/app/data`
- `--source-dsn`
  旧库 MySQL DSN，例如 `root:pass@tcp(host:3306)/bbs2021`
- `--target-user-id`
  新站本地用户 ID。迁移文章会统一挂到这个用户下
- `--source-user-id`
  只迁移指定旧站用户 ID 的文章。可重复传入，也可逗号分隔
- `--min-views`
  只迁移浏览量大于等于该值的文章
- `--limit`
  最大迁移数量。传 `0` 表示不限制
- `--include-deleted`
  包含已删除文章。默认不迁已删除文章

## 迁移规则

- 旧作者账号不会直接映射到新站 `user`
- 迁移文章统一归属到 `--target-user-id` 指定的新站用户
- 旧作者名仍会写入 `question.article.author`，前台展示按旧作者名显示
- 旧分类会按标签迁移
- 排序按 `aws_article.add_time DESC, id DESC`

## 线上示例

假设：

- 线上 `data` 目录是 `/app/data`
- 线上本地挂载用户 ID 是 `12345`
- 源库是 `bbs2021`

### 1. 迁移旧用户 `36298` 的最近高浏览文章 500 篇

条件：

- 源用户 ID = `36298`
- 浏览量 `>= 100`
- 最多迁移 `500` 篇

命令：

```bash
./answer import-aws-article \
  -C /app/data \
  --source-dsn 'root:thinkcmf@tcp(120.26.119.226:3306)/bbs2021' \
  --target-user-id 12345 \
  --source-user-id 36298 \
  --min-views 100 \
  --limit 500
```

### 2. 迁移旧用户 `33607` 的全部文章

条件：

- 源用户 ID = `33607`
- 不限制浏览量
- 不限制数量

命令：

```bash
./answer import-aws-article \
  -C /app/data \
  --source-dsn 'root:thinkcmf@tcp(120.26.119.226:3306)/bbs2021' \
  --target-user-id 12345 \
  --source-user-id 33607 \
  --limit 0
```

## 返回结果

执行后会输出类似结果：

```text
导入完成：请求 500 篇，成功 480 篇，跳过 20 篇
- 源文章 825369904 => 目标文章 10010000000000067 [imported] 示例标题
- 源文章 825369903 => 目标文章 10010000000000069 [skipped] 示例标题
```

状态说明：

- `imported`：本次新导入
- `skipped`：之前已经导入过，本次命中映射表自动跳过

## 注意事项

1. 如果改了 Go 代码，只重启旧进程不会生效，必须重新编译二进制
2. 迁移命令会连接两个库：旧站源库 + 当前 Answer 目标库
3. 正文如果来自旧站 HTML，当前前端已兼容 HTML 显示
4. 如果要先做小范围验证，优先加 `--limit 10`
5. 建议分批执行，不要第一次就做超大批量全量迁移
