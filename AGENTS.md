# AI 协作说明

## 1. 目标

这份文档给后续参与本仓库开发的 AI 使用。目标不是介绍产品，而是减少误判，帮助 AI 在现有代码结构里快速落地需求。

## 1.1 轻量 OpenSpec 入口

当前仓库已经采用轻量 OpenSpec 方式管理持续改造任务。处理内容门户化改造时，优先读取：

1. `specs/README.md`
2. `specs/content-portal-simplification-spec.md`
3. `specs/content-portal-simplification-tasks.md`
4. `specs/content-portal-simplification-baseline.md`
5. `specs/content-portal-simplification-decisions.md`
6. `AGENTS.md`

要求：

- 不要把整段聊天历史当作唯一事实来源
- 继续某个 Phase 前，先以 `tasks.md` 和 `decisions.md` 为准恢复上下文
- 继续 Phase 2 及以后阶段前，先以 `baseline.md` 确认白名单和边界
- 如果本轮形成新决策，先更新 `decisions.md`
- 如果本轮完成任务，更新 `tasks.md`
- Phase 边界建议提交一次代码

## 2. 开始前必须做的事

1. 先执行 `git status --short`
2. 明确当前需求只影响后端、前端，还是两边都要改
3. 优先读已有实现，不要凭 Apache Answer 的通用印象直接下结论
4. 不要擅自回滚已有未提交修改

原因：

- 当前仓库已经存在较多本地修改和未跟踪文件
- 这个仓库不是 Apache Answer 官方主线的纯净状态，而是带本地扩展的工作区

## 3. 仓库的核心事实

- 后端主语言是 Go，入口在 `cmd/answer/main.go`
- 实际启动逻辑在 `cmd/main.go`
- 后端采用 `router -> controller -> service -> repo -> entity`
- 依赖注入使用 Google Wire，入口在 `cmd/wire.go`
- 前端位于 `ui/`，React 18 + TypeScript
- 新前端位于 `ui-next/`，Vite + React
- 前端路由主配置在 `ui/src/router/routes.ts`
- 前端接口封装主目录在 `ui/src/services/`
- 前端构建产物会被 `ui/static.go` 嵌入二进制
- 后端 UI 托管逻辑在 `internal/router/ui.go`
- 插件系统是一级能力，不是边缘代码

关于前端目标的额外说明：

- 内容门户化改造当前以 `ui-next/` 为目标前端
- `ui/` 仍然保留，主要用于旧实现参考、兼容分析和后续裁剪
- 如果需求明确指向“新前端”或内容门户，优先阅读 `ui-next/`
- 如果需求明确指向旧后台菜单、旧前台路由或遗留功能裁剪，再阅读 `ui/`

## 4. 常见改动应该落到哪里

### 新增后端业务领域

通常至少检查这些位置：

- `internal/entity/<domain>_entity.go`
- `internal/schema/<domain>_schema.go`
- `internal/repo/<domain>/`
- `internal/service/<domain>/` 或相关 common/content 目录
- `internal/controller/<domain>_controller.go`
- `internal/router/answer_api_router.go`
- `internal/controller/controller.go`
- `internal/service/provider.go`
- `internal/repo/provider.go`
- `internal/migrations/`

如果是后台管理接口，还要看：

- `internal/controller_admin/`

### 新增前端页面或功能

通常至少检查这些位置：

- `ui/src/services/client/<domain>.ts`
- `ui/src/pages/<Domain>/`
- `ui/src/router/routes.ts`
- `ui/src/components/`
- `ui/src/i18n/`

如果页面需要出现在导航里，再看：

- `ui/src/components/Header/`
- `ui/src/components/SideNav/`

### 新增插件相关能力

同时检查：

- `plugin/`
- `internal/router/plugin_api_router.go`
- `ui/src/utils/pluginKit/`
- `ui/src/plugins/`

## 5. 做需求时的推荐工作流

1. 先定位现有最接近的模块，优先复用相同模式
2. 确认接口是否已经存在，不要重复造 API
3. 如果新增 API，同时补前端 service、后端 router、controller、service、repo
4. 如果改了 Wire 依赖集合，记得重新生成 `cmd/wire_gen.go`
5. 如果改了 Swagger 注释或 API 结构，留意 `docs/swagger.*`
6. 如果改了前端最终页面资源，留意 `ui/build/` 是否需要重新构建

## 6. 高概率会踩坑的点

### 1. 工作区不是干净的

看到改动不要默认是脏代码，也可能是用户正在做的功能。任何回滚动作都应避免。

### 2. 有些文件是生成物

以下文件经常不是手工源文件：

- `cmd/wire_gen.go`
- `docs/docs.go`
- `docs/swagger.json`
- `docs/swagger.yaml`
- `ui/build/`

优先改源码，再决定是否需要重新生成。

### 3. 前端配置不是完全手写

`ui/scripts/env.js` 会从 `configs/config.yaml` 生成前端生产环境变量。涉及 `base_url`、`api_url`、构建地址时，要同时看这两处。

### 4. 静态资源可能来自 embed，也可能来自外部目录

`internal/router/ui.go` 会优先读取 `ANSWER_STATIC_PATH`。所以“页面不对”不一定是 embed 资源的问题，也可能是运行时静态目录覆盖。

### 5. 插件会影响功能边界

登录、用户中心、验证码、渲染、CDN、搜索、通知等能力都可能被插件接管。看到接口或行为异常时，要检查是否有插件参与。

## 7. 推荐阅读顺序

处理任意需求前，优先看：

1. `README.md`
2. `Makefile`
3. `specs/README.md`
4. 活跃任务对应的 `spec/tasks/decisions`
5. `cmd/command.go`
6. `cmd/wire.go`
7. `internal/router/answer_api_router.go`
8. 与需求最接近的 `controller/service/repo/schema/entity`
9. `ui-next/src/app/routes.tsx` 或 `ui/src/router/routes.ts`
10. 与需求最接近的前端 service 和页面目录

## 8. 命令参考

根目录常用：

```bash
make generate
make ui
make build
make test
```

前端常用：

```bash
cd ui
pnpm install
pnpm start
pnpm build
pnpm lint
```

## 9. AI 输出和改码原则

- 先读代码，再给方案
- 先读 spec/tasks/decisions，再读代码并落地
- 默认沿用现有目录与命名方式
- 不要引入与当前项目风格冲突的新分层
- 不要把简单需求做成大重构
- 不要主动清理用户未要求处理的文件
- 修改前后说明影响面，尤其是 router、provider、migration、前端 routes
- 如果只是继续既有 Phase，优先延续已有分支和规格，不重新设计整套方案

## 10. 本仓库当前最像“活跃开发区”的地方

如果需求和这些领域相关，优先阅读现有增量代码：

- `project`
- `article`
- `video`
- `content_review`
- `question`
- `search`
- `plugin`

## 11. 交付前自检清单

1. 是否误改了生成文件而没改源码
2. 是否遗漏 `provider`、`router`、`schema`、`migration`
3. 是否遗漏前端 service、route、页面入口
4. 是否考虑到插件与配置覆盖
5. 是否确认没有覆盖用户已有改动

## 12. 语言使用

1. 代码关键逻辑注释，git message，spec, task 全部使用中文
