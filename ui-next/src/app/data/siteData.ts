// ─── 全站数据集中管理 ───────────────────────────────────────────
// Search.tsx 及各页面均可从此处导入，确保搜索结果与页面内容完全一致。

// ── 技术文章 ────────────────────────────────────────────────────
export const ARTICLES = [
  {
    id: 1,
    title: "怎样集成Web SDK",
    author: "zhangdong1",
    date: "2025-06-23",
    tag: "Web",
    views: 3217,
    likes: 256,
    excerpt:
      "本文将详细介绍如何集成环信Web SDK，包括环境准备、安装步骤、初始化配置以及常见问题的排查方案，助力开发者快速上手。",
    content: `本文将详细介绍如何集成环信 Web SDK，包括环境准备、安装步骤、初始化配置以及常见问题的排查方案，助力开发者快速上手。

## 1. 环境准备

在开始之前，请确保你已经注册了环信开发者账号，并创建了应用以获取 \`appKey\`。

- Node.js >= 16.x
- 支持现代浏览器（Chrome 80+、Firefox 75+、Safari 14+）
- 已创建环信应用并获取 \`appKey\`

## 2. 安装 SDK

\`\`\`bash
npm install easemob-websdk --save
\`\`\`

如果你使用 yarn：

\`\`\`bash
yarn add easemob-websdk
\`\`\`

## 3. 初始化配置

引入 SDK 后，我们需要实例化 \`connection\` 对象：

\`\`\`javascript
import WebIM from 'easemob-websdk';

// 初始化 SDK
const client = new WebIM.connection({
  appKey: 'your_appkey'
});
\`\`\`

## 4. 连接登录

\`\`\`javascript
// 使用 Token 登录（推荐）
client.open({
  user: 'user1',
  accessToken: 'your_access_token'
});

// 监听连接成功事件
client.addEventHandler('connection', {
  onConnected: () => {
    console.log('连接成功');
  },
  onDisconnected: () => {
    console.log('连接断开');
  }
});
\`\`\`

## 5. 发送消息

\`\`\`javascript
// 发送文本消息
const message = WebIM.message.create({
  type: 'txt',
  msg: 'Hello, 环信！',
  to: 'targetUser',
  chatType: 'singleChat'
});

client.send(message).then(() => {
  console.log('消息发送成功');
}).catch(err => {
  console.error('发送失败', err);
});
\`\`\`

## 6. AI 功能集成

环信 SDK 内置了 AI 能力，可以通过以下方式启用智能对话：

\`\`\`javascript
// 启用 AI 翻译
client.translateMessage({ msgId: 'xxx', languages: ['zh', 'en'] });
\`\`\`

> **注意**：AI 功能需要在环信控制台单独开启，并且会产生额外的使用费用，请根据实际需求开启。

## 常见问题

**Q: 连接超时怎么处理？**

A: 检查 \`appKey\` 是否正确，以及网络是否可以访问 \`msync.easemob.com\`。

**Q: 如何获取 accessToken？**

A: 通过环信 REST API 的 \`/token/users\` 接口获取，或直接使用密码登录（仅适合开发阶段）。`,
  },
  {
    id: 2,
    title: "如何修改会话列表中系统消息的头像",
    author: "zhangdong1",
    date: "2025-06-23",
    tag: "iOS",
    views: 183,
    likes: 12,
    excerpt:
      "在实际开发中，系统消息头像的修改是一个常见需求。本文提供具体的代码示例和完整的实现思路。",
    content: `在实际开发中，系统消息头像的修改是一个常见需求。本文提供具体的代码示例和完整的实现思路。

## 背景

环信 iOS SDK 默认在会话列表中为系统消息展示一个固定头像。当产品需要自定义品牌形象时，我们需要替换该头像。

## 实现方式

在 \`EaseChatUIKit\` 中，会话列表的渲染由 \`ConversationListController\` 控制。你可以通过子类化该控制器并重写对应方法来修改头像：

\`\`\`swift
class CustomConversationListVC: ConversationListController {

  override func tableView(
    _ tableView: UITableView,
    cellForRowAt indexPath: IndexPath
  ) -> UITableViewCell {
    let cell = super.tableView(tableView, cellForRowAt: indexPath)
    guard let conversationCell = cell as? EaseConversationCell else {
      return cell
    }
    // 替换系统消息头像
    if conversationCell.conversation?.conversationId == "system_notification" {
      conversationCell.avatarImageView.image = UIImage(named: "custom_system_avatar")
    }
    return conversationCell
  }
}
\`\`\`

## 注意事项

- 确保 \`custom_system_avatar\` 已添加到 Assets.xcassets。
- 若头像需要从网络加载，建议使用 SDWebImage 或 Kingfisher 进行异步加载。
- 系统消息的 \`conversationId\` 可在控制台的「通知消息」配置中查看。`,
  },
  {
    id: 3,
    title: "消息发出多长时间可以撤回?",
    author: "zhangdong1",
    date: "2025-06-23",
    tag: "Web",
    views: 56,
    likes: 5,
    excerpt:
      "环信即时通讯提供了消息撤回功能，默认时间限制是多久？如何更改这个设置？本文为你详细解答。",
    content: `环信即时通讯提供了消息撤回功能，默认时间限制是多久？如何更改这个设置？本文为你详细解答。

## 默认撤回时限

环信 IM 默认消息撤回时间为 **2 分钟**。超过该时间的消息将无法撤回，调用撤回接口会返回错误码 \`MESSAGE_RECALL_TIME_LIMIT_EXCEEDED\`。

## 修改撤回时限

可以在环信管理控制台修改���配置：

1. 登录 [环信控制台](https://console.easemob.com)
2. 进入「即时通讯」→「功能配置」→「消息撤回」
3. 将时间修改为所需值（最大支持 **7 天 = 604800 秒**）

## 代码示例

\`\`\`javascript
// Web SDK 撤回消息
const result = await client.recallMessage({
  mid: 'message_id',    // 消息 ID
  to: 'targetUser',     // 接收方
  chatType: 'singleChat'
});

if (result.code === 'ok') {
  console.log('撤回成功');
} else {
  console.error('撤回失败', result);
}
\`\`\`

> **提示**：消息撤回后，接收方会收到一条"对方撤回了一条消息"的系统通知。你可以通过监听 \`onMessageRecalled\` 事件来刷新 UI。`,
  },
  {
    id: 4,
    title: "环信IM Uniapp SDK集成教程(群组篇)",
    author: "飞鹏",
    date: "2025-06-23",
    tag: "Uniapp",
    views: 408,
    likes: 34,
    excerpt:
      "群组功能是IM中的核心模块，本教程将带你使用Uniapp快速实现群组创建、成员管理、消息收发等功能。",
    content: `群组功能是 IM 中的核心模块。本教程将带你使用 Uniapp 快速实现群组创建、成员管理、消息收发等功能。

## 安装 SDK

\`\`\`bash
npm install easemob-websdk
\`\`\`

## 创建群组

\`\`\`javascript
const result = await uni.$chat.createGroup({
  data: {
    groupname: '技术交流群',
    desc: '环信开发者交流',
    members: ['user2', 'user3'],
    public: true,
    allowinvites: true
  }
});
console.log('群组ID:', result.data.groupid);
\`\`\`

## 发送群组消息

\`\`\`javascript
const msg = WebIM.message.create({
  type: 'txt',
  msg: '大家好！',
  to: 'groupId',
  chatType: 'groupChat'
});
await uni.$chat.send(msg);
\`\`\`

## 成员管理

| 操作 | 方法 |
|------|------|
| 添加成员 | \`addGroupMembers\` |
| 移除成员 | \`removeGroupMembers\` |
| 设置管理员 | \`setGroupAdmin\` |
| 获取成员列表 | \`getGroupMembers\` |

群组功能更多细节请参考 [官方文档](https://docs-im.easemob.com)。`,
  },
  {
    id: 5,
    title: "服务端如何实现消息的离线推送回调？",
    author: "admin",
    date: "2025-06-22",
    tag: "Server",
    views: 1145,
    likes: 89,
    excerpt:
      "在断网或应用在后台时，确保消息不丢失的推送方案及回调处理细节，支持APNs和FCM双通道。",
    content: `在断网或应用在后台时，确保消息不丢失是 IM 产品的核心诉求。本文介绍推送方案及回调处理。

## 推送通道

环信支持以下推送通道：

- **APNs** - iOS 设备
- **FCM** - Android（Google 服务）
- **华为/小米/OPPO/vivo** - 国内 Android 设备

## 服务端回调配置

在控制台开启「消息回调」后，当推送发生时，环信会向你的服务端发送 HTTP 回调：

\`\`\`json
{
  "callId": "xxx",
  "eventType": "push",
  "timestamp": 1719100000000,
  "chat_type": "chat",
  "from": "user1",
  "to": "user2",
  "msg_id": "msg_xxx",
  "payload": {
    "bodies": [{ "type": "txt", "msg": "Hello" }]
  }
}
\`\`\`

## 服务端接收示例（Node.js）

\`\`\`javascript
app.post('/easemob/callback', (req, res) => {
  const { eventType, from, to, payload } = req.body;
  if (eventType === 'push') {
    // 记录推送日志 or 触发自定义业务逻辑
    console.log(\`推送: \${from} -> \${to}\`, payload);
  }
  res.json({ valid: true });
});
\`\`\`

> 回调接口需要在 **5 秒内** 返回 \`{ valid: true }\`，否则环信会重试最多 3 次。`,
  },
  {
    id: 6,
    title: "音视频通话卡顿常见原因排查",
    author: "技术支持_小王",
    date: "2025-06-21",
    tag: "Web",
    views: 2112,
    likes: 156,
    excerpt:
      "总结了10个导致音视频通话卡顿或延迟高的常见网络与设备原因，附赠排查工具与调优建议。",
    content: `本文总结了导致音视频通话卡顿或延迟高的 10 个常见原因，并提供排查工具与调优建。

## 常见原因

### 1. 网络带宽不足

音视频通话通常需要：
- 语音：≥ 50 kbps
- 标清视频：≥ 500 kbps
- 高清视频：≥ 1.5 Mbps

### 2. 高丢包率

丢包率超过 **5%** 会明显影响通话质量。

### 3. CPU 占用过高

\`\`\`javascript
// 获取 RTC 统计数据
const stats = await rtcClient.getLocalAudioStats();
console.log('发送丢包率:', stats.sendPacketsLost);
console.log('发送码率:', stats.sendBitrate);
\`\`\`

## 排查工具

| 工具 | 用途 |
|------|------|
| Chrome WebRTC-Internals | 查看实时 RTC 统计 |
| 环信控制台质量监控 | 查看通话质量报告 |
| Wireshark | 分析网络包 |

## 调优建议

- 启用 **自适应码率（ABR）** 让 SDK 根据网络动态调整质量
- 对弱网用户降级为纯语音模式
- 开启硬件加速编解码`,
  },
  {
    id: 7,
    title: "Android端消息已读回执的实现方案",
    author: "李明Dev",
    date: "2025-06-21",
    tag: "Android",
    views: 876,
    likes: 67,
    excerpt:
      "已读回执是提升IM用户体验的重要功能。本文介绍如何在Android端利用环信SDK实现单聊和群聊的已读回执。",
    content: `已读回执是提升 IM 用户体验的重要功能。本文介绍如何在 Android 端利用环信 SDK 实现已读回执。

## 单聊已读回执

### 发送读回执

\`\`\`java
// 当用户打开聊天页面时，发送已读回执
EMClient.getInstance().chatManager().ackMessageRead(
    targetUserId,  // 对方用户 ID
    messageId      // 消息 ID
);
\`\`\`

### 监听已读回执

\`\`\`java
EMClient.getInstance().chatManager().addMessageListener(new EMMessageListener() {
    @Override
    public void onMessageRead(List<EMMessage> messages) {
        for (EMMessage msg : messages) {
            // 刷新 UI，显示"已读"状态
            updateMessageReadStatus(msg.getMsgId());
        }
    }
});
\`\`\`

## 群聊已读回执

群聊已读回执需要手动请求：

\`\`\`java
// 获取群消息的已读成员列表
EMClient.getInstance().chatManager().asyncFetchGroupReadAcks(
    messageId,
    groupId,
    50,  // 每页数量
    null,
    new EMValueCallBack<EMCursorResult<EMGroupReadAck>>() {
        @Override
        public void onSuccess(EMCursorResult<EMGroupReadAck> result) {
            List<EMGroupReadAck> acks = result.getData();
            // 展示已读人数
        }
    }
);
\`\`\`

> **注意**：群聊已读回执默认关闭，需在控制台「功能配置」中开启，开启后会消耗额外的消息量。`,
  },
  {
    id: 8,
    title: "React Native集成环信IM完全指南",
    author: "码农小张",
    date: "2025-06-20",
    tag: "React Native",
    views: 1523,
    likes: 128,
    excerpt:
      "从零开始在React Native项目中集成环信IM SDK，包含消息收发、会话管理、推送通知等完整功能实现。",
    content: `从零开始在 React Native 项目中集成环信 IM SDK，包含消息收发、会话管理、推送通知等完整功能。

## 安装

\`\`\`bash
npm install react-native-easemob
cd ios && pod install
\`\`\`

## 初始化

\`\`\`typescript
import { ChatClient, ChatOptions } from 'react-native-easemob';

const initSDK = async () => {
  const options = new ChatOptions({
    appKey: 'your_appkey',
    autoLogin: false,
  });
  await ChatClient.getInstance().init(options);
};
\`\`\`

## 登录与消息监听

\`\`\`typescript
// 登录
await ChatClient.getInstance().loginWithToken('userId', 'token');

// 监听消息
ChatClient.getInstance().chatManager.addMessageListener({
  onMessagesReceived(messages) {
    messages.forEach(msg => {
      console.log('收到消息:', msg.body);
    });
  },
});
\`\`\`

## 推送配置（iOS）

在 \`AppDelegate.m\` 中注册推送：

\`\`\`objective-c
[EMClient.sharedClient application:application
  didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
\`\`\``,
  },
  {
    id: 9,
    title: "iOS端自定义消息气泡样式详解",
    author: "SwiftMaster",
    date: "2025-06-20",
    tag: "iOS",
    views: 945,
    likes: 73,
    excerpt:
      "通过自定义消息Cell实现个性化聊天气泡，支持圆角、渐变背景、阴影等多种视觉效果，含完整Swift代码。",
    content: `通过自定义消息 Cell 实现个性化聊天气泡，支持圆角、渐变背景、阴影等多种视觉效果。

## 创建自定义 Cell

\`\`\`swift
class CustomTextMessageCell: EaseTextMessageCell {

  override func setupBubbleView() {
    super.setupBubbleView()
    // 设置圆角
    bubbleView.layer.cornerRadius = 18
    // 渐变背景
    let gradient = CAGradientLayer()
    gradient.colors = [
      UIColor(hex: "#009EFF").cgColor,
      UIColor(hex: "#33B1FF").cgColor
    ]
    gradient.frame = bubbleView.bounds
    gradient.cornerRadius = 18
    bubbleView.layer.insertSublayer(gradient, at: 0)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    // 更新渐变尺寸
    if let gradient = bubbleView.layer.sublayers?.first as? CAGradientLayer {
      gradient.frame = bubbleView.bounds
    }
  }
}
\`\`\`

## 注册自定义 Cell

\`\`\`swift
EaseChatViewController.registerCustomCell(
  CustomTextMessageCell.self,
  forMessageType: .text,
  isSender: true
)
\`\`\`

## 效果对比

- 默认气泡：矩形，纯色背景
- 自定义气泡：圆角 18px，渐变蓝色，投影效果

> ��议在真机上测试渐变性能，避免层过多导致滚动卡顿。`,
  },
  {
    id: 10,
    title: "Uniapp中实现消息搜索与历史记录",
    author: "飞鹏",
    date: "2025-06-19",
    tag: "Uniapp",
    views: 367,
    likes: 29,
    excerpt:
      "消息搜索是IM应用的高频功能，本文讲解如何在Uniapp中实现关键词搜索、时间范围过滤和消息定位跳转。",
    content: `消息搜索是 IM 应用的高频功能，本文讲解如何在 Uniapp 中实现关键词搜索、时间范围过滤和消息定位跳转。

## 本地消息搜索

\`\`\`javascript
// 搜索关键词
const messages = await uni.$chat.searchMsgFromDB({
  keywords: '集成教程',
  timeStamp: Date.now(),
  maxCount: 20,
  from: '',   // 指定发送者，空字符串为全部
  msgTypes: ['txt']
});
\`\`\`

## 时间范围过滤

\`\`\`javascript
const startTime = new Date('2025-01-01').getTime();
const endTime = Date.now();

const messages = await uni.$chat.getHistoryMessages({
  targetId: 'conversationId',
  chatType: 'singleChat',
  startMsgId: '',
  count: 50,
  startTime,
  endTime
});
\`\`\`

## 消息定位跳转

获取到目标消息后，通过 \`scrollToMessage\` 滚动到对应位置：

\`\`\`javascript
// 在聊天页面组件中
this.$refs.chatList.scrollToMessage(targetMsgId);
\`\`\`

> 本��搜索仅限于已拉取到本地的消息。如需全量搜索，需调用服务端消息搜索 REST API。`,
  },
  {
    id: 11,
    title: "Server端REST API调用频率限制与最佳实践",
    author: "admin",
    date: "2025-06-19",
    tag: "Server",
    views: 2034,
    likes: 187,
    excerpt:
      "深入讲解环信REST API的QPS限制策略、错误码处理以及如何通过队列和缓存优化大规模消息发送场景。",
    content: `深入讲解环信 REST API 的 QPS 限制策略、错误码处理以及如何通过队列和缓存优化大规模消息发送场景。

## QPS 限制

环信 REST API 默认限制：

| 接口类型 | 默认 QPS |
|---------|---------| 
| 发送消息 | 100/秒 |
| 注册用户 | 30/秒 |
| 查询消息 | 50/秒 |

超出限制返回 \`429 Too Many Requests\`。

## 错误码处理

\`\`\`javascript
async function sendMessage(payload) {
  try {
    const res = await fetch('/messages/users', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + accessToken },
      body: JSON.stringify(payload)
    });
    if (res.status === 429) {
      // 等待后重试
      await sleep(1000);
      return sendMessage(payload);
    }
    return res.json();
  } catch (e) {
    console.error('发送失败', e);
  }
}
\`\`\`

## 队列削峰方案

\`\`\`javascript
import Bull from 'bull';

const msgQueue = new Bull('message-queue');

// 生产者：写入队列
msgQueue.add({ to: 'user1', msg: 'hello' });

// 消费者：限速消费
msgQueue.process(10, async (job) => {
  await sendMessage(job.data);
});
\`\`\`

使用消息队列可以有效避免突发流量触发限流，保证消息可靠投递。`,
  },
  {
    id: 12,
    title: "Web端实现消息表情回复(Reaction)功能",
    author: "前端_小李",
    date: "2025-06-18",
    tag: "Web",
    views: 734,
    likes: 58,
    excerpt:
      "参考Slack和飞书的Reaction功能，使用环信Web SDK实现消息表情回复，支持自定义表情包和动画效果。",
    content: `参考 Slack 和飞书的 Reaction 功能，使用环信 Web SDK 实现消息表情回复，支持自定义表情包和动画效果。

## 添加 Reaction

\`\`\`javascript
// 为消息添加 Reaction
await client.addReaction({
  messageId: 'msg_xxx',
  reaction: '👍'
});
\`\`\`

## 获取 Reaction 列表

\`\`\`javascript
const reactions = await client.getReactionList({
  messageId: 'msg_xxx',
  groupId: '',         // 群聊时传群 ID
  chatType: 'singleChat'
});

// 输出示例
// [{ reaction: '👍', count: 5, isAddedBySelf: true }]
\`\`\`

## 监听 Reaction 变化

\`\`\`javascript
client.addEventHandler('reaction', {
  onReactionChange(reactionList) {
    reactionList.forEach(({ messageId, reactions }) => {
      updateReactionUI(messageId, reactions);
    });
  }
});
\`\`\`

## 自定义表情动画

使用 CSS \`@keyframes\` 为 Reaction 气泡添加弹跳动画：

\`\`\`css
@keyframes reactionPop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
.reaction-badge {
  animation: reactionPop 0.25s ease-out;
}
\`\`\``,
  },
  {
    id: 13,
    title: "Android多设备登录与消息同步方案",
    author: "李明Dev",
    date: "2025-06-18",
    tag: "Android",
    views: 612,
    likes: 45,
    excerpt:
      "讲解如何实现多端登录策略配置、消息漫游同步以及设备管理功能，确保跨设备的一致用户体验。",
    content: `讲解如何实现多端登录策略配置、消息漫游同步以及设备管理功能，确保跨设备的一致用户体验。

## 多设备登录策略

在控制台配置策略：
- **单设备**：新设备登录后踢出旧设备
- **多设备**（推荐）：最多同时 4 台设备在线

## 监听多设备事件

\`\`\`java
EMClient.getInstance().addMultiDeviceListener(new EMMultiDeviceListener() {
    @Override
    public void onContactEvent(int event, String target, String ext) {
        // 处理联系人跨设备事件
    }

    @Override
    public void onGroupEvent(int event, String groupId, List<String> usernames) {
        // 处理群组跨设备事件
    }

    @Override
    public void onMessageSyncEvent(String messageId) {
        // 消息在其他设备已发送，本设备同步
        refreshConversationList();
    }
});
\`\`\`

## 消息漫游拉取

\`\`\`java
// 从服务器拉取历史消息（漫游）
EMClient.getInstance().chatManager().asyncFetchHistoryMessages(
    targetUserId,
    EMConversation.EMConversationType.Chat,
    50,
    null,   // 从最新消息开始
    new EMValueCallBack<EMCursorResult<EMMessage>>() {
        @Override
        public void onSuccess(EMCursorResult<EMMessage> result) {
            // 合并到本地会话
        }
    }
);
\`\`\``,
  },
  {
    id: 14,
    title: "iOS端集成CallKit实现VoIP通话",
    author: "SwiftMaster",
    date: "2025-06-17",
    tag: "iOS",
    views: 1289,
    likes: 102,
    excerpt:
      "将环信音视频SDK与Apple CallKit框架深度整合，实现来电界面、锁屏接听等原生通话体验。",
    content: `将环信音视频 SDK 与 Apple CallKit 框架深度整合，实现来电界面、锁屏接听等原生通话体验。

## 添加 CallKit 权限

在 \`Info.plist\` 中添加：

\`\`\`xml
<key>NSMicrophoneUsageDescription</key>
<string>需要麦克风权限以进行语音通话</string>
<key>NSCameraUsageDescription</key>
<string>需要摄像头权限以进行视频通话</string>
\`\`\`

## 配置 CallKit Provider

\`\`\`swift
import CallKit

class CallManager: NSObject, CXProviderDelegate {

  let provider: CXProvider
  let callController = CXCallController()

  override init() {
    let config = CXProviderConfiguration()
    config.supportsVideo = true
    config.maximumCallsPerCallGroup = 1
    config.supportedHandleTypes = [.generic]
    provider = CXProvider(configuration: config)
    super.init()
    provider.setDelegate(self, queue: nil)
  }

  func reportIncomingCall(uuid: UUID, handle: String) {
    let update = CXCallUpdate()
    update.remoteHandle = CXHandle(type: .generic, value: handle)
    update.hasVideo = true
    provider.reportNewIncomingCall(with: uuid, update: update) { error in
      print(error ?? "来电上报成功")
    }
  }
}
\`\`\`

## 接听与挂断

\`\`\`swift
func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
  // 接听：启动环信 RTC 通话
  EaseCallManager.shared().answerCall()
  action.fulfill()
}

func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
  EaseCallManager.shared().endCall()
  action.fulfill()
}
\`\`\``,
  },
  {
    id: 15,
    title: "使用环信超级社区构建Discord风格应用",
    author: "技术支持_小王",
    date: "2025-06-17",
    tag: "Web",
    views: 1876,
    likes: 143,
    excerpt:
      "基于环信超级社区（Circle）SDK，从零构建一个支持频道、话题、角色权限的社区应用，附完整源码。",
    content: `基于环信超级社区（Circle）SDK，从零构建一个支持频道、话题、角色权限的社区应用。

## 什么是超级社区

环信超级社区（Circle）是一个类 Discord 的社区产品，支持：
- **Server**（服务器）：顶层组织单位
- **Channel**（频道）：文字、语音、公告频道
- **Thread**（话题）：频道内的子话题讨论
- **角色权限**：灵活的成员权限配置

## 创建 Server

\`\`\`javascript
const server = await client.createServer({
  name: '环信开发者社区',
  description: '环信开发者交流与分享',
  icon: 'https://example.com/icon.png'
});
\`\`\`

## 创建频道

\`\`\`javascript
const channel = await client.createChannel({
  serverId: server.serverId,
  name: '技术讨论',
  description: '技术问题交流',
  channelType: 0  // 0=公开频道, 1=私密频道
});
\`\`\`

## 发送消息到频道

\`\`\`javascript
const msg = WebIM.message.create({
  type: 'txt',
  msg: '欢迎来到技术讨论频道！',
  to: channel.channelId,
  chatType: 'groupChat',
  ext: { channelId: channel.channelId }
});
await client.send(msg);
\`\`\`

> 超级社区目前处于开放 Beta 阶段，接口可能随版本更新有所调整，建议锁定 SDK 版本。`,
  },
  {
    id: 16,
    title: "React Native端离线消息处理与本地缓存",
    author: "码农小张",
    date: "2025-06-16",
    tag: "React Native",
    views: 523,
    likes: 41,
    excerpt:
      "解决React Native应用在弱网和离线场景下的消息可靠性问题，包含SQLite本地存储和增量同步方案。",
    content: `解决 React Native 应用在弱网和离线场景下的消息可靠性问题，包含 SQLite 本地存储和增量同步方案。

## 离线消息缓存策略

环信 RN SDK 内置了本地消息存储，无需额外配置即可在断网时读取历史消息。

## 本地消息读取

\`\`\`typescript
import { ChatClient } from 'react-native-easemob';

// 获取本地会话消息（不请求服务器）
const messages = await ChatClient.getInstance()
  .chatManager
  .getMessages(
    conversationId,
    'singleChat',
    { startMsgId: '', count: 20 }
  );
\`\`\`

## 网络恢复后的增量同步

\`\`\`typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    // 重新连接 SDK
    ChatClient.getInstance().connect();
    // 拉取离线期间的漫游消息
    syncOfflineMessages();
  }
});

async function syncOfflineMessages() {
  const result = await ChatClient.getInstance()
    .chatManager
    .fetchHistoryMessages(conversationId, 'singleChat', {
      startMsgId: lastLocalMsgId,
      count: 50
    });
  // 合并到本地数据库
  mergeMessages(result.list);
}
\`\`\`

## SQLite 扩展存储

当需要存储消息附件或自定义业务数据时，可结合 \`react-native-sqlite-storage\` 实现扩展缓存，与 SDK 内置存储互补使用。`,
  },
];

