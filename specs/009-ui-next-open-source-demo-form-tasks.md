# 009 `ui-next` 开源项目列表 Demo 获取表单改造 Tasks

## 使用方式

这份清单只跟踪 `009` 规格下开源项目列表卡片 Demo 获取弹窗的表单改造、图片验证码接入和 CRM 提交链路，不与其他规格混写。

状态建议：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成

## 已确认默认前提

- [x] 第一阶段改 `ui-next` 开源项目列表卡片和项目详情页的“获取 Demo 示例”入口
- [x] 第一阶段移除滑块验证和短信验证码链路
- [x] 第一阶段只保留手机号和图片验证码，不采集姓名
- [x] 第一阶段改为图片验证码通过后直接提交表单
- [x] 当前阶段 Demo 放行链接继续使用项目的 `repo` 字段
- [x] 第一阶段每次打开弹窗都展示图片验证码
- [x] 第一阶段不保留前端“已验证直接放行”的缓存逻辑
- [x] CRM 提交来源字段 `sjly` 固定传 `community`
- [x] UTM 信息优先复用 `utm_helper.js` 自动采集结果
- [x] 前端不允许直连 `crm.easemob.com`

## Phase A：规格与主文档收口

目标：先把新表单口径、验证码方案和 CRM 来源字段写清楚。

### 文档

- [x] 创建 `009` 独立规格文件
- [x] 创建 `009` 独立任务清单
- [x] 在 `specs/README.md` 中登记 `009`
- [x] 在主 `decisions.md` 中补充 `009` 默认决策
- [x] 在主 `tasks.md` 中同步新增独立子规格记录

验收：

- [x] `009` 范围、字段映射和工程边界已经固定

## Phase B：前端弹窗改造

目标：把开源项目列表卡片的弹窗从“滑块 + 短信”改成“表单 + 图片验证码”。

### `ui-next`

- [x] 修改 `ui-next/src/app/components/DemoModal.tsx`
- [x] 修改 `ui-next/src/app/pages/OpenSourceDetail.tsx`
- [x] 移除滑块验证 UI 和状态管理
- [x] 移除短信验证码 UI、发送逻辑和倒计时
- [x] 保留手机号输入并补齐格式校验
- [x] 接入图片验证码获取和刷新
- [x] 保证每次打开弹窗都展示图片验证码
- [x] 移除旧的前端已验证缓存与直接放行逻辑

验收：

- [x] 弹窗不再包含短信相关交互
- [x] 图片验证码错误可在弹窗内提示并重试

## Phase C：后端提交接口与 CRM 代理

目标：由 Answer 后端承接表单提交、验证码校验和 CRM 写入。

### 后端

- [x] 新增 Demo 表单提交 schema
- [x] 新增 Demo 表单 controller
- [x] 新增 Demo 表单 service
- [x] 新增 CRM 代理调用封装
- [x] 新增 Demo 表单专属 captcha action
- [x] 在无 captcha 插件环境下改为后端内置 `base64Captcha` 图片验证码
- [x] 接入 CRM 登录与 Lead 写入
- [x] 固定 `sjly=community`
- [x] 固定默认 `msg=暂无需求，了解一下`

验收：

- [x] 前端不暴露 CRM 凭据
- [x] 图片验证码错误时后端能返回明确业务错误
- [x] CRM 写入失败时前端不会误放行 Demo 链接

## Phase D：UTM 与来源信息透传

目标：让社区 Demo 表单沿用官网现有投放归因口径。

### 归因信息

- [x] 在 `ui-next` 引入 `https://doc.easemob.com/utm_helper.js`
- [x] 读取脚本生成的 `utmParameters`
- [x] 透传 referrer、device、browser 和 `utm_*`
- [x] 在后端写入 CRM 字段映射
- [x] 缺失 UTM 时按空字符串处理

验收：

- [x] CRM 入参可区分社区来源和投放信息
- [x] UTM 缺失不会阻塞表单提交

## Phase E：回归验证

目标：确认弹窗、验证码、CRM 提交和 Demo 放行都没有回归。

### 检查项

- [ ] 验证开源项目列表卡片仍可正常打开弹窗
- [ ] 验证项目详情页“获取 Demo 示例”可正常打开弹窗
- [ ] 验证图片验证码可获取、可刷新
- [ ] 验证提交成功后打开对应 `demoUrl`
- [ ] 验证提交失败时不打开 `demoUrl`
- [ ] 验证重复点击时仍需重新完成图片验证码
- [x] 验证旧 `ui/` 未被误改
- [x] 验证 `008` CTA 链路未受影响

验收：

- [~] `009` 第一阶段代码已完成，已通过本地 `go build ./cmd/answer` 与 `ui-next` `npm run build`，待补真实 CRM 联调与页面人工回归
