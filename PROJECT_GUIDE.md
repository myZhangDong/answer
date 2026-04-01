# 项目导读

## 1. 项目是什么

这个仓库是一个前后端一体化的问答平台，主体来自 Apache Answer，当前代码上已经扩展了 `video`、`project`、`article`、`content_review` 等业务。

- 后端：Go 1.22，Gin，XORM，Cobra，Wire，Swagger
- 前端：React 18，TypeScript，React Router，Bootstrap 5，SWR，Zustand
- 交付形态：前端构建产物会被嵌入 Go 二进制，由后端统一提供静态资源和 API

## 2. 总体架构

### 请求链路

1. 浏览器访问前端页面，前端路由定义在 `ui/src/router/`
2. 前端通过 `ui/src/services/` 调用后端 API
3. 后端路由定义在 `internal/router/`
4. Controller 负责参数和响应，位于 `internal/controller/` 与 `internal/controller_admin/`
5. Service 负责业务逻辑，位于 `internal/service/`
6. Repo 负责数据库读写，位于 `internal/repo/`
7. Entity 定义数据库实体，Schema 定义接口入参与出参

### 构建链路

1. `make ui` 在 `ui/` 下构建旧前端静态资源
2. `ui/static.go` 通过 `go:embed` 嵌入 `ui/build`
3. `make ui-next` 在 `ui-next/` 下构建新前端静态资源到 `ui-next/dist`
4. `make build` 或 `go build -o ./answer ./cmd/answer` 编译后端二进制 `answer`
5. `internal/router/ui.go` 负责把前端页面和静态资源挂到 Gin

补充说明：

- 默认 embed 链路仍然是旧前端 `ui/build`
- `ui-next` 当前通过运行时静态目录方式托管，不会自动嵌入 `answer` 二进制

## 3. 目录结构

### 根目录

- `cmd/`：程序入口、CLI 命令、Wire 注入入口
- `internal/`：后端核心业务代码
- `pkg/`：通用工具包
- `plugin/`：插件接口与插件注册机制
- `ui/`：前端工程
- `configs/`：默认配置模板与嵌入配置资源
- `data/`：本地运行时数据目录示例
- `docs/`：Swagger 产物、发布许可证等
- `script/`：构建与辅助脚本
- `charts/`：Helm Chart

### `cmd/`

- `cmd/answer/main.go`：主程序入口
- `cmd/main.go`：启动应用、读取配置、装配 pacman application
- `cmd/command.go`：CLI 命令定义，包含 `run/init/check/upgrade/dump/build/plugin/config/i18n/run-ui/run-ui-next`
- `cmd/wire.go`：Wire 注入声明
- `cmd/wire_gen.go`：Wire 生成文件
- `cmd/insert_video_data/`：附加数据导入命令

### `internal/`

- `internal/router/`：API、静态资源、插件、Swagger、模板等路由注册
- `internal/controller/`：普通业务控制器
- `internal/controller_admin/`：后台管理控制器
- `internal/service/`：业务服务层，按领域拆目录
- `internal/repo/`：数据访问层，通常一个领域一个子目录
- `internal/entity/`：数据库实体
- `internal/schema/`：API 请求和响应结构
- `internal/migrations/`：数据库迁移脚本
- `internal/install/`：安装流程
- `internal/cli/`：初始化、导出、构建等 CLI 辅助逻辑
- `internal/base/`：配置、数据源、中间件、分页、通用 handler、server 等基础设施

### `pkg/`

`pkg/` 里是通用能力，例如：

- `pkg/checker/`：输入校验
- `pkg/converter/`：结构与文本转换
- `pkg/htmltext/`：HTML/文本处理
- `pkg/token/`：令牌处理
- `pkg/uid/`：ID 生成
- `pkg/writer/`：文件写入辅助

### `plugin/`

插件系统是这个项目的重要扩展点。`plugin/plugin.go` 会按能力类型注册插件，当前支持的能力包括：

- `Connector`
- `UserCenter`
- `Captcha`
- `Cache`
- `Search`
- `Notification`
- `Render`
- `CDN`
- `Importer`
- `KVStorage`

后端插件 API 路由在 `internal/router/plugin_api_router.go`，前端插件接入在 `ui/src/utils/pluginKit/`。

### `ui/`

- `ui/src/pages/`：页面级组件
- `ui/src/components/`：复用组件
- `ui/src/router/`：前端路由与守卫
- `ui/src/services/`：接口封装
- `ui/src/stores/`：状态管理
- `ui/src/hooks/`：自定义 hooks
- `ui/src/utils/`：请求封装、插件工具、通用方法
- `ui/src/plugins/`：前端插件入口
- `ui/public/`：静态公共资源
- `ui/scripts/`：构建辅助脚本
- `ui/build/`：前端构建输出，会被嵌入后端

## 4. 关键模块说明

### 后端分层习惯

一个标准业务功能通常会横跨这些目录：

1. `internal/entity/<domain>_entity.go`
2. `internal/schema/<domain>_schema.go`
3. `internal/repo/<domain>/`
4. `internal/service/<domain>/` 或 `internal/service/content/`
5. `internal/controller/<domain>_controller.go`
6. `internal/router/answer_api_router.go`
7. `internal/controller/controller.go`
8. `internal/service/provider.go`
9. `internal/repo/provider.go`
10. `internal/migrations/`

