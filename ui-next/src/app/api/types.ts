/**
 * @file types.ts
 * @description 全站数据类型定义。
 * 所有管理接口的入参（UploadPayload）和返回值均基于此文件中的类型。
 * 研发人员对接后端时，确保接口返回结构与此一致即可。
 */

// ─────────────────────────────────────────────────────────────────────────────
// 通用
// ─────────────────────────────────────────────────────────────────────────────

/** 通用接口响应包装 */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  /** 错误信息（success=false 时存在） */
  error?: string;
}

/** 文章/视频分类标签 */
export type ArticleTag = string;

/** 视频教程分类 */
export type VideoCategory = "基础篇" | "进阶篇" | "群组篇" | "AI篇";

/** 首页广告位编号（目前共 2 个位置） */
export type BannerSlot = 1 | 2;

// ─────────────────────────────────────────────────────────────────────────────
// 文章
// ─────────────────────────────────────────────────────────────────────────────

/** 文章完整数据结构（与 siteData.ts 中 ARTICLES 项对齐） */
export interface Article {
  id: number;
  title: string;
  author: string;
  date: string;          // ISO 8601，例如 "2025-06-23"
  tag: ArticleTag;
  views: number;
  likes: number;
  excerpt: string;       // 列表页摘要，建议 ≤ 120 字
  content: string;       // 正文，支持 Markdown
  coverUrl?: string;     // 可选封面图 URL
}

/** 新建/编辑文章时提交的字段（id 由后端生成） */
export interface ArticleUploadPayload {
  title: string;
  author: string;
  date: string;
  tag: ArticleTag;
  excerpt: string;
  content: string;
  coverUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 视频教程
// ─────────────────────────────────────────────────────────────────────────────

/** 视频完整数据结构（与 siteData.ts 中 VIDEOS 项对齐） */
export interface Video {
  id: number;
  title: string;
  author: string;
  date: string;
  duration: string;      // 格式 "MM:SS"，例如 "12:45"
  category: VideoCategory;
  views: number;
  likes: number;
  thumbnail: string;     // 封面图 URL
  videoUrl: string;      // 视频播放地址（流媒体/OSS 地址）
  description: string;   // 详情页简介
}

/** 新建/编辑视频时提交的字段 */
export interface VideoUploadPayload {
  title: string;
  author: string;
  date: string;
  duration: string;
  category: VideoCategory;
  /** 封面图：可以是已上传后的 URL，也可以是 File 对象（由 uploadFile 处理后填入） */
  thumbnail: string;
  /** 视频文件地址：同上，File 对象由 uploadFile 处理 */
  videoUrl: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 开源项目
// ─────────────────────────────────────────────────────────────────────────────

/** 开源项目完整数据结构（与 siteData.ts 中 PROJECTS 项对齐） */
export interface Project {
  id: number;
  name: string;
  description: string;
  language: string;      // 主编程语言，例如 "TypeScript"
  stars: number;
  forks: number;
  tags: string[];        // 技术标签数组，例如 ["React", "UI Kit"]
  repo: string;          // 仓库路径，例如 "easemob/chatui-react"
  iconUrl: string;       // 项目图标 URL
}

/** 新建/编辑开源项目时提交的字段（分字段上传，逐项填写） */
export interface ProjectUploadPayload {
  /** 项目名称 */
  name: string;
  /** 项目简介 */
  description: string;
  /** 主编程语言 */
  language: string;
  /** GitHub Stars 数（初始值，后续可由同步任务更新） */
  stars: number;
  /** GitHub Forks 数 */
  forks: number;
  /** 技术标签，逗号分隔字符串或字符串数组，接口层统一转为 string[] */
  tags: string[];
  /** 仓库路径，格式 "org/repo" */
  repo: string;
  /** 项目图标 URL（可由 uploadFile 上传后填入） */
  iconUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 首页广告横幅
// ─────────────────────────────────────────────────────────────────────────────

/** 广告横幅数据结构 */
export interface Banner {
  slot: BannerSlot;       // 广告位编号
  imageUrl: string;       // 背景图 URL
  label: string;          // 左上角小标签文字，例如 "推荐活动"
  title: string;          // 主标题
  linkUrl?: string;       // 点击跳转地址（可选）
  /** 是否启用，false 时前端不渲染该广告位 */
  enabled: boolean;
}

/** 修改广告横幅时提交的字段 */
export interface BannerUploadPayload {
  slot: BannerSlot;
  imageUrl: string;
  label: string;
  title: string;
  linkUrl?: string;
  enabled?: boolean;      // 默认 true
}

// ─────────────────────────────────────────────────────────────────────────────
// 文件上传
// ─────────────────────────────────────────────────────────────────────────────

/** uploadFile 的资源类型（用于后端选择存储桶/路径） */
export type UploadAssetType =
  | "article-cover"     // 文章封面图
  | "video-thumbnail"   // 视频封面图
  | "video-file"        // 视频文件
  | "project-icon"      // 项目图标
  | "banner-image";     // 广告横幅背景图

/** 文件上传成功后的返回结构 */
export interface UploadedFile {
  /** 可公开访问的文件 URL，填入对应 Payload 的 imageUrl / thumbnail 等字段 */
  url: string;
  /** 后端存储的文件路径（用于后续删除/替换） */
  path: string;
}
