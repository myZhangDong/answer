# Apache Answer 项目结构说明

## 📋 项目概述

Apache Answer 是一个使用 Go + React 构建的问答平台，采用一体化部署架构。前端使用 React + TypeScript，后端使用 Go + Gin 框架，通过 Go embed 将前端静态文件嵌入到二进制文件中。

## 🏗️ 项目整体架构

```
answer/
├── 🏠 根目录配置文件
├── 🔧 后端相关 (Go)
├── 🎨 前端相关 (React)
├── 📚 文档和配置
└── 🚀 部署和构建
```

## 📁 详细目录结构

### 🔧 后端核心 (Go)

#### `/cmd/` - 应用程序入口

```
cmd/
├── answer/          # 主程序入口
│   └── main.go     # 应用启动文件
└── wire_gen.go     # 依赖注入生成文件
```

**作用**：应用程序的主入口点，包含 main 函数和依赖注入配置。

#### `/internal/` - 核心业务逻辑

```
internal/
├── base/            # 基础组件
│   ├── conf/       # 配置管理
│   ├── constant/   # 常量定义
│   ├── data/       # 数据层接口
│   ├── handler/    # HTTP处理器基础
│   ├── middleware/ # 中间件
│   ├── pager/      # 分页组件
│   ├── reason/     # 错误原因码
│   ├── server/     # 服务器配置
│   ├── translator/ # 国际化
│   └── validator/  # 验证器
├── cli/             # 命令行接口
├── controller/      # 控制器层
├── controller_admin/ # 管理员控制器
├── entity/          # 数据实体
├── install/         # 安装程序
├── migrations/      # 数据库迁移
├── repo/           # 数据访问层
├── router/         # 路由配置
├── schema/         # 数据传输对象
└── service/        # 业务逻辑层
```

**各层作用：**

- **Controller**: 处理 HTTP 请求，参数验证，调用 Service
- **Service**: 业务逻辑层，处理复杂业务规则
- **Repo**: 数据访问层，与数据库交互
- **Entity**: 数据库实体模型
- **Schema**: API 请求/响应数据结构

#### `/pkg/` - 公共包

```
pkg/
├── checker/        # 检查工具
├── converter/      # 数据转换
├── dir/           # 目录操作
├── gravatar/      # 头像服务
├── htmltext/      # HTML文本处理
├── json/          # JSON工具
├── obj/           # 对象工具
├── uid/           # 唯一ID生成
└── ...
```

**作用**：可复用的工具包和公共功能。

### 🎨 前端核心 (React)

#### `/ui/src/` - 前端源码

```
ui/src/
├── pages/           # 页面组件
│   ├── Questions/   # 问题相关页面
│   ├── Users/       # 用户相关页面
│   ├── Tags/        # 标签页面
│   ├── Admin/       # 管理员页面
│   ├── UserCenter/  # 用户中心
│   ├── Install/     # 安装页面
│   ├── Layout/      # 布局组件
│   ├── 404/         # 404页面
│   └── ...
├── components/      # 复用组件
│   ├── Header/      # 头部组件
│   ├── Footer/      # 底部组件
│   ├── Comment/     # 评论组件
│   ├── Editor/      # 编辑器组件
│   └── ...
├── router/          # 前端路由
│   ├── routes.ts    # 路由配置
│   ├── index.tsx    # 路由入口
│   └── alias.ts     # 路由别名
├── services/        # API服务
├── stores/          # 状态管理
├── hooks/           # 自定义Hooks
├── utils/           # 工具函数
├── common/          # 公共配置
├── i18n/           # 国际化
├── assets/         # 静态资源
└── plugins/        # 插件系统
```

#### `/ui/` - 前端构建配置

```
ui/
├── src/             # 源码目录
├── build/           # 构建输出
├── public/          # 公共资源
├── static.go        # Go嵌入文件
├── package.json     # 依赖配置
├── tsconfig.json    # TypeScript配置
└── config-overrides.js # 构建配置覆盖
```

### 📚 配置和文档

