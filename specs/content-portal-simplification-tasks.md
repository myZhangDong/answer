# 内容门户化改造任务清单

## 使用方式

这份清单按执行顺序组织。建议一阶段一阶段完成，不要一开始就全量删除旧模块。

状态建议：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成

## Phase 0：跑通 `ui-next` 并接现有后端接口

目标：先让新前端可运行、可取数，再开始替换和裁剪旧前端。

### 技术栈确认

- [x] 确认 `ui-next/package.json` 的依赖与脚本
- [x] 确认 `ui-next/` 是 `Vite + React` 静态前端
- [x] 确认构建产物默认输出目录
- [x] 确认路由模式是否为浏览器路由
- [x] 确认是否需要新增 `.env` 或 API 配置文件

### 本地运行

- [x] 安装 `ui-next/` 依赖
- [x] 启动 `ui-next` 开发环境
- [x] 确认首页可访问
- [x] 确认页面路由无静态资源错误
- [x] 确认样式和字体资源可正常加载

### API 基础层

- [x] 在 `ui-next/` 中建立统一请求封装
- [x] 配置后端基础地址
- [ ] 统一错误处理和超时策略
- [x] 统一本地开发环境 API 代理或跨域方案

### 核心数据对接

- [x] 对接文章列表接口
- [x] 对接文章详情接口
- [x] 对接视频列表接口
- [x] 对接视频详情接口
- [x] 对接项目列表接口
- [x] 对接项目详情接口

### 接口映射

- [x] 梳理 `ui-next` 页面与当前后端 API 的映射关系
- [x] 标记哪些接口可以直接复用
- [x] 标记哪些接口需要适配或补充

验收：

- [x] `ui-next` 可以独立运行
- [~] 文章、视频、项目页面都能从现有后端获取真实数据
- [~] 新前端替换旧前端具备最小可行闭环

备注：

- 已完成 `ui-next` 统一 API 基础层、Vite `/answer` 代理、文章/视频/项目列表与详情页的数据接线。
- 已修复一轮联调中发现的前端运行时问题，并于 2026-03-24 本地执行 `npm run build` 通过。
- 仍建议继续做一轮人工联调，重点核对真实后端返回内容与页面字段映射是否完全一致，尤其是文章正文格式、视频嵌入代码、项目仓库链接展示。

## Phase 1：基线确认

- [ ] 确认文章的数据链路是否完全独立于 question/answer 模型
- [ ] 确认管理员登录继续复用现有后台鉴权，不在本轮重写
- [ ] 确认搜索是否保留在前台
- [ ] 确认标签页是否仅用于文章聚合
- [ ] 列出必须保留的后台页面白名单

输出物：

- 前台白名单页面清单
- 后台白名单页面清单
- API 白名单清单

## Phase 2：前台路由与导航收口

目标：让前台只剩文章、视频、项目。

### 路由

- [ ] 修改 `ui/src/router/routes.ts`
- [ ] 移除或禁用 Questions 相关路由
- [ ] 移除或禁用 Users 相关路由
- [ ] 移除或禁用 Review 相关路由
- [ ] 移除或禁用 Badges 相关路由
- [ ] 移除或禁用 UserCenter 相关路由
- [ ] 保留 Articles、Video、Projects、Admin、Legal、404、50x

### 前台导航

- [ ] 修改 `ui/src/components/SideNav/index.tsx`
- [ ] 仅保留文章、视频、项目入口
- [ ] 去掉 Questions、Tags、Users、Badges、Review 入口
- [ ] 检查 `ui/src/components/MobileSideNav/`

### Header

- [ ] 修改 `ui/src/components/Header/index.tsx`
- [ ] 去掉普通用户登录/注册入口
- [ ] 去掉通知红点与通知入口
- [ ] 去掉“创建问题”
- [ ] 保留管理员入口或仅在管理员登录后显示后台入口
- [ ] 评估是否保留搜索框

### 页面清理

- [ ] 确认首页默认落到文章列表还是自定义门户页
- [ ] 检查 `ui/src/pages/Layout/` 是否仍引用社区文案
- [ ] 检查文章、视频、项目页面中的用户信息展示，去掉不必要用户语义

验收：

- [ ] 未登录访客进入站点时，看不到社区型入口
- [ ] 前台路由不再能进入原用户与问答页面

## Phase 3：后台菜单精简

目标：后台只保留内容运营能力。

### 后台路由

- [ ] 修改 `ui/src/router/routes.ts` 中 `admin` 子路由
- [ ] 保留 `dashboard`
- [ ] 保留 `videos`
- [ ] 保留 `projects`
- [ ] 补齐或确认 `articles` 管理入口
- [ ] 保留 Branding / Interface / General / Legal / SEO / Theme / Login / CSS & HTML
- [ ] 隐藏 Questions / Answers / Users / SettingsUsers / Privileges / Badges

### 后台导航

- [ ] 修改 `ui/src/components/AdminSideNav/index.tsx`
- [ ] 修改后台菜单常量定义，通常位于 `ui/src/common/constants.ts`
- [ ] 将菜单白名单化，而不是逐个判断隐藏

### 后台页面

