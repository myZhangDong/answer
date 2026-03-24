/**
 * @file adminApi.ts
 * @description 超级管理员内容上传接口层（服务桩 / Stub）。
 *
 * 【研发对接说明】
 * 1. 将每个函数体中的 TODO 注释替换为真实的 HTTP 请求（fetch / axios）或
 *    Supabase 客户端调用。
 * 2. 所有函数签名、入参类型、返回类型均已锁定，前端调用方无需修改。
 * 3. 文件上传统一走 `uploadFile`，获得 URL 后再填入对应 Payload。
 * 4. 认证 Token 建议统一在此文件的 `getAuthHeaders()` 中注入。
 *
 * 覆盖范围：
 *   - 文章   : createArticle / updateArticle / deleteArticle
 *   - 视频   : createVideo / updateVideo / deleteVideo
 *   - 开源项目: createProject / updateProject / deleteProject
 *   - 首页广告: getBanners / updateBanner
 *   - 文件上传: uploadFile
 */

import type {
  ApiResponse,
  Article,
  ArticleUploadPayload,
  Banner,
  BannerSlot,
  BannerUploadPayload,
  Project,
  ProjectUploadPayload,
  UploadAssetType,
  UploadedFile,
  Video,
  VideoUploadPayload,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// 配置区（研发填写）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 后端 API 基础地址。
 * 生产环境建议通过环境变量注入：import.meta.env.VITE_API_BASE_URL
 */
const API_BASE_URL = "https://your-api-base-url.example.com"; // TODO: 替换为真实地址

/**
 * 获取认证请求头。
 * 对接时替换为从 localStorage / Cookie / 状态管理中读取的 JWT Token。
 */
function getAuthHeaders(): HeadersInit {
  const token = ""; // TODO: 从认证系统获取 Token，例如 localStorage.getItem("admin_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 辅助：统一请求封装
// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // TODO: 替换为真实 fetch 调用
  // 示例：
  // const res = await fetch(`${API_BASE_URL}${path}`, {
  //   ...options,
  //   headers: { ...getAuthHeaders(), ...options.headers },
  // });
  // if (!res.ok) return { success: false, error: await res.text() };
  // return { success: true, data: await res.json() };

  console.warn("[adminApi] Stub called:", options.method ?? "GET", path);
  return { success: false, error: "接口未实现，请研发对接后端后替换此 stub。" };
}

// ─────────────────────────────────────────────────────────────────────────────
// 文件上传
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 上传文件到后端存储（OSS / Supabase Storage 等）。
 *
 * @param file      - 原始 File 对象（来自 <input type="file"> 或拖拽）
 * @param assetType - 资源类型，后端据此选择存储桶或路径前缀
 * @returns         UploadedFile.url 即可直接填入各 Payload 的图片/视频字段
 *
 * @example
 * const { data } = await uploadFile(file, "article-cover");
 * payload.coverUrl = data?.url;
 */
export async function uploadFile(
  file: File,
  assetType: UploadAssetType
): Promise<ApiResponse<UploadedFile>> {
  // TODO: 构造 FormData 并 POST 到文件上传端点
  // 示例（Supabase Storage）：
  // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // const ext = file.name.split(".").pop();
  // const filePath = `${assetType}/${Date.now()}.${ext}`;
  // const { error } = await supabase.storage.from("community-assets").upload(filePath, file);
  // if (error) return { success: false, error: error.message };
  // const { data } = supabase.storage.from("community-assets").getPublicUrl(filePath);
  // return { success: true, data: { url: data.publicUrl, path: filePath } };

  // 示例（自建后端）：
  // const form = new FormData();
  // form.append("file", file);
  // form.append("assetType", assetType);
  // const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: form,
  //   headers: { Authorization: `Bearer ${token}` } });
  // return res.json();

  console.warn("[adminApi] uploadFile stub:", { name: file.name, assetType });
  return { success: false, error: "uploadFile 未实现" };
}

// ─────────────────────────────────────────────────────────────────────────────
// 文章管理
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 新建文章。
 * 后端应返回含 id（服务端生成）的完整 Article 对象。
 *
 * POST /admin/articles
 *
 * @example
 * const res = await createArticle({
 *   title: "怎样集成Web SDK",
 *   author: "zhangdong1",
 *   date: "2025-06-23",
 *   tag: "Web",
 *   excerpt: "...",
 *   content: "# 标题\n正文 Markdown...",
 * });
 */
export async function createArticle(
  payload: ArticleUploadPayload
): Promise<ApiResponse<Article>> {
  // TODO: POST /admin/articles
  return request<Article>("/admin/articles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 编辑已有文章（全量更新）。
 *
 * PUT /admin/articles/:id
 */
export async function updateArticle(
  id: number,
  payload: Partial<ArticleUploadPayload>
): Promise<ApiResponse<Article>> {
  // TODO: PUT /admin/articles/:id
  return request<Article>(`/admin/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 删除文章。
 *
 * DELETE /admin/articles/:id
 */
export async function deleteArticle(id: number): Promise<ApiResponse> {
  // TODO: DELETE /admin/articles/:id
  return request(`/admin/articles/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 视频教程管理
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 新建视频教程（含详情字段）。
 *
 * POST /admin/videos
 *
 * 建议上传流程：
 *   1. 先调用 uploadFile(thumbnailFile, "video-thumbnail") → 得到 thumbnailUrl
 *   2. 再调用 uploadFile(videoFile, "video-file")          → 得到 videoUrl
 *   3. 将两个 URL 填入 payload 后调用 createVideo
 *
 * @example
 * const { data: thumb } = await uploadFile(thumbnailFile, "video-thumbnail");
 * const { data: vid }   = await uploadFile(videoFile, "video-file");
 * await createVideo({ ...fields, thumbnail: thumb.url, videoUrl: vid.url });
 */
export async function createVideo(
  payload: VideoUploadPayload
): Promise<ApiResponse<Video>> {
  // TODO: POST /admin/videos
  return request<Video>("/admin/videos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 编辑视频（含详情字段，支持只更新部分字段）。
 *
 * PUT /admin/videos/:id
 */
export async function updateVideo(
  id: number,
  payload: Partial<VideoUploadPayload>
): Promise<ApiResponse<Video>> {
  // TODO: PUT /admin/videos/:id
  return request<Video>(`/admin/videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 删除视频。
 *
 * DELETE /admin/videos/:id
 */
export async function deleteVideo(id: number): Promise<ApiResponse> {
  // TODO: DELETE /admin/videos/:id
  return request(`/admin/videos/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 开源项目管理
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 新建开源项目（分字段上传）。
 *
 * POST /admin/projects
 *
 * 字段说明见 ProjectUploadPayload（types.ts），每个字段均独立填写。
 *
 * @example
 * await createProject({
 *   name: "ChatUI-React",
 *   description: "一套基于 React 的 IM UI 组件库...",
 *   language: "TypeScript",
 *   stars: 1245,
 *   forks: 342,
 *   tags: ["React", "UI Kit", "IM"],
 *   repo: "easemob/chatui-react",
 *   iconUrl: "https://...",
 * });
 */
export async function createProject(
  payload: ProjectUploadPayload
): Promise<ApiResponse<Project>> {
  // TODO: POST /admin/projects
  return request<Project>("/admin/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 编辑开源项目（支持只更新部分字段，例如单独更新 stars/forks）。
 *
 * PUT /admin/projects/:id
 */
export async function updateProject(
  id: number,
  payload: Partial<ProjectUploadPayload>
): Promise<ApiResponse<Project>> {
  // TODO: PUT /admin/projects/:id
  return request<Project>(`/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 删除开源项目。
 *
 * DELETE /admin/projects/:id
 */
export async function deleteProject(id: number): Promise<ApiResponse> {
  // TODO: DELETE /admin/projects/:id
  return request(`/admin/projects/${id}`, { method: "DELETE" });
}

// ──────────────────────────────────────────────────���──────────────────────────
// 首页广告横幅管理
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 获取所有广告横幅配置（共 2 个广告位）。
 *
 * GET /admin/banners
 *
 * 前端渲染时可在页面初始化时调用，替换 Home.tsx 中的硬编码广告数据。
 */
export async function getBanners(): Promise<ApiResponse<Banner[]>> {
  // TODO: GET /admin/banners
  return request<Banner[]>("/admin/banners", { method: "GET" });
}

/**
 * 更新指定广告位（slot=1 或 slot=2）。
 *
 * PUT /admin/banners/:slot
 *
 * 建议上传流程：
 *   1. 先调用 uploadFile(imageFile, "banner-image") → 得到 imageUrl
 *   2. 将 imageUrl 填入 payload.imageUrl 后调用 updateBanner
 *
 * @param slot    - 广告位编号（1 = 首页侧边栏顶部，2 = 视频页侧边栏顶部，可扩展）
 * @param payload - 广告横幅全部字段（见 BannerUploadPayload）
 *
 * @example
 * const { data: img } = await uploadFile(imageFile, "banner-image");
 * await updateBanner(1, {
 *   slot: 1,
 *   imageUrl: img.url,
 *   label: "推荐活动",
 *   title: "2025 RTE 开发者大会 · 立即报名",
 *   linkUrl: "https://rte.io/2025",
 *   enabled: true,
 * });
 */
export async function updateBanner(
  slot: BannerSlot,
  payload: BannerUploadPayload
): Promise<ApiResponse<Banner>> {
  // TODO: PUT /admin/banners/:slot
  return request<Banner>(`/admin/banners/${slot}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 启用 / 禁用某个广告位（快捷接口，不需要传完整字段）。
 *
 * PATCH /admin/banners/:slot/toggle
 */
export async function toggleBanner(
  slot: BannerSlot,
  enabled: boolean
): Promise<ApiResponse<Banner>> {
  // TODO: PATCH /admin/banners/:slot/toggle
  return request<Banner>(`/admin/banners/${slot}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}
