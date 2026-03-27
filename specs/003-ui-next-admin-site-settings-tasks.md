# 003 `ui-next` 管理后台网站设置与首页广告位迁移 Tasks

## 使用方式

这份清单只跟踪 `003` 规格下的网站设置迁移、首页运营位配置、用户管理迁移和 `ui-next` 后台导航布局调整，不与内容门户主任务清单混写。

状态建议：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成

## 已确认默认前提

- [x] 第一阶段迁移 `general`、`interface`、`branding`、`seo`
- [x] 第一阶段新增首页运营位配置，覆盖 `home_banner` 和 `hot_articles_ad`
- [x] 首页顶部区域改为“图片 + 链接”的 Banner，不保留当前硬编码 Hero 文案
- [x] “周热门文章”广告位未配置或关闭时直接隐藏
- [x] `ui-next` 管理后台导航从顶部改为左侧，并尽量贴近前台导航风格
- [x] 旧 `ui/` 网站设置页在迁移完成前继续保留为 fallback
- [x] 管理员认证继续复用当前 `ui-next` 已接通的 Cookie / Session 会话
- [x] 用户管理迁移以复用现有后台接口为主，不额外改后端权限模型
- [x] 旧 `ui/` 用户管理顶部筛选 tabs 不要求在 `ui-next` 复刻

## Phase A：后端配置接口与数据结构

目标：在不破坏现有站点设置能力的前提下，补齐 `ui-next` 所需的后台和前台配置接口。

### 复用现有站点设置接口

- [x] 确认继续复用 `GET/PUT /answer/admin/api/siteinfo/general`
- [x] 确认继续复用 `GET/PUT /answer/admin/api/siteinfo/interface`
- [x] 确认继续复用 `GET/PUT /answer/admin/api/siteinfo/branding`
- [x] 确认继续复用 `GET/PUT /answer/admin/api/siteinfo/seo`

### 新增首页配置模型

- [x] 在后端 schema 中新增首页配置请求与响应结构
- [x] 首页配置至少包含 `home_banner` 和 `hot_articles_ad`
- [x] 每个运营位至少包含 `enabled`、`image_url`、`link_url`
- [x] 明确空值、关闭状态和默认值语义

### 新增后台管理接口

- [x] 新增 `GET /answer/admin/api/siteinfo/homepage`
- [x] 新增 `PUT /answer/admin/api/siteinfo/homepage`
- [x] 将新接口接入 router、controller、service 和配置存储链路
- [x] 补齐 Swagger 注释和必要生成物

### 新增前台公开读取接口

- [x] 新增 `GET /answer/api/v1/siteinfo/homepage`
- [x] 公开接口返回结构与前台消费模型对齐
- [x] 明确未配置时返回空对象还是默认关闭结构

验收：

- [x] 管理后台可读写 `homepage` 配置
- [x] 前台首页可通过公开接口读取 `homepage` 配置
- [ ] 旧站点设置接口继续可用，没有被回归破坏

## Phase B：`ui-next` 后台壳子改为左侧导航

目标：将 `ui-next` 管理后台从顶部标签导航切换为左侧导航布局，为后续站点设置和更多后台页预留稳定壳子。

### 后台布局调整

- [x] 调整 `ui-next` 后台壳子，从顶部导航改为左侧导航
- [x] 保留顶部区域的管理员信息与退出登录能力
- [x] 让主内容区与左侧导航形成稳定两栏布局
- [x] 兼容桌面与窄屏显示，不因左侧导航导致后台页面不可用

### 左侧导航信息架构

- [x] 左侧导航纳入“文章管理”
- [x] 左侧导航纳入“视频管理”
- [x] 左侧导航纳入“项目管理”
- [x] 左侧导航纳入“网站设置”
- [x] 当前阶段不纳入社区后台菜单项

### 路由接入

- [x] 新增 `/admin/site-settings`
- [x] 管理后台默认入口是否仍跳转 `/admin/articles`，按当前实现保持一致
- [x] 左侧导航当前激活态与子路由高亮正确

验收：

- [x] `ui-next` 管理后台已不再使用顶部标签导航
- [x] 管理员能通过左侧导航进入内容管理与网站设置
- [x] 左侧导航布局在常用桌面宽度下稳定可用

## Phase C：`ui-next` 网站设置页接通旧接口与新接口

目标：让管理员可直接在 `ui-next` 中维护第一阶段网站设置与首页运营位。

### API 封装

- [x] 新增 `ui-next` 网站设置 API 封装文件
- [x] 接通 `general` 读写接口
- [x] 接通 `interface` 读写接口
- [x] 接通 `branding` 读写接口
- [x] 接通 `seo` 读写接口
- [x] 接通 `homepage` 读写接口

### 页面结构

- [x] 新增 `AdminSiteSettings` 页面
- [x] 页面内按分组展示基础信息、界面与品牌、SEO、首页运营位
- [x] 表单提交成功后提供统一成功提示
- [x] 表单校验失败时提供统一错误表现

### 图片上传

- [x] 首页 Banner 图片支持上传后回填 `image_url`
- [x] 热门文章广告图支持上传后回填 `image_url`
- [x] 品牌资源上传继续沿用已有上传链路

### 运营位编辑能力