当前仓库里 `project`、`video`、`question`、`article` 基本都遵循这个套路。

### 前端分层习惯

一个标准页面功能通常会涉及：

1. `ui/src/services/client/<domain>.ts`
2. `ui/src/pages/<Domain>/`
3. `ui/src/router/routes.ts`
4. 需要入口时再改 `Header`、`SideNav` 等导航组件
5. 文案需要同步补到 i18n 资源

### API 与前端的对应关系

- 前端 API 封装主要在 `ui/src/services/client/`
- 后端公共 API 路由主要在 `internal/router/answer_api_router.go`
- 管理后台 API 会额外落在 `internal/controller_admin/`
- 插件相关接口在 `internal/router/plugin_api_router.go`

## 5. 配置与运行时数据

### 默认配置来源

- 默认模板：`configs/config.yaml`
- 配置读取：`internal/base/conf/conf.go`
- 初始化写入：`internal/cli/install.go`

默认配置里包含：

- HTTP 监听地址
- 数据库连接
- 缓存文件路径
- i18n 路径
- 上传目录
- UI 基础地址

### 数据目录规则

CLI 默认使用 `-C /data/` 作为数据根目录，安装流程会在这个目录下准备：

- `/conf/config.yaml`
- `/uploads/`
- `/i18n/`
- `/cache/`

仓库中的 `data/` 更像本地开发或示例数据目录，不等于线上唯一规范来源。

### 环境变量

代码里明确使用到的环境变量包括：

- `LOG_LEVEL`
- `LOG_PATH`
- `ANSWER_FRONTEND`
- `ANSWER_STATIC_PATH`
- `SWAGGER_HOST`
- `SWAGGER_ADDRESS_PORT`
- `SITE_ADDR`
- `SKIP_REPLACE_I18N`

前端构建环境变量主要由 `ui/scripts/env.js` 根据 `configs/config.yaml` 生成。

补充：

- `run-ui` 会清空 `ANSWER_STATIC_PATH`，强制使用 embed 的旧前端 `ui/build`
- `run-ui-next` 会把 `ANSWER_STATIC_PATH` 指向 `ui-next/dist`，并设置 `ANSWER_FRONTEND=ui-next`
- 如果运行结果和预期前端不一致，优先检查 `ANSWER_STATIC_PATH`、`ANSWER_FRONTEND` 和实际启动命令

## 6. 构建、运行与测试

### 根目录常用命令

```bash
make generate
make ui
make ui-next
make build
make test
```

说明：

- `make generate` 会安装并执行 `swag`、`wire`、`mockgen`
- `make ui` 会在 `ui/` 下构建旧前端
- `make ui-next` 会在 `ui-next/` 下构建新前端
- `make build` 会生成 `answer` 二进制
- `make test` 当前只跑 `./internal/repo/repo_test`

### 运行命令

```bash
# 使用旧前端 ui/
./answer run-ui -C ./data

# 使用新前端 ui-next/
./answer run-ui-next -C ./data
```

重要说明：

- `./answer run` 或 `./answer run-ui*` 只是启动当前二进制，不会自动重新编译源码
- 修改 Go 代码后，必须重新执行 `go build -o ./answer ./cmd/answer` 或 `make build`
- 修改旧前端 `ui/` 后，必须先 `make ui`，再重新构建 `./answer`
- 修改 `ui-next/` 后，必须先 `make ui-next`；`run-ui-next` 直接读取 `ui-next/dist`

### 前端常用命令

```bash
cd ui
pnpm install
pnpm start
pnpm build
pnpm lint
pnpm prettier
```

## 7. 当前代码库的几个现实情况

这点对后续开发很重要：

- 当前工作区不是干净状态，已经存在大量未提交修改和未跟踪文件
- 当前代码明显处于功能扩展阶段，尤其是 `project`、`article`、`video`、`content_review` 相关目录
- `ui/build/`、`docs/swagger.*`、`cmd/wire_gen.go` 都可能是构建或生成产物，改动前要先判断是源码变更还是生成结果
- 已有 `PROJECT_STRUCTURE.md`、`dev.md`、`ui/DEVELOPMENT.md` 等文档，但内容和当前实际代码不一定完全同步

## 8. 阅读代码的建议顺序

如果是第一次接手这个仓库，建议按这个顺序理解：

1. `README.md`
2. `Makefile`
3. `cmd/main.go`
4. `cmd/command.go`
5. `cmd/wire.go`
6. `internal/router/`
7. `internal/controller/` 与 `internal/controller_admin/`
8. `internal/service/`
9. `internal/repo/`
10. `ui/src/router/`
11. `ui/src/services/`
12. `ui/src/pages/`
13. `plugin/`

## 9. 适合后续继续补充的内容

如果后面要继续维护这份文档，最值得追加的是：

- 主要业务表结构与实体对应关系
- 各核心 API 分组说明
- 前端页面与路由映射清单
- 数据迁移版本说明
- 插件加载机制的完整时序
