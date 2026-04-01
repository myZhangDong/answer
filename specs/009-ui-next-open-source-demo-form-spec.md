# 009 `ui-next` 开源项目列表 Demo 获取表单改造 Spec

## 1. 背景

当前 `ui-next` 开源项目列表页和项目详情页都存在“获取 Demo 示例”入口。

现状存在两个问题：

- 弹窗当前仍是前端本地桩逻辑，先做滑块验证，再走短信验证码校验，实际并没有接入可用的短信服务
- 表单通过后只是本地放行打开 `demoUrl`，没有把用户线索提交到现有官网表单链路或 CRM

结合本轮需求，开源项目列表卡片的 Demo 获取链路需要收口为：

- 去掉滑块验证
- 去掉短信发送、短信验证码输入和短信倒计时
- 改为图片验证码
- 图片验证码通过后，不再发短信，直接调用新的表单提交接口
- 表单提交成功后，继续放行打开对应 Demo 链接

同时，这次线索提交不能直接停留在社区前端里，而要复用官网既有“试用申请”数据流向：

- 前端交互可参考当前官网 `guestbook/addmsg` 的请求口径
- 后端服务实现参考 `specs/phpserver.md` 中的 CRM 推送逻辑
- 最终仍提交到 `http://crm.easemob.com/distributor.action`
- CRM 字段 `sjly` 固定传 `社区表单`
- UTM / referrer / device / browser 等信息沿用 `https://doc.easemob.com/utm_helper.js` 自动采集结果

因此需要拆出 `009` 独立规格，固定产品交互、字段映射、验证码方案和前后端边界，避免后续继续按“滑块 + 短信”的旧假设实现。

## 2. 目标

### 2.1 产品目标

让 `ui-next` 开源项目列表页和项目详情页的“获取 Demo 示例”形成真实可用的获客闭环。

第一阶段必须满足：

- 改开源项目列表卡片和项目详情页上的“获取 Demo 示例”入口
- 弹窗不再展示滑块验证
- 弹窗不再展示短信验证码输入和重新发送逻辑
- 弹窗改为“基础信息 + 图片验证码 + 立即获取”的单次提交形态
- 弹窗当前保留“姓名 + 手机号 + 图片验证码 + 立即获取”
- 图片验证码校验通过后，直接提交线索表单
- 表单提交成功后，打开当前项目配置的 `demoUrl`
- 每次点击“获取 Demo 示例”都重新展示图片验证码，不保留前端免验证放行

### 2.2 工程目标

在不暴露 CRM 凭据、不让前端直连 CRM 的前提下，把新链路收口为：

- `ui-next` 负责弹窗表单、图片验证码展示、UTM 信息采集和提交调用
- Answer 后端负责验证码校验、参数清洗、CRM 登录绑定和 Lead 写入
- 前后端字段命名、默认值、错误码和成功后的放行逻辑固定下来

工程约束：

- 第一阶段不改旧 `ui/`
- 第一阶段不接短信服务
- 第一阶段不复用当前前端的滑块组件
- 第一阶段不从浏览器直接请求 `https://www.easemob.com/api/guestbook/addmsg`
- 第一阶段不从浏览器直接请求 `http://crm.easemob.com/distributor.action`

## 3. 非目标

本规格不做以下事情：

- 不改文章详情页、视频详情页底部 CTA
- 不改 Header 注册 CTA 和 `008` 规格中的 Console 注册导流
- 不新增普通用户账号体系
- 不接短信发送平台，也不保留短信验证码 fallback
- 不把整站所有营销表单统一迁移到同一个组件
- 不在第一阶段补完整的 CRM 后台查询、去重、回流状态展示

## 4. 现状确认

### 4.1 当前弹窗仍是前端演示态

当前 `ui-next/src/app/components/DemoModal.tsx` 使用的是前端内置桩逻辑：

- `sendSmsCode` 为模拟发送函数
- `verifySmsCode` 为模拟校验函数
- 弹窗流程为“手机号 -> 滑块验证 -> 短信验证码 -> 打开 Demo 链接”