- [x] 支持编辑首页顶部 Banner 的图片、链接、启用状态
- [x] 支持编辑“周热门文章”广告位的图片、链接、启用状态
- [x] 保存后能重新读取并回显真实配置

验收：

- [x] 管理员可在 `ui-next` 完成 `general/interface/branding/seo` 配置修改
- [x] 管理员可在 `ui-next` 完成两个首页运营位配置修改
- [x] 刷新网站设置页后能正确回显后端已保存数据

## Phase D：前台首页消费真实配置

目标：移除首页运营位对硬编码内容的依赖，改为消费真实后台配置。

### 首页顶部 Banner 替换

- [x] `Home.tsx` 顶部区域改为消费 `home_banner`
- [x] Banner 使用“图片 + 链接”模式渲染
- [x] 未配置或关闭时顶部 Banner 区块不展示

### 热门文章广告位替换

- [x] “周热门文章”上方广告位改为消费 `hot_articles_ad`
- [x] 已配置且启用时渲染可点击图片
- [x] 未配置或关闭时直接隐藏该广告位

### 数据获取与容错

- [x] 新增首页配置前台读取 API 封装
- [x] 处理加载失败、配置为空和链接为空等边界
- [x] 避免首页因运营位接口失败导致主体内容不可用

验收：

- [x] 首页顶部 Banner 已不再依赖当前硬编码 Hero
- [x] 热门文章广告位配置为空时不会显示默认广告卡片
- [x] 首页主体文章列表和侧栏热门文章不受运营位读取失败影响

## Phase E：联调、验证与迁移衔接

目标：确认 `003` 第一阶段达到可继续替换旧后台站点设置页的状态。

### 联调检查

- [ ] 验证管理员可进入 `ui-next /admin/site-settings`
- [ ] 验证 `general/interface/branding/seo` 保存成功
- [ ] 验证 `homepage` 两个运营位保存成功
- [ ] 验证首页 Banner 实时读取真实配置
- [ ] 验证热门文章广告位关闭时直接隐藏
- [ ] 验证左侧导航切换不同后台页时状态正确

### 回归检查

- [ ] 验证文章、视频、项目后台页未因左侧导航改造失效
- [ ] 验证管理员退出登录后后台守卫行为不回归
- [ ] 验证旧 `ui/` 网站设置页仍可作为 fallback 使用

### 迁移衔接

- [x] 记录第一阶段仍未迁移的旧后台配置页
- [x] 明确第二阶段候选范围：默认优先 `legal`、`login`、`custom-css-html`，暂缓 `write`、`themes`
- [x] 如本轮形成新的后台信息架构结论，补入 `decisions.md`

验收：

- [ ] `003` 第一阶段达到“可在 `ui-next` 维护网站设置与首页运营位”的状态
- [ ] 旧 `ui/` 后台可进入降级备用状态，但不必立即删除

## Phase F：`ui-next` 用户管理迁移

目标：让管理员可以直接在 `ui-next` 中完成其他管理员账号创建与常规用户后台操作。

### API 封装

- [x] 新增 `ui-next` 用户管理 API 封装文件
- [x] 接通 `GET /answer/admin/api/users/page`
- [x] 接通 `GET /answer/admin/api/roles`
- [x] 接通 `POST /answer/admin/api/user`
- [x] 接通 `PUT /answer/admin/api/user/profile`
- [x] 接通 `PUT /answer/admin/api/user/role`
- [x] 接通 `PUT /answer/admin/api/user/status`
- [x] 接通 `PUT /answer/admin/api/user/password`
- [x] 视情况接通用户激活相关接口

### 页面与导航

- [x] 新增 `/admin/users`
- [x] 左侧导航纳入“用户管理”
- [x] 新增 `AdminUsers` 页面
- [x] 不复刻旧后台顶部筛选 tabs，改为轻量搜索和范围切换

### 列表与新增账号

- [x] 展示用户基础信息、状态、角色、创建时间
- [x] 支持按邮箱 / 用户名 / 显示名搜索
- [x] 支持新增单个账号
- [x] 新增账号时支持直接指定角色，满足创建管理员账号诉求

### 用户操作

- [x] 支持编辑资料
- [x] 支持修改角色
- [x] 支持修改状态
- [x] 支持设置新密码
- [x] 未激活用户支持发送激活邮件或提供激活链路操作

验收：

- [ ] 管理员可在 `ui-next` 查看目标范围内的用户列表
- [ ] 管理员可在 `ui-next` 新增其他管理员账号
- [ ] 管理员可在 `ui-next` 完成改角色、改状态、改资料、改密码
- [ ] 旧 `ui/` 用户管理在迁移完成前仍可作为 fallback 使用

## 当前未决问题

### O-001 第二阶段还要继续迁哪些旧后台配置页

候选项：

- 第一优先级：`legal`
- 第二优先级：`login`
- 第三优先级：`custom-css-html`
- 暂缓：`write`
- 暂缓：`themes`

### O-002 左侧后台导航是否要继续做成分组式菜单

当前已确认：

- 导航必须切到左侧
- 风格尽量贴近前台导航

当前未确认：

- 是否继续拆成“内容管理 / 网站设置 / 系统能力”等分组