- [ ] 检查 `ui/src/pages/Admin/Questions/`
- [ ] 检查 `ui/src/pages/Admin/Answers/`
- [ ] 检查 `ui/src/pages/Admin/Users/`
- [ ] 检查 `ui/src/pages/Admin/Badges/`
- [ ] 确认这些页面先下线路由，不要求第一轮立即删除源码

验收：

- [ ] 管理员进入后台后，只看到内容运营相关菜单
- [ ] 文章、视频、项目录入链路可用

## Phase 4：前端 service 白名单化

目标：前端只暴露当前产品需要的接口封装。

### client services

- [ ] 修改 `ui/src/services/client/index.ts`
- [ ] 保留 `article`
- [ ] 保留 `video`
- [ ] 保留 `project`
- [ ] 保留必要的 `legal`
- [ ] 按需保留 `search`
- [ ] 按需保留 `tag`
- [ ] 停止导出 `question`
- [ ] 停止导出 `personal`
- [ ] 停止导出 `notification`
- [ ] 停止导出 `review`
- [ ] 停止导出 `badges`
- [ ] 停止导出 `Oauth`
- [ ] 停止导出 `timeline`

### admin services

- [ ] 修改 `ui/src/services/admin/index.ts`
- [ ] 保留 Dashboard、Settings、Plugins
- [ ] 评估 `question`、`answer`、`users`、`badges` 是否还被后台页面依赖
- [ ] 如不需要，停止导出相关模块

验收：

- [ ] 前端打包不再因社区 service 残余引用而失败
- [ ] 页面请求只集中在内容站能力上

## Phase 5：后端公开路由白名单化

目标：后端只对外暴露内容站需要的接口。

### 公共 API

- [ ] 修改 `internal/router/answer_api_router.go`
- [ ] 保留站点基础信息接口
- [ ] 保留文章列表/详情接口
- [ ] 保留视频列表/详情接口
- [ ] 保留项目列表/详情接口
- [ ] 保留标签聚合接口，如文章确实需要
- [ ] 按需保留搜索接口

### 下线公共 API

- [ ] 下线用户注册接口
- [ ] 下线用户找回密码接口
- [ ] 下线个人中心相关接口
- [ ] 下线问答详情/分页/推荐相关接口
- [ ] 下线评论、收藏、关注、评审、徽章、通知公开接口

### 鉴权 API

- [ ] 保留管理员后台所需登录接口
- [ ] 清理普通用户前台接口暴露
- [ ] 检查 `PluginAPIRouter` 是否还有必须保留的登录相关能力

验收：

- [ ] 前台访问时不会再调用旧社区 API
- [ ] 后台管理不受影响

## Phase 6：点赞与评分匿名化

目标：点赞、评分不再依赖普通用户身份。

### 方案设计

- [ ] 定义点赞与评分的最终交互规则
- [ ] 定义去重方案：`IP + UA + Cookie` 或匿名 token
- [ ] 定义前端接口：获取聚合值、提交互动
- [ ] 定义后端数据结构与存储策略

### 实现

- [ ] 替换前端对旧 vote/reaction 接口的依赖
- [ ] 新增匿名互动 API
- [ ] 前台文章详情接入新互动逻辑
- [ ] 如视频/项目也需要互动，统一抽象互动模块

验收：

- [ ] 未登录访客可点赞/评分
- [ ] 计数可用
- [ ] 有基本防刷和重复提交限制

## Phase 7：后端依赖收缩

目标：把已经不再使用的社区能力从装配层逐步移除。

### 依赖注入

- [ ] 检查 `internal/controller/controller.go`
- [ ] 检查 `internal/service/provider.go`
- [ ] 检查 `internal/repo/provider.go`
- [ ] 移除已不再被路由或页面使用的 provider

### 生成文件

- [ ] 如修改了 Wire 依赖，重新生成 `cmd/wire_gen.go`
- [ ] 如修改了 Swagger，按需更新 `docs/docs.go`
- [ ] 按需更新 `docs/swagger.json`
- [ ] 按需更新 `docs/swagger.yaml`

验收：

- [ ] 应用可正常编译
- [ ] 未出现 provider 缺失或循环依赖

## Phase 8：物理删除与瘦身

目标：在业务跑稳后再真正删旧代码。

- [ ] 删除已完全下线的前台页面目录
- [ ] 删除已完全下线的 client/admin service 文件
- [ ] 删除不再使用的 controller/service/repo
- [ ] 删除不再需要的 i18n 文案
- [ ] 删除不再需要的菜单常量和组件引用

前提：

- [ ] 前三阶段已稳定运行
- [ ] 已确认没有隐藏依赖

## 建议先做的最小闭环

如果要尽快落地，优先完成这 8 项：

- [ ] 跑通 `ui-next`
- [ ] 对接文章接口
- [ ] 对接视频接口
- [ ] 对接项目接口
- [ ] 路由白名单化
- [ ] Header 去登录注册与社区入口
- [ ] 后台菜单白名单化
- [ ] 前台只剩文章、视频、项目页面可达

## Definition of Done

- [ ] 前台对外呈现为内容门户，而不是问答社区
- [ ] 管理员可正常登录并维护三类内容
- [ ] 前台不再暴露普通用户体系
- [ ] 点赞/评分方案已明确，至少有一期实现路径
- [ ] 代码改动有明确分层，没有直接在多个层面做临时绕过
