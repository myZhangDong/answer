# 内容门户化改造 Baseline

## 目的

这份文档用于固定内容门户化改造在 Phase 1 完成后的执行基线，避免后续 Phase 2 以后继续推进时反复争论“当前到底保留什么、依赖什么、先裁什么”。

## 结论摘要

### 1. 文章链路当前并未独立于 question/answer 模型

当前文章仍然建立在原有 `question` 体系之上，只是通过 `content_type=2` 区分为文章。

现状：

- 文章列表使用 `/answer/api/v1/content/page?content_type=2`
- 文章详情仍使用 `/answer/api/v1/question/info?id=...`
- 旧前端创建文章仍调用 `/answer/api/v1/question`
- 旧前端文章详情仍按 `QuestionDetailRes` 消费

结论：

- Phase 1 已确认文章数据链路仍然耦合在 `question` 模型内
- Phase 2 及后续阶段不能假设文章是完全独立的后端领域模型
- 后续做公开 API 白名单和后台精简时，要把“文章=question(content_type=2)”当作兼容前提

### 2. 管理员登录本轮继续复用现有后台鉴权

当前真正可用的管理员登录与后台管理链路仍然依赖旧 `ui/` 与现有后端鉴权。

现状：

- 旧前端 `ui/` 通过现有登录态和 `guard.admin()` 进入 `/admin`
- 现有登录接口仍是 `/answer/api/v1/user/login/email`
- `ui-next` 虽然已经有 `/admin` 页面，但管理接口层仍是 stub，未接真实认证与后端

结论：

- Phase 1 已确认本轮继续复用现有后台鉴权
- `ui-next` 当前只作为新前台主线，不作为当前后台生产链路
- 后续如果要迁移后台到 `ui-next`，需要单独立项接通认证与内容管理接口

### 3. 搜索建议保留在前台

建议保留搜索，但搜索范围只服务当前内容门户，不再服务社区场景。

原因：

- `ui-next` 已实现搜索页
- 内容门户场景下搜索仍然是高价值能力
- 后续只需将搜索结果约束在文章、视频、项目三类内容

结论：

- Phase 1 基线默认保留前台搜索
- Phase 5 做 API 白名单时保留搜索相关接口，但要限制为内容站范围

### 4. 标签不保留独立社区页，只保留文章聚合/筛选能力

当前方向应收敛为“标签服务于文章”，而不是保留完整社区标签系统。

现状：

- `ui-next` 当前没有独立标签页，只有文章分类/标签筛选语义
- 旧 `ui/` 仍保留 Tags 页面和相关路由

结论：

- Phase 1 基线不保留独立社区标签页
- 标签只作为文章列表筛选、文章详情展示、相关文章聚合等能力保留

### 5. 当前后台内容管理能力存在一处显式缺口

视频和项目已经有相对完整的旧后台管理链路，但文章还没有独立后台管理菜单。

现状：

- 视频管理在旧后台 `/admin/videos`
- 项目管理在旧后台 `/admin/projects`
- 文章目前主要是旧前台路由下的 `/articles/create` 和相关文章页

结论：

- “文章管理入口”是后续阶段必须补齐的事项
- 在补齐之前，不应误判为后台内容管理已经完全对齐

## 前台白名单页面

### 新前台 `ui-next/` 公共页面白名单

- `/`
- `/article/:id`
- `/videos`
- `/video/:id`
- `/projects`
- `/project/:id`
- `/search`

说明：

- 这份白名单代表内容门户前台的目标公开页面
- `ui-next` 当前没有独立标签页
- `ui-next` 的 `/admin` 目前不计入生产可用后台白名单

### 旧前台 `ui/` 在迁移阶段的临时保留页面

- `/articles`
- `/articles/:aid`
- `/articles/create`
- `/video`
- `/video/:id`
- `/projects`
- `/projects/:id`
- `/search`

说明：

- 这些页面仍可能被用于参考旧实现、兼容链路或后台临时内容录入
- 但它们不是最终产品形态，后续会逐步被 `ui-next/` 和新白名单替代

## 后台白名单页面

### 当前生产可用后台白名单

以下页面以旧 `ui/` 管理后台为准：

- `/admin/dashboard`
- `/admin/videos`
- `/admin/videos/edit/:id`
- `/admin/projects`
- `/admin/projects/edit/:id`
- `/admin/themes`
- `/admin/customize`
- `/admin/general`
- `/admin/interface`
- `/admin/branding`
- `/admin/legal`
- `/admin/write`
- `/admin/seo`
- `/admin/login`
- `/admin/installed-plugins`