结论：

- 当前链路不能真实投递线索
- 当前“滑块 + 短信”的交互需要整体替换，而不是继续补假接口

### 4.2 开源项目列表与项目详情页是本次改造入口

当前“获取 Demo 示例”入口位于：

- `ui-next/src/app/pages/OpenSource.tsx`
- `ui-next/src/app/pages/OpenSourceDetail.tsx`

按钮点击后：

- 已验证状态直接打开 `project.repo`
- 未验证状态打开 `DemoModal`

结论：

- `009` 第一阶段覆盖开源项目列表卡片和项目详情页入口
- 不把范围扩展到其他页面的外链按钮
- 当前阶段放行链接继续直接使用项目的 `repo` 字段，不额外新增独立 Demo URL 字段

### 4.3 仓库内已有图片验证码协议可复用

当前项目已经存在统一图片验证码协议：

- 获取验证码：`GET /answer/api/v1/user/action/record?action=...`
- 返回字段：`captcha_id`、`captcha_img`、`verify`
- 提交校验字段：`captcha_id`、`captcha_code`

结论：

- 第一阶段不单独发明第三套验证码协议
- 新 Demo 表单应复用同样的字段结构和交互习惯

### 4.4 官网旧服务可作为 CRM 映射参考

`specs/phpserver.md` 中的 `GuestbookController::addmsg` 已体现现网思路：

- 表单侧接收 `type/full_name/phone/email/company/msg/verify` 等字段
- 读取 `utmParameters` cookie 中的 referrer、device、browser 和 `utm_*`
- 服务端先登录 CRM，再通过 `serviceName=insert&objectApiName=Lead` 写入线索

但本仓库不应直接照搬旧 PHP 接口形态。

结论：

- 可复用字段映射和 CRM 推送思路
- 具体接口、鉴权、错误处理按当前 Go 服务结构重新设计

## 5. 关键边界

### 5.1 表单交互改为“手机号 + 图片验证码”

当前弹窗字段收口为：

- `full_name`：必填
- `phone`：必填，11 位中国大陆手机号
- `captcha_code`：必填

前端不再展示：

- 滑块验证
- 短信验证码输入框
- 发送验证码按钮
- 倒计时

说明：

- `email`、`company` 第一阶段不在弹窗内采集
- `msg` 第一阶段不让用户填写自由文本，走固定默认值

### 5.2 CRM 提交走后端代理，不允许前端直连

第一阶段链路为：

1. 前端打开弹窗后请求图片验证码
2. 用户填写手机号和图片验证码
3. 前端调用 Answer 后端新增接口
4. 后端校验图片验证码通过后，服务端登录 CRM 并提交 Lead
5. 后端返回成功后，前端标记当前访问周期已验证，并打开 `demoUrl`

不允许：

- 在浏览器里拼接 `crm.easemob.com` 登录参数
- 在前端暴露 CRM 用户名、密码或 binding
- 在前端直接提交旧官网 `guestbook/addmsg`

### 5.3 图片验证码协议复用现有字段，但动作类型独立

第一阶段应复用现有：

- `captcha_id`
- `captcha_code`
- `captcha_img`

但不应复用无关业务动作。

建议新增独立 action，例如：

- `demo_form`

原因：

- `email`、`search` 等现有 action 的频控语义不属于 Demo 表单
- Demo 表单第一阶段要求每次打开弹窗都展示图片验证码，不能污染其他动作计数

影响：

- 后端需新增独立验证码 action 常量和验证策略
- `ui-next` 获取验证码时使用 Demo 表单专属 action

### 5.4 提交到 CRM 的业务口径固定为社区来源

第一阶段提交 CRM 时，以下口径固定：

- 线索类型固定沿用官网试用申请口径
- `sjly` 固定传 `社区表单`
- Demo 获取的数据来源不再沿用 PHP 示例中的“官网表单”
- 备注字段当前直接传项目名称

建议默认映射：