// ── 视频教程 ────────────────────────────────────────────────────
export const VIDEOS = [
  {
    id: 1,
    title: "【环信IM Uniapp SDK集成教程】第6期: 群组篇",
    author: "飞鹏",
    views: 8,
    likes: 12,
    date: "2025-06-23",
    duration: "12:45",
    category: "群组篇",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 2,
    title: "当前社交产品的痛点分析",
    author: "飞鹏",
    views: 5,
    likes: 3,
    date: "2025-06-23",
    duration: "08:30",
    category: "AI篇",
    thumbnail:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 3,
    title: "AI驱动的痛点解决方案(C端)",
    author: "飞鹏",
    views: 3,
    likes: 1,
    date: "2025-06-23",
    duration: "15:20",
    category: "AI篇",
    thumbnail:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 4,
    title: "打造千人千面专属对话",
    author: "飞鹏",
    views: 2,
    likes: 0,
    date: "2025-06-23",
    duration: "21:10",
    category: "AI篇",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 5,
    title: "Web SDK 快速入门与环境搭建",
    author: "飞鹏",
    views: 12,
    likes: 8,
    date: "2025-06-22",
    duration: "10:15",
    category: "基础篇",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 6,
    title: "RTC 音视频通话性能优化实战",
    author: "zhangdong1",
    views: 24,
    likes: 16,
    date: "2025-06-21",
    duration: "18:40",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 7,
    title: "Server 端消息回调与业务集成",
    author: "admin",
    views: 19,
    likes: 14,
    date: "2025-06-20",
    duration: "24:00",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 8,
    title: "Flutter SDK 在混合开发中的应用",
    author: "飞鹏",
    views: 31,
    likes: 22,
    date: "2025-06-19",
    duration: "14:50",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1617042375876-a13e36732a04?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 9,
    title: "如何处理大规模离线消息推送",
    author: "zhangdong1",
    views: 45,
    likes: 38,
    date: "2025-06-18",
    duration: "20:30",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 10,
    title: "智能客服机器人的多轮对话配置",
    author: "飞鹏",
    views: 16,
    likes: 9,
    date: "2025-06-17",
    duration: "11:20",
    category: "AI篇",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 11,
    title: "多端消息漫游与数据同步原理",
    author: "admin",
    views: 28,
    likes: 20,
    date: "2025-06-16",
    duration: "16:45",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=350",
  },
  {
    id: 12,
    title: "应用生命周期管理与保活策略",
    author: "技术支持_小王",
    views: 33,
    likes: 27,
    date: "2025-06-15",
    duration: "13:10",
    category: "进阶篇",
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600&h=350",
  },
];

