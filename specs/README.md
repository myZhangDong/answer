# 轻量 OpenSpec 工作方式

## 目标

这套结构用于在不引入额外平台或 CLI 的前提下，固定本仓库的需求说明、任务拆解、决策记录和 AI 协作入口，避免长期对话导致上下文漂移。

当前采用的是轻量模式：

- 不引入新服务
- 不强制所有小改动都写完整规格
- 只对跨阶段改造和持续推进任务使用

## 当前激活中的规格

当前主规格是内容门户化改造：

- Spec: `specs/content-portal-simplification-spec.md`
- Tasks: `specs/content-portal-simplification-tasks.md`
- Baseline: `specs/content-portal-simplification-baseline.md`
- Decisions: `specs/content-portal-simplification-decisions.md`
- Agent guide: `AGENTS.md`

当前已拆出的独立子规格：

- `specs/ui-next-admin-auth-spec.md`
  - 用于单独跟踪 `ui-next` 管理员登录、会话恢复、后台路由守卫，以及对现有后端鉴权的复用
- `specs/ui-next-admin-auth-tasks.md`
  - 用于单独跟踪 `ui-next` 管理员登录独立规格的执行步骤与验收状态
- `specs/003-ui-next-admin-site-settings-spec.md`
  - 用于单独跟踪 `ui-next` 网站设置迁移、首页 Banner 配置和“周热门文章”广告位配置
- `specs/003-ui-next-admin-site-settings-tasks.md`
  - 用于单独跟踪 `003` 规格的执行步骤、阶段验收和后续迁移衔接
- `specs/004-anonymous-feedback-spec.md`
  - 用于单独跟踪内容门户下“匿名点赞 + 匿名评分”的产品规则、接口边界、去重方式和数据结构
- `specs/004-anonymous-feedback-tasks.md`
  - 用于单独跟踪 `004` 规格的执行步骤、阶段验收和三类内容接入进度
- `specs/005-ui-next-content-taxonomy-spec.md`
  - 用于单独跟踪 `ui-next` 后台文章标签管理、文章标签录入闭环，以及视频分类配置化边界
- `specs/005-ui-next-content-taxonomy-tasks.md`
  - 用于单独跟踪 `005` 规格的执行步骤、阶段验收，以及文章标签管理与视频分类配置化的推进状态
- `specs/006-ui-next-mobile-adaptation-spec.md`
  - 用于单独跟踪 `ui-next` 前台与后台在移动端的响应式适配范围、优先级、边界和 Tailwind 实施原则
- `specs/006-ui-next-mobile-adaptation-tasks.md`
  - 用于单独跟踪 `006` 规格的执行步骤、阶段验收，以及前台完整适配与后台基础可用的推进状态
- `specs/007-ui-next-home-sidebar-hot-content-spec.md`
  - 用于单独跟踪 `ui-next` 首页右侧“热门 Demo”“热门教程”的真实数据接入、排序口径和前后端边界
- `specs/007-ui-next-home-sidebar-hot-content-tasks.md`
  - 用于单独跟踪 `007` 规格的执行步骤、阶段验收，以及首页与详情页热门模块真实数据接入的推进状态
- `specs/008-ui-next-console-register-cta-spec.md`
  - 用于单独跟踪 `ui-next` 前台注册环信 CTA 的文案收口、console 跳转参数统一和点击埋点接入
- `specs/008-ui-next-console-register-cta-tasks.md`
  - 用于单独跟踪 `008` 规格的执行步骤、阶段验收，以及 Header 与详情页底部 CTA 的推进状态
- `specs/009-ui-next-open-source-demo-form-spec.md`
  - 用于单独跟踪 `ui-next` 开源项目列表卡片“获取 Demo 示例”从滑块+短信切换为图片验证码+直接提交 CRM 表单的范围、字段映射和前后端边界
- `specs/009-ui-next-open-source-demo-form-tasks.md`
  - 用于单独跟踪 `009` 规格的执行步骤、阶段验收，以及图片验证码、UTM 透传和 CRM 提交链路的推进状态
- `specs/010-ui-next-admin-content-list-search-spec.md`
  - 用于单独跟踪 `ui-next` 后台文章、视频、项目列表搜索，统一 URL 状态，以及文章列表最小后端搜索补口范围
- `specs/010-ui-next-admin-content-list-search-tasks.md`
  - 用于单独跟踪 `010` 规格的执行步骤、阶段验收，以及三类后台列表搜索的接入进度

## 文件职责

### `spec.md` 类文档

用于说明为什么做、做什么、不做什么、总体范围和阶段策略。

本项目当前对应：

- `specs/content-portal-simplification-spec.md`

### `tasks.md` 类文档

用于拆执行顺序、阶段边界、验收项和当前进度。

本项目当前对应：

- `specs/content-portal-simplification-tasks.md`

### `decisions.md`

用于沉淀已确认决策、约束、开放问题和最近检查点。

本项目当前对应：

- `specs/content-portal-simplification-decisions.md`

### `baseline.md`

用于沉淀阶段性确认后的白名单、边界和“后续阶段必须继承的当前事实”。

本项目当前对应：

- `specs/content-portal-simplification-baseline.md`

### `AGENTS.md`

用于给 AI 一个稳定的仓库级入口，避免每次都重新解释代码结构和改码原则。

## 推荐工作流

### 开始一个新阶段前

1. 先读 `specs/content-portal-simplification-spec.md`
2. 再读 `specs/content-portal-simplification-tasks.md`
3. 再读 `specs/content-portal-simplification-baseline.md`
4. 再读 `specs/content-portal-simplification-decisions.md`
5. 最后读 `AGENTS.md`

如果本轮目标是迁移 `ui-next` 管理后台认证，还应补读：

6. `specs/ui-next-admin-auth-spec.md`
7. `specs/ui-next-admin-auth-tasks.md`

### 执行一个阶段时

1. 明确本轮只处理一个 Phase 或一个明确子任务
2. 改码前先检查工作区状态
3. 实现时优先沿用现有结构，不做额外重构
4. 本轮如果产生新结论，先更新 `decisions.md`
5. 本轮如果完成任务，更新 `tasks.md`
6. 阶段边界处提交一次代码

### 开新会话时

不要依赖整段聊天记录恢复上下文。优先提供以下信息：

- 当前目标，例如“继续执行 Phase 1”
- 当前分支名
- 最新提交 hash
- 相关规格文件路径
- 是否允许直接改代码

建议提示语模板：

```text
继续执行内容门户化改造的 Phase X。
先读取：
- specs/content-portal-simplification-spec.md
- specs/content-portal-simplification-tasks.md
- specs/content-portal-simplification-baseline.md
- specs/content-portal-simplification-decisions.md
- AGENTS.md
当前分支：<branch>
当前基线提交：<commit>
允许直接改代码并更新文档。
```

## 什么时候应该开新会话

建议在以下情况直接开新会话，而不是持续在旧对话里追加：

- 一个 Phase 已完成并已经提交代码
- 目标从前端切换到后端或反过来
- 需求边界发生明显变化
- 需要回顾和清理旧假设

## 维护原则

- `spec` 只写相对稳定的范围和策略
- `tasks` 只维护执行状态和任务拆解
- `baseline` 只维护阶段确认后的白名单和边界
- `decisions` 只记录已定结论和未决问题
- `AGENTS.md` 只维护项目级协作规则，不写具体任务进度

## 当前建议

后续继续推进时，默认以这 4 份文档为主上下文，不再把完整聊天历史当作唯一事实来源。
