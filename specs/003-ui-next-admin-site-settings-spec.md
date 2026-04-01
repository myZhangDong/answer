# 003 `ui-next` 管理后台网站设置、首页广告位与用户管理迁移 Spec

## 1. 背景

当前 `ui-next/` 已经完成管理员登录骨架，以及文章、视频、项目三类内容的基础后台页面接入，但旧 `ui/` 管理后台仍然承担大部分站点配置能力：

- `ui/` 已有 `General`、`Interface`、`Branding`、`SEO`、`Legal`、`Write`、`Themes`、`CSS/HTML`、`Login` 等页面
- 这些页面主要复用后端现有 `/answer/admin/api/siteinfo/*` 配置接口
- `ui-next/` 目前没有对应的网站设置入口，也没有前台运营位配置页面

同时，`ui-next` 首页仍存在两处硬编码展示：

- 顶部 Hero/Banner 区块写死在 `ui-next/src/app/pages/Home.tsx`
- “周热门文章”上方的广告图卡片也写死在 `ui-next/src/app/pages/Home.tsx`

当前明确需求是：

- 把旧后台里内容门户仍然需要的网站设置能力迁到 `ui-next`
- 支持首页 Banner 图配置，字段至少包括图片和点击链接
- 支持首页“周热门文章”上方广告位配置，字段至少包括图片和点击链接
- 把旧后台用户管理迁到 `ui-next`，用于新增其他管理员账号和处理用户后台操作
- 其他旧后台配置项是否继续迁移，需要在本规格下单独确认

## 2. 目标

### 2.1 产品目标

让管理员可以直接在 `ui-next` 管理后台完成内容门户场景下必要的网站设置，而不再依赖旧 `ui/` 完成首页运营位配置。

本规格当前已确认必须实现：

- `ui-next` 提供“网站设置”后台入口
- 支持管理站点基础信息
- 支持管理 SEO 配置
- 支持管理首页顶部 Banner 图和点击链接
- 支持管理首页“周热门文章”上方广告位的图片和点击链接
- 支持在 `ui-next` 里新增账号，并完成用户资料、角色、状态和密码管理
- 前台首页渲染真实后台配置，而不是继续写死图片内容
- 浏览器标题和 favicon 渲染真实站点基础信息与图标类品牌配置
- `ui-next` 管理后台导航从顶部改为左侧

### 2.2 工程目标

优先复用现有站点配置后端能力，只对当前旧接口未覆盖的首页运营位补最小新增后端接口。

工程约束：

- 旧 `ui/` 仍保留为迁移期 fallback，不在本轮删除
- 管理员认证继续复用现有 `ui-next` 后台登录与 Cookie/Session 体系
- 已有站点基础配置优先继续复用 `/answer/admin/api/siteinfo/*`
- 首页运营位不建议硬塞进 `branding` 现有结构，建议单独建“首页配置”字段或接口

## 3. 非目标

本规格不做以下事情：

- 不一次性迁完旧后台全部配置页
- 不迁移 Questions、Answers、Users、Privileges、Badges 这类社区后台
- 不迁移 Privileges、Badges、Answers、Questions 这类社区后台页
- 不重做后台权限模型
- 不重写前台首页整体布局
- 不在本轮删除旧 `ui/` 中的站点设置页面
- 不在本轮要求插件后台、邮件配置、用户体系配置全部迁入 `ui-next`

## 4. 现状确认

### 4.1 旧 `ui/` 中已有的站点设置能力

当前旧后台已存在以下配置页和接口基础：

- `General`
  - `GET/PUT /answer/admin/api/siteinfo/general`
- `Interface`
  - `GET/PUT /answer/admin/api/siteinfo/interface`
- `Branding`
  - `GET/PUT /answer/admin/api/siteinfo/branding`
- 其他候选页
  - `SEO`
  - `Legal`
  - `Write`
  - `Themes`
  - `CSS/HTML`
  - `Login`

其中：

