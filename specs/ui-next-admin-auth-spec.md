# `ui-next` 管理员登录与现有鉴权复用 Spec

## 1. 背景

当前内容门户主线前端已经切到 `ui-next/`，但后台认证与管理链路仍停留在旧 `ui/`：

- `ui-next/src/app/pages/Admin.tsx` 仍使用页面内硬编码演示密码控制进入后台
- `ui-next/src/app/api/adminApi.ts` 仍是整套 stub，并假设未来使用 Bearer Token
- 旧 `ui/` 已经接通真实登录、会话恢复、管理员路由守卫与退出登录
- 后端现有管理员登录链路已经在生产可用，不需要本轮重写认证系统

内容门户主规格已经确认：

- `ui-next/` 是目标前端
- 当前生产可用后台仍以旧 `ui/` 为准
- 如果要把后台迁移到 `ui-next/`，应单独立项，不再混在内容门户主规格中推进

因此需要拆出一份独立规格，专门约束 `ui-next` 如何接通管理员登录，并复用现有后端鉴权体系。

## 2. 目标

### 2.1 产品目标

让 `ui-next` 支持真实管理员登录，并能以现有后台身份进入 `ui-next` 的 `/admin` 页面。

用户体验目标：

- 未登录访问 `/admin` 时，进入 `ui-next` 的管理员登录页
- 登录成功后进入 `ui-next` 管理后台
- 刷新页面后可通过已有会话恢复登录态
- 非管理员用户不能进入 `ui-next` 管理后台
- 管理员可从 `ui-next` 主动退出登录

### 2.2 工程目标

继续复用现有后端登录接口、会话机制和管理员判定方式，不新增一套认证模型。

明确要求：

- 复用现有 `/answer/api/v1/user/login/email`
- 复用现有 `/answer/api/v1/user/info`
- 复用现有 `/answer/api/v1/user/logout`
- 按需复用现有 `/answer/api/v1/permission`
- 延续旧 `ui/` 的管理员判定语义：`role_id === 2`
- 延续现有 Cookie / Session 登录态，不切换为前端自管 Bearer Token 方案

## 3. 非目标

本规格不做以下事情：

- 不重写后端认证系统
- 不新增新的管理员账号模型
- 不支持普通前台用户登录 `ui-next`
- 不在本轮迁移全部旧后台页面到 `ui-next`
- 不在本轮清理旧 `ui/` 后台代码
- 不在本轮改造插件登录体系、User Center 或第三方 Connector
- 不在本轮重做权限模型，只沿用现有管理员角色判断

## 4. 现状确认

### 4.1 `ui-next` 当前状态

当前 `ui-next` 已有 `/admin` 路由和后台页面，但认证仍是演示实现：

- `ui-next/src/app/routes.tsx` 直接暴露 `/admin`
- `ui-next/src/app/pages/Admin.tsx` 用本地 `authed` 状态和硬编码密码控制访问
- `ui-next/src/app/api/client.ts` 已默认使用 `credentials: "include"`，具备复用现有 Session/Cookie 的基础
- `ui-next/src/app/api/adminApi.ts` 仍是 stub，且 `getAuthHeaders()` 仍按 Bearer Token 思路占位

### 4.2 旧 `ui/` 当前真实链路

旧后台已经跑通管理员登录与守卫，当前仓库内可确认：

- 登录接口：`POST /answer/api/v1/user/login/email`
- 当前用户接口：`GET /answer/api/v1/user/info`
- 退出接口：`GET /answer/api/v1/user/logout`
- 权限接口：`GET /answer/api/v1/permission`
- 旧前端登录入参为 `e_mail`、`pass`，并按需附带 `captcha_id`、`captcha_code`
- 旧前端在 `ui/src/utils/guard.ts` 中通过 `role_id === 2` 判定管理员
- 旧前端在进入 `/admin` 前会先拉取 `user/info`，再执行 `guard.admin()`

### 4.3 当前边界

本轮只解决“`ui-next` 管理员登录与会话接入”问题，不假定后台管理接口已经全部切换完成。

也就是说：

- 登录态与路由守卫要先跑通
- 已登录管理员能进入 `ui-next` 后台壳子
- 后台表单与管理接口是否全部可用，可作为后续实现阶段继续推进

## 5. 复用现有鉴权的基线方案

### 5.1 认证方式

`ui-next` 必须复用现有后端会话，不新发独立 Token。

实现约束：

- 登录请求直接调用 `/answer/api/v1/user/login/email`
- 请求层保持 `credentials: "include"`
- 会话恢复通过 `/answer/api/v1/user/info`
- 退出通过 `/answer/api/v1/user/logout`
- 前端不额外引入 `localStorage` token 作为主认证来源

这意味着 `ui-next/src/app/api/adminApi.ts` 中的 Bearer Token 假设需要移除，统一改为复用现有请求层与 Cookie Session。