// ── 开源项目 ────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: 1,
    name: "ChatUI-React",
    description:
      "一套基于 React 的即时通讯 UI 组件库，包含会话列表、聊天窗口、联系人等常用组件，帮助开发者快速搭建聊天界面。",
    language: "TypeScript",
    views: 3840,
    likes: 312,
    tags: ["React", "UI Kit", "IM"],
    repo: "easemob/chatui-react",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=ChatUI-React&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
  {
    id: 2,
    name: "EaseMob-iOS-UI",
    description:
      "环信官方提供的 iOS 端开源 UI 库，纯 Swift 实现，支持高度定制化，开箱即用。",
    language: "Swift",
    views: 2156,
    likes: 187,
    tags: ["iOS", "Swift", "Chat"],
    repo: "easemob/easemob-iOS-ui",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=EaseMob-iOS-UI&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
  {
    id: 3,
    name: "WebIM-Vue-Demo",
    description:
      "基于 Vue3 + Vite + 环信 Web SDK 编写的单页面聊天应用 Demo，展示了如何处理连接、收发消息及离线存储。",
    language: "Vue",
    views: 1478,
    likes: 103,
    tags: ["Vue3", "Vite", "Demo"],
    repo: "easemob/webim-vue-demo",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=WebIM-Vue-Demo&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
  {
    id: 4,
    name: "React-Native-Chat-App",
    description:
      "跨平台移动端即时通讯解决方案，包含完整的注册登录、单聊、群聊、音视频通话逻辑。",
    language: "TypeScript",
    views: 4231,
    likes: 389,
    tags: ["React Native", "Cross-Platform"],
    repo: "easemob/rn-chat-app",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=React-Native-Chat-App&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
  {
    id: 5,
    name: "Flutter-IM-Plugin",
    description:
      "环信 IM 的 Flutter 插件，对底层原生 SDK 进行了封装，提供简单易用的 Dart API。",
    language: "Dart",
    views: 1892,
    likes: 145,
    tags: ["Flutter", "Plugin"],
    repo: "easemob/flutter-im-plugin",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=Flutter-IM-Plugin&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
  {
    id: 6,
    name: "Server-SDK-Nodejs",
    description:
      "用于 Node.js 环信服务端 SDK，方便开发者在后端进行用户管理、消息发送及群组操作。",
    language: "JavaScript",
    views: 967,
    likes: 78,
    tags: ["Node.js", "Server", "SDK"],
    repo: "easemob/server-sdk-nodejs",
    iconUrl:
      "https://api.dicebear.com/7.x/shapes/svg?seed=Server-SDK-Nodejs&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899",
  },
];