- `general` 当前覆盖站点名称、短描述、描述、站点 URL、联系邮箱、检查更新
- `interface` 当前覆盖语言、时区
- `branding` 当前覆盖 logo、mobile logo、square icon、favicon

### 4.2 `ui-next` 当前后台状态

`ui-next` 当前后台路由只覆盖：

- `/admin/articles`
- `/admin/videos`
- `/admin/projects`
- `/admin/site-settings`

没有：

- 用户管理页面
- 用户管理 API 封装
- 用户操作弹窗与重置密码交互

### 4.3 `ui-next` 首页当前硬编码点

`ui-next/src/app/pages/Home.tsx` 目前至少有两处写死内容：

- 页面顶部大 Banner/Hero 区块
- 右侧“周热门文章”上方广告卡片

这意味着即使后台已经能管理文章、视频、项目，首页运营位仍无法通过后台维护。

## 5. 范围

### 5.1 本规格内必须覆盖

#### A. `ui-next` 新增网站设置后台入口

建议新增：

- 路由：`/admin/site-settings`
- 左侧导航新增“网站设置”
- 后台整体导航从顶部切换为左侧布局

#### B. 网站设置页面第一阶段内容

建议将第一阶段页面拆成四个设置分组：

1. 基础信息
   - 站点名称
   - 站点短描述
   - 站点描述
   - 站点 URL
   - 联系邮箱
   - 检查更新开关

2. 品牌资源
   - Square Icon
   - Favicon

3. SEO
   - permalink
   - robots

说明：

- 当前这一组配置仍主要复用旧后台 SEO 能力
- `permalink` 和 `robots` 继续保留在这里
- 但 `ui-next` 当前真正面向内容门户前台的 `title`、`meta description`、`keywords`、`og image` 等元信息能力，不应继续塞进 `general`
- 后续如果补齐内容门户 SEO 元信息，应继续放在 SEO 分组下，而不是改写基础信息语义

4. 首页运营位
   - 首页顶部 Banner
   - “周热门文章”上方广告位

#### C. 首页运营位配置字段

当前已确认必须支持的字段：

- `image_url`
- `link_url`

建议第一阶段同步补上：

- `enabled`

原因：

- 仅有图片和链接，不足以支持后台临时下线广告位
- `enabled` 能让前台明确区分“未配置”和“关闭展示”

#### D. 用户管理第一阶段内容

建议第一阶段迁移以下旧后台能力：

1. 用户列表
   - 用户名 / 显示名 / 邮箱展示
   - 创建时间、状态、角色展示
   - 支持搜索
   - 支持轻量范围切换，例如激活用户、管理员/版主、未激活、已封禁、已删除

2. 新增账号
   - 支持新增单个账号
   - 支持直接指定角色，满足新增管理员账号的实际诉求

3. 用户操作
   - 编辑资料
   - 修改角色
   - 修改状态
   - 设置新密码
   - 对未激活账号支持发送激活邮件

说明：

- 旧后台顶部 tabs 形态不是必需项，不要求在 `ui-next` 复刻
- 第一阶段不要求迁移批量导入用户能力，优先满足管理员账号维护和常规用户操作

### 5.2 推荐的数据结构

建议单独抽象一个“首页配置”结构，而不是塞进现有 `branding`：

```json
{
  "home_banner": {
    "enabled": true,
    "image_url": "https://cdn.example.com/banner.jpg",
    "link_url": "https://example.com/campaign"
  },
  "hot_articles_ad": {
    "enabled": true,
    "image_url": "https://cdn.example.com/ad.jpg",
    "link_url": "https://example.com/activity"
  }
}
```

说明：

- `home_banner` 对应首页顶部 Banner 区块
- `hot_articles_ad` 对应“周热门文章”上方广告位
- 第一阶段不要求额外支持文案编辑，默认以图片直出为主

### 5.3 前台渲染策略

#### 公共站点标题与描述

当前已确认：