#### `/configs/` - 配置文件

```
configs/
└── config.yaml      # 默认配置模板
```

#### `/docs/` - 文档目录

```
docs/
├── docs.go          # Swagger文档生成
├── swagger.json     # API文档
└── swagger.yaml     # API文档YAML格式
```

#### `/i18n/` - 国际化文件

```
i18n/
├── en_US.yaml       # 英文
├── zh_CN.yaml       # 中文简体
├── zh_TW.yaml       # 中文繁体
└── ...              # 其他语言
```

### 🔌 插件系统

#### `/plugin/` - 插件框架

```
plugin/
├── plugin_base/     # 插件基础
├── plugin_*         # 各种插件类型
└── ...
```

### 🚀 部署和构建

#### 构建相关文件

```
├── Makefile         # 构建脚本
├── Dockerfile       # Docker镜像构建
├── docker-compose.yaml # Docker编排
├── .goreleaser.yaml # 发布配置
└── .github/         # GitHub Actions CI/CD
```

#### 脚本目录

```
script/
├── build_plugin.sh  # 插件构建脚本
├── check-asf-header.sh # 许可证检查
├── entrypoint.sh    # Docker入口脚本
└── gen-api.sh       # API文档生成
```

## 🎯 如何添加新页面

### 1. 前端页面添加步骤

#### 步骤 1: 创建页面组件

在 `ui/src/pages/` 目录下创建新的页面文件夹：

```bash
# 例如：添加一个 "帮助中心" 页面
mkdir ui/src/pages/Help
```

创建页面组件：

```typescript
// ui/src/pages/Help/index.tsx
import React from "react";
import { Container } from "react-bootstrap";

const Help = () => {
  return (
    <Container className="py-5">
      <h1>帮助中心</h1>
      <p>这里是帮助内容...</p>
    </Container>
  );
};

export default Help;
```

#### 步骤 2: 配置路由

在 `ui/src/router/routes.ts` 中添加路由配置：

```typescript
// 在适当的 children 数组中添加路由节点
{
  path: 'help',
  page: 'pages/Help',
  // 可选：添加路由守卫
  guard: () => {
    return { ok: true }; // 或其他守卫逻辑
  },
}
```

**路由配置说明：**

- `path`: 路由路径
- `page`: 页面组件路径（相对于 `ui/src/`）
- `guard`: 可选的路由守卫函数
- `loader`: 可选的数据加载器

#### 步骤 3: 添加导航链接（可选）

在相应的导航组件中添加链接：

```typescript
// ui/src/components/Header/index.tsx 或其他导航组件
<Nav.Link href="/help">帮助中心</Nav.Link>
```

### 2. 后端 API 添加步骤

#### 步骤 1: 创建数据实体

```go
// internal/entity/help.go
type Help struct {
    ID      string `xorm:"not null pk autoincr BIGINT(20) id"`
    Title   string `xorm:"not null default '' VARCHAR(255) title"`
    Content string `xorm:"not null TEXT content"`
    // ... 其他字段
}
```

#### 步骤 2: 创建数据传输对象

```go
// internal/schema/help_schema.go
type HelpReq struct {
    Title   string `json:"title" validate:"required"`
    Content string `json:"content" validate:"required"`
}

type HelpResp struct {
    ID      string `json:"id"`
    Title   string `json:"title"`
    Content string `json:"content"`
}
```

#### 步骤 3: 创建数据访问层

```go
// internal/repo/help/help_repo.go
type HelpRepo interface {
    CreateHelp(ctx context.Context, help *entity.Help) error
    GetHelp(ctx context.Context, id string) (*entity.Help, error)
    // ... 其他方法
}

// 实现接口
type helpRepo struct {
    data *data.Data
}

func NewHelpRepo(data *data.Data) HelpRepo {
    return &helpRepo{data: data}
}
```

#### 步骤 4: 创建业务逻辑层