- `type`：固定 `try_kefu`
- `full_name`：来自表单输入
- `phone`：来自表单输入
- `email`：空字符串
- `company`：空字符串
- `msg`：固定 `暂无需求，了解一下`

CRM 侧建议映射：

- `name` <- `full_name`
- `dianhua` <- `phone`
- `email` <- 空字符串
- `company` <- 空字符串
- `sjly` <- `社区表单`
- `beizhu` <- 项目名称

### 5.5 UTM 采集由前端引入现有脚本，后端负责透传

第一阶段前端需要引入：

- `https://doc.easemob.com/utm_helper.js`

约束：

- 不在前端自行重复实现一套 UTM 解析逻辑
- 优先复用该脚本产出的 `utmParameters` 数据
- 如果脚本通过 cookie 写入 `utmParameters`，后端应优先从请求 cookie 中读取
- 如果脚本未产出任何数据，后端对应 CRM 字段传空字符串，不阻塞表单提交

需要透传的典型字段包括：

- `referrer`
- `device`
- `browser`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

### 5.6 成功后的放行逻辑按“单次提交单次放行”收口

当前前端已有“1 小时内已验证”的内存态能力，但第一阶段不再保留。

第一阶段收口为：

- 每次点击“获取 Demo 示例”都重新展示图片验证码
- 只有本次提交成功后才打开当前点击项的 `demoUrl`
- 本次提交失败时不得打开 `demoUrl`
- 页面内不再缓存“已验证可直接放行”的状态

### 5.7 范围先收口到 `ui-next` 开源项目列表页

第一阶段只改：

- `ui-next/src/app/pages/OpenSource.tsx`
- `ui-next/src/app/pages/OpenSourceDetail.tsx`
- `ui-next/src/app/components/DemoModal.tsx`
- `ui-next` 公共 API / 工具层
- Answer 后端新增 Demo 表单提交接口与 CRM 代理服务

不改：

- 旧 `ui/`
- 详情页 CTA 组件
- 旧官网 PHP 服务
- 其他营销表单

## 6. 接口建议

### 6.1 前端获取图片验证码

建议接口：

- `GET /answer/api/v1/user/action/record?action=demo_form`

返回：

- `verify=true` 时，前端展示图片验证码输入区
- `captcha_id`
- `captcha_img`

说明：

- Demo 表单第一阶段建议按“始终需要图片验证码”处理，因此前端应按返回结果正常渲染验证码，不再保留滑块逻辑

### 6.2 新增 Demo 表单提交接口

建议新增公开接口，例如：

- `POST /answer/api/v1/project/demo/lead`

建议请求体：

```json
{
  "project_id": "123",
  "demo_url": "https://example.com/demo",
  "phone": "13800000000",
  "captcha_id": "captcha-token",
  "captcha_code": "2p4v"
}
```

后端派生默认值：

- `type=try_kefu`
- `msg=暂无需求，了解一下`
- `full_name=`
- `email=`
- `company=`
- `sjly=社区表单`

成功返回：

- `success=true`
- 可选返回 CRM 是否写入成功的追踪 ID

失败返回需可区分：

- 图片验证码错误
- 手机号格式错误
- 必填字段缺失
- CRM 登录失败
- CRM 写入失败

## 7. 验收标准

第一阶段完成后，应满足：

- 开源项目列表卡片点击“获取 Demo 示例”后，不再出现滑块验证
- 弹窗内不再出现短信验证码输入、发送按钮和倒计时
- 弹窗只采集手机号和图片验证码
- 图片验证码错误时，页面可提示并支持刷新验证码
- 提交成功后，后端已向 CRM 发起 Lead 写入，且 `sjly=社区表单`
- UTM / referrer / device / browser 等信息可从现有 `utm_helper.js` 采集结果透传
- 提交成功后才打开对应项目的 `demoUrl`
- 提交失败时不打开 `demoUrl`
- 再次点击任意项目卡片时，仍会重新展示图片验证码
- 第一阶段没有误改旧 `ui/` 和 `008` CTA 链路