- `general.name`、`general.short_description`、`general.description` 仍属于站点基础资料
- 它们当前可以继续作为 `ui-next` 运行时默认标题和默认描述的 fallback
- 但它们不等同于内容门户专用 SEO 元信息配置

因此后续应区分两层语义：

1. 基础信息
   - 站点名称
   - 站点简介
   - 站点 URL
   - 联系邮箱
   - 检查更新

2. SEO 元信息
   - 默认 title
   - title 模板
   - 默认 meta description
   - keywords
   - og image
   - canonical base URL

第一阶段额外要求：

- 至少修正 `ui-next/index.html` 中 Figma 遗留的静态占位 `<title>`
- 至少补上静态默认 `<meta name="description">`

说明：

- 这一步仅解决“查看网页源代码仍显示占位 title、没有 description”的明显问题
- 它不是完整的 SSR / 预渲染 SEO 方案，只是首屏静态 fallback 修正

#### 首页顶部 Banner

已确认第一阶段行为：

- 首页顶部 Hero 直接替换为后台配置的“图片 + 链接” Banner
- 如果 `home_banner.enabled=true` 且 `image_url` 非空，则渲染后台配置
- 如果未配置或关闭，则该 Banner 区块不展示默认 Hero 文案结构

说明：

- 这里不再保留当前 `Home.tsx` 的硬编码 Hero 文案布局作为默认实现
- 该区域产品语义已明确为运营 Banner，不继续保留“半配置半写死”的双轨结构

#### “周热门文章”上方广告位

已确认第一阶段行为：

- 如果已配置 `hot_articles_ad.enabled=true` 且 `image_url` 非空，则渲染后台配置图片并包裹点击链接
- 如果未配置或关闭，则该广告位直接不显示

## 6. API 策略

### 6.1 继续复用的旧接口

这部分建议直接复用现有后台接口：

- `GET/PUT /answer/admin/api/siteinfo/general`
- `GET/PUT /answer/admin/api/siteinfo/interface`
- `GET/PUT /answer/admin/api/siteinfo/branding`
- `GET/PUT /answer/admin/api/siteinfo/seo`
- `GET /answer/admin/api/users/page`
- `GET /answer/admin/api/roles`
- `POST /answer/admin/api/user`
- `PUT /answer/admin/api/user/profile`
- `PUT /answer/admin/api/user/role`
- `PUT /answer/admin/api/user/status`
- `PUT /answer/admin/api/user/password`
- `GET /answer/admin/api/user/activation`
- `POST /answer/admin/api/users/activation`

### 6.2 建议新增的后台接口

由于现有 `siteinfo` schema 中并没有首页 Banner 和广告位配置字段，建议新增独立接口：

- `GET /answer/admin/api/siteinfo/homepage`
- `PUT /answer/admin/api/siteinfo/homepage`

建议原因：

- `branding` 语义是站点身份资源，不适合继续塞首页广告位
- 首页 Banner 和广告位属于内容门户运营配置，生命周期和品牌资源不同
- 独立接口更便于后续扩展更多首页运营位

### 6.3 建议新增的前台公开读取接口

为避免直接复用后台接口给前台页面，建议新增公开读取接口：

- `GET /answer/api/v1/siteinfo/homepage`

说明：

- 首页公开渲染只需要读，不需要暴露后台写接口
- 单独接口能减少对现有 `/answer/api/v1/siteinfo` 返回结构的侵入

## 7. `ui-next` 实现建议

### 7.1 后台页面组织

建议在 `ui-next` 内新增：

- `ui-next/src/app/pages/AdminSiteSettings.tsx`
- `ui-next/src/app/api/siteSettingsApi.ts`

或在现有 `adminApi.ts` 中新增一组 site settings 相关封装，但不建议把内容管理接口和站点设置接口继续无限混放。

### 7.2 后台导航布局

已确认：

- `ui-next` 管理后台导航从顶部标签切换为左侧导航
- 左侧导航的结构和交互风格尽量向前台主导航靠拢
- 但信息架构仍以后台管理任务为主，不直接复用前台内容分类

建议第一阶段左侧导航至少包含：