```go
// internal/service/help/help_service.go
type HelpService interface {
    CreateHelp(ctx context.Context, req *schema.HelpReq) (*schema.HelpResp, error)
    GetHelp(ctx context.Context, id string) (*schema.HelpResp, error)
}

// 实现接口
type helpService struct {
    helpRepo HelpRepo
}
```

#### 步骤 5: 创建控制器

```go
// internal/controller/help_controller.go
type HelpController struct {
    helpService HelpService
}

func NewHelpController(helpService HelpService) *HelpController {
    return &HelpController{helpService: helpService}
}

func (hc *HelpController) CreateHelp(ctx *gin.Context) {
    req := &schema.HelpReq{}
    if handler.BindAndCheck(ctx, req) {
        return
    }

    resp, err := hc.helpService.CreateHelp(ctx, req)
    handler.HandleResponse(ctx, err, resp)
}
```

#### 步骤 6: 注册路由

```go
// internal/router/answer_router.go
func (a *AnswerAPIRouter) RegisterAnswerAPIRouter(r *gin.RouterGroup) {
    // ... 现有路由

    // 添加帮助路由
    helpRouter := r.Group("/help")
    helpRouter.POST("", a.helpController.CreateHelp)
    helpRouter.GET("/:id", a.helpController.GetHelp)
}
```

### 3. 前后端集成

#### 创建 API 服务

```typescript
// ui/src/services/help.ts
import { request } from "@/utils";

export interface Help {
  id: string;
  title: string;
  content: string;
}

export const createHelp = (data: Omit<Help, "id">) => {
  return request.post("/help", data);
};

export const getHelp = (id: string) => {
  return request.get(`/help/${id}`);
};
```

#### 在页面中使用

```typescript
// ui/src/pages/Help/index.tsx
import { useEffect, useState } from "react";
import { getHelp } from "@/services/help";

const Help = () => {
  const [helpData, setHelpData] = useState(null);

  useEffect(() => {
    getHelp("1").then(setHelpData);
  }, []);

  return (
    <Container>
      {helpData && (
        <>
          <h1>{helpData.title}</h1>
          <div>{helpData.content}</div>
        </>
      )}
    </Container>
  );
};
```

### 4. 路由守卫说明

项目中的路由守卫类型包括：

- `guard.logged()`: 需要登录
- `guard.activated()`: 需要激活账户
- `guard.isAdminOrModerator()`: 需要管理员或版主权限
- `guard.shouldLoginRequired()`: 检查是否需要登录
- `guard.setupApp()`: 应用初始化检查
- `guard.googleSnapshotRedirect()`: Google 快照重定向处理

**守卫函数返回值：**

```typescript
type TGuardResult = {
  ok: boolean; // 是否通过守卫
  redirect?: string; // 重定向地址（可选）
};
```

## 🛠️ 开发工作流

### 1. 开发环境设置

```bash
# 后端开发
go mod tidy
make check    # 检查工具
make generate # 生成代码

# 前端开发
cd ui
pnpm install
pnpm start    # 开发服务器
```

### 2. 构建流程

```bash
make ui       # 构建前端
make build    # 构建后端（包含前端）
```

### 3. 测试运行

```bash
./answer init -C ./data/  # 初始化
./answer run -C ./data/   # 运行服务
```

## 📝 开发规范

### 1. 代码组织

- 后端遵循清洁架构分层
- 前端使用页面/组件分离
- 公共代码放在对应的公共目录

### 2. 命名规范

- Go: 驼峰命名 + 包名小写
- TypeScript: 驼峰命名 + PascalCase 组件
- 文件名: 小写 + 下划线/短横线

### 3. 提交规范

- 遵循 Apache License 2.0
- 代码提交前运行 `make lint`
- API 变更需要更新文档

## 🎉 总结

Apache Answer 采用现代化的前后端一体化架构，通过清晰的分层设计和模块化组织，使得项目易于理解和扩展。添加新功能时，只需要按照既定的模式在相应的层次添加代码即可。

这种架构既保持了代码的清晰性，又简化了部署复杂度，是中小型项目的理想选择。
