# 前端开发指南

## 🚀 快速开始

### 1. 启动开发服务器

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start
```

开发服务器将在 `http://localhost:3000` 启动，支持热重载。

## 🛠️ 开发环境配置

### 方法一：使用Mock数据 (推荐)

已在 `src/mocks/data.ts` 中准备了Mock数据，包括：

- 问题列表 (`mockQuestions`)
- 视频列表 (`mockVideos`)
- 标签列表 (`mockTags`)
- 用户信息 (`mockUsers`)
- 站点信息 (`mockSiteInfo`)

**使用方式：**

```typescript
// 在组件中导入mock数据
import { mockVideos } from '@/mocks/data';

// 在useEffect中模拟API调用
useEffect(() => {
  // 模拟异步数据获取
  const fetchData = async () => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    setData(mockVideos);
  };
  fetchData();
}, []);
```

### 方法二：Mock API服务器

如果需要完整的API Mock服务，可以使用以下工具：

#### 使用json-server

```bash
# 安装json-server
npm install -g json-server

# 创建db.json文件（参考mock数据结构）
# 启动mock服务器
json-server --watch db.json --port 3001
```

#### 使用MSW (Mock Service Worker)

```bash
# 安装MSW
npm install msw --save-dev

# 设置MSW
npx msw init public/ --save
```

### 方法三：代理到现有后端

如果有可用的后端服务，在 `package.json` 中添加代理配置：

```json
{
  "proxy": "http://localhost:8080"
}
```

或者在 `config-overrides.js` 中配置：

```javascript
const { override, addWebpackPlugin } = require('customize-cra');

module.exports = override(
  // 添加代理配置
  (config) => {
    config.devServer = {
      ...config.devServer,
      proxy: {
        '/answer/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    };
    return config;
  },
);
```

## 📱 图标使用指南

项目使用 **Bootstrap Icons**：

### 常用图标：

- `play-circle-fill` - 播放按钮 (视频页面使用)
- `question-circle-fill` - 问题图标
- `tags-fill` - 标签图标
- `people-fill` - 用户图标
- `award-fill` - 徽章图标
- `gear-fill` - 设置图标

### 查看所有图标：

- 官网：https://icons.getbootstrap.com/
- 搜索相关关键词
- 在代码中搜索：`grep -r "name=" ui/src/components --include="*.tsx"`

## 🔧 开发技巧

### 1. 环境变量

```bash
# 开发环境
NODE_ENV=development

# API地址配置
REACT_APP_API_URL=http://localhost:3001
```

### 2. 调试技巧

```typescript
// 开发环境下的调试信息
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 3. 条件渲染

```typescript
// 根据环境显示不同内容
{process.env.NODE_ENV === 'development' && (
  <div className="alert alert-info">
    开发模式 - 使用Mock数据
  </div>
)}
```

## 📄 项目结构

```
ui/src/
├── components/          # 通用组件
├── pages/              # 页面组件
│   ├── Questions/      # 问题页面
│   ├── Video/          # 视频页面
│   └── ...
├── router/             # 路由配置
├── services/           # API服务
├── mocks/              # Mock数据
├── hooks/              # 自定义Hooks
├── stores/             # 状态管理
└── utils/              # 工具函数
```

## 🎯 常见问题

### Q: API请求失败怎么办？

A:

1. 检查开发服务器是否正常运行
2. 使用Mock数据进行开发
3. 配置代理或CORS

### Q: 如何添加新页面？

A:

1. 在 `pages/` 下创建页面组件
2. 在 `router/routes.ts` 中添加路由配置
3. 在 `SideNav` 组件中添加导航链接
4. 添加相应的国际化翻译

### Q: 如何自定义主题？

A: 修改 `src/styles/` 中的样式文件，项目使用Bootstrap 5。

## 🚀 部署

### 构建生产版本：

```bash
pnpm build
```

### 预览构建结果：

```bash
# 使用serve工具预览
npx serve -s build -l 3000
```

---

Happy Coding! 🎉