- 文章管理
- 视频管理
- 项目管理
- 网站设置
- 用户管理

### 7.3 上传能力

图片上传建议继续复用现有统一上传链路：

- 后端继续走现有上传接口
- `ui-next` 管理页先上传图片，再保存配置中的 `image_url`

## 8. 推荐分期

### Phase A：站点设置基础迁移

目标：

- `ui-next` 新增网站设置页面
- 接通 `general/branding/seo` 旧接口
- 后台导航改为左侧布局
- 修正 `ui-next` 静态入口页的默认 title / description 占位值

验收：

- 管理员可以在 `ui-next` 修改站点基础信息、Square Icon、Favicon 等品牌资源
- 管理员可以在 `ui-next` 修改 SEO 配置
- 管理员可以通过左侧导航进入各个后台模块
- `ui-next` 网页源代码不再保留 Figma 占位 title，且存在静态默认 description

### Phase B：首页运营位配置闭环

目标：

- 新增首页运营位后台配置接口
- `ui-next` 后台支持编辑首页 Banner 和热门文章广告位

验收：

- 管理员可以在 `ui-next` 上传图片并保存链接
- 后台保存后，首页能展示真实配置

### Phase C：前台替换与 fallback 收口

目标：

- 首页顶部和右侧广告位不再依赖硬编码内容
- 明确未配置时的 fallback 策略

验收：

- 已配置时优先展示后台配置
- 未配置时行为符合本规格约定，不出现空白或异常跳转

## 9. 验收标准

满足以下条件可视为本规格第一阶段达成：

- `ui-next` 后台存在独立“网站设置”入口
- 管理员可在 `ui-next` 修改站点基础信息、图标类品牌资源
- 管理员可在 `ui-next` 修改 SEO 配置
- 管理员可配置首页顶部 Banner 的图片和点击链接
- 管理员可配置“周热门文章”上方广告位的图片和点击链接
- 管理员可在 `ui-next` 查看用户列表并新增其他管理员账号
- 管理员可在 `ui-next` 执行编辑资料、改角色、改状态、设置新密码等必要用户操作
- 首页能够消费真实后台配置，而不是继续完全依赖硬编码
- 浏览器标题和 favicon 能消费真实站点基础信息与图标类品牌配置
- `ui-next` 静态入口页的默认 title / description 已从 Figma 占位值修正为可接受的站点 fallback
- 顶部 Banner 未配置时不渲染默认 Hero 文案 Banner
- 热门文章广告位未配置时直接隐藏
- `ui-next` 管理后台导航已改为左侧布局
- 旧 `ui/` 网站设置页在迁移完成前继续保留

## 10. 待确认问题

以下问题当前仍未拍板，后续如需继续扩展迁移范围，需要单独确认：

### Q-001 第一阶段之后还要不要继续迁移其他站点设置页

当前已确认第一阶段纳入：

- `general`
- `branding`
- `seo`
- `homepage` 运营位

当前未纳入：

- `legal`
- `write`
- `themes`
- `custom-css-html`
- `login`

### Q-002 左侧后台导航是否需要进一步做成分组式信息架构

当前只确认“从顶部切到左侧，并与前台导航风格接近”。

但是否进一步拆成：

- 内容管理
- 站点设置
- 系统能力

还没有继续细化。

## 11. 与现有规格的关系

这份规格是内容门户主规格下的独立子规格，位于管理员后台迁移链路中。

关系如下：

- `specs/content-portal-simplification-spec.md`
  - 负责内容门户整体产品边界
- `specs/ui-next-admin-auth-spec.md`
  - 负责 `ui-next` 管理员登录、会话恢复与后台守卫
- `specs/003-ui-next-admin-site-settings-spec.md`
  - 负责 `ui-next` 网站设置页迁移，以及首页运营位配置闭环

后续如果继续迁移旧后台其他配置页，应优先基于本规格确认是否属于内容门户必要能力，再决定是否并入 `003` 后续任务或拆新编号。