### 临时兼容保留但不属于最终内容后台的信息页

- `/admin`
- `/admin/smtp`

说明：

- `/admin` 是后台入口容器页，默认仍保留
- `smtp` 不属于内容运营，但在站点邮件与登录链路上仍可能被依赖，暂不建议过早移除

### 后续应隐藏或下线路由

- `/admin/questions`
- `/admin/answers`
- `/admin/users`
- `/admin/settings-users`
- `/admin/privileges`
- `/admin/badges`

说明：

- 这些页面属于社区运营能力，不属于内容门户目标范围

### 当前后台缺口

以下能力应视为后续待补齐，而不是已完成：

- 独立的文章后台管理入口
- `ui-next` 后台真实认证接入
- `ui-next` 后台真实内容管理接口接入

## API 白名单

### 公共 API 白名单

### 站点基础

- `GET /answer/api/v1/language/config`
- `GET /answer/api/v1/language/options`
- `GET /answer/api/v1/siteinfo`
- `GET /answer/api/v1/siteinfo/legal`

### 内容门户公共内容

- `GET /answer/api/v1/content/page`
- `GET /answer/api/v1/question/info`
- `GET /answer/api/v1/video/page`
- `GET /answer/api/v1/video/info`
- `GET /answer/api/v1/project/page`
- `GET /answer/api/v1/project/info`

### 搜索与文章标签

- `GET /answer/api/v1/search`
- `GET /answer/api/v1/search/desc`
- `GET /answer/api/v1/question/similar/tag`
- `GET /answer/api/v1/question/tags`

说明：

- 标签接口仅用于文章筛选或联想，不代表保留旧社区标签页

### 管理员登录与会话 API 白名单

- `POST /answer/api/v1/user/login/email`
- `GET /answer/api/v1/user/info`
- `GET /answer/api/v1/user/logout`
- `GET /answer/api/v1/permission`

说明：

- 本轮仍复用现有登录会话体系

### 内容管理 API 白名单

### 文章

- `POST /answer/api/v1/question`
- `PUT /answer/api/v1/question`
- `POST /answer/api/v1/file`
- `POST /answer/api/v1/post/render`

说明：

- 当前文章创建和编辑仍复用 `question` 写接口

### 视频

- `POST /answer/api/v1/video/create`
- `PUT /answer/api/v1/video/update`
- `DELETE /answer/api/v1/video/delete`
- `DELETE /answer/api/v1/video/batch-delete`

### 项目

- `POST /answer/api/v1/project`
- `PUT /answer/api/v1/project`
- `DELETE /answer/api/v1/project`
- `DELETE /answer/api/v1/project/batch-delete`

### 管理后台配置 API 白名单

- `GET /answer/api/v1/admin/dashboard`
- `GET /answer/api/v1/admin/siteinfo/general`
- `PUT /answer/api/v1/admin/siteinfo/general`
- `GET /answer/api/v1/admin/siteinfo/interface`
- `PUT /answer/api/v1/admin/siteinfo/interface`
- `GET /answer/api/v1/admin/siteinfo/branding`
- `PUT /answer/api/v1/admin/siteinfo/branding`
- `GET /answer/api/v1/admin/siteinfo/write`
- `PUT /answer/api/v1/admin/siteinfo/write`
- `GET /answer/api/v1/admin/siteinfo/legal`
- `PUT /answer/api/v1/admin/siteinfo/legal`
- `GET /answer/api/v1/admin/siteinfo/seo`
- `PUT /answer/api/v1/admin/siteinfo/seo`
- `GET /answer/api/v1/admin/siteinfo/login`
- `PUT /answer/api/v1/admin/siteinfo/login`
- `GET /answer/api/v1/admin/siteinfo/custom-css-html`
- `PUT /answer/api/v1/admin/siteinfo/custom-css-html`
- `GET /answer/api/v1/admin/siteinfo/theme`
- `PUT /answer/api/v1/admin/siteinfo/theme`
- `GET /answer/api/v1/admin/plugins`
- `GET /answer/api/v1/admin/plugin/config`
- `PUT /answer/api/v1/admin/plugin/config`
- `PUT /answer/api/v1/admin/plugin/status`

## 本阶段对后续阶段的约束

- Phase 2 应按这份白名单裁剪前台导航与页面入口
- Phase 3 应按这份白名单裁剪后台菜单
- Phase 4 应按这份白名单裁剪前端 service 导出
- Phase 5 应按这份白名单裁剪公开 API 和管理 API
- 在单独完成后台迁移前，不应把 `ui-next` `/admin` 当作已上线后台