### 5.2 管理员判定

路由准入先与旧 `ui/` 保持一致：

- 已登录
- 邮箱状态满足现有系统可用条件
- `role_id === 2`

在进入后台主路由前，先拉取当前用户信息；若非管理员，则返回 `403` 或跳回登录页，而不是继续沿用当前本地假密码门。

### 5.3 权限接口的使用边界

`/answer/api/v1/permission` 本轮不是管理员登录成功的必要前置条件。

推荐用法：

- 路由层准入先只依赖 `/user/info + role_id`
- 页面内按钮级、动作级权限再按需接 `/permission`
- 不把细粒度 permission 校验提前成“能否进入后台”的唯一判断

原因：

- 当前旧后台路由守卫本质上先用管理员角色拦截
- `permission` 更适合补充具体操作能力，而不是替代登录态恢复

## 6. 范围

### 6.1 本规格内必须覆盖

- `ui-next` 的管理员登录页
- `ui-next` 的管理员会话状态管理
- `ui-next` 的后台路由守卫
- `ui-next` 的登录态恢复逻辑
- `ui-next` 的退出登录逻辑
- `ui-next` 中后台请求统一复用现有会话
- `ui-next` 中 `adminApi` 对认证方式的修正

### 6.2 本规格内建议同步覆盖

- 将 `/admin` 拆为受保护路由，将 `/admin/login` 作为显式登录入口
- 在后台顶部或全局上下文显示当前管理员信息
- 将登录失败、会话过期、403 状态统一成可复用错误表现

### 6.3 本规格外暂不覆盖

- 旧后台菜单整体迁移
- 所有后台 CRUD 接口的全面对接
- 插件接管型登录 UI 的完整移植
- 普通用户体系页面的保留或重做

## 7. 兼容与风险

### 7.1 Captcha 与插件风险

旧登录页支持按需附带 `captcha_id`、`captcha_code`，且登录、Connector、User Center 可能被插件影响。

因此需要明确：

- 如果当前环境启用了登录验证码，`ui-next` 不能假设只传邮箱和密码就一定成功
- 如果当前站点关闭了原生密码登录，或由 User Center / Connector 接管登录，`ui-next` 需要显式定义降级策略

本规格建议的第一优先级是：

- 先支持“复用现有邮箱密码管理员登录”这一主链路
- 将插件接管型登录列为兼容项和开放问题
- 在未完成插件适配前，不承诺 `ui-next` 覆盖所有旧登录入口形态

### 7.2 后台能力仍是渐进迁移

即使管理员已经能在 `ui-next` 登录成功，也不代表旧后台可以立即下线。

需要接受的现实：

- 登录态接通只是后台迁移的前置条件
- 文章、视频、项目后台表单和配置页仍需逐步替换旧实现

## 8. 实施建议

采用三步推进。

### Phase A：认证骨架接通

目标：

- 建立 `ui-next` 管理员登录页
- 建立会话恢复与退出登录
- 建立后台路由守卫

建议动作：

- 新增 `ui-next` 管理员认证 API 封装
- 新增 `ui-next` 管理员身份状态容器
- 将 `/admin` 改为受保护路由
- 新增 `/admin/login`
- 移除 `Admin.tsx` 内部硬编码密码门

### Phase B：后台页面接入真实会话

目标：

- `ui-next` 后台页面能够带着现有登录态访问后端

建议动作：

- 统一后台请求走现有 `apiRequest`
- 修正 `adminApi.ts` 中的认证假设
- 对接最小闭环的内容管理接口

### Phase C：旧后台替换准备

目标：

- 让 `ui-next` 后台在最小内容运营范围内可替代旧后台

建议动作：

- 对齐文章、视频、项目管理页面
- 对齐必要的后台配置页
- 补充 403、会话过期、登录跳转等边界验证

## 9. 验收标准

满足以下条件即可视为本规格完成到“可继续迁移”的状态：

- `ui-next` 存在独立管理员登录页，而不是页面内演示密码门
- 管理员可通过真实后端接口登录 `ui-next`
- 刷新后可通过已有会话恢复管理员身份
- 非管理员访问 `/admin` 时不会进入后台页面
- `ui-next` 退出登录会清理当前会话并回到登录页
- `ui-next` 后台请求不再假设 Bearer Token
- 主规格与任务文档已将该事项作为独立规格跟踪

## 10. 与主规格的关系

本规格是 `specs/content-portal-simplification-spec.md` 的独立子规格。

关系定义如下：

- 内容门户主规格负责前台收口与整体产品边界
- 本规格负责 `ui-next` 后台认证接入与登录态复用
- 后续涉及 `ui-next` 管理员登录、后台守卫、后台认证 API 的实现，应优先读取本规格
