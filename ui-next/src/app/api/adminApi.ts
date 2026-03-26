/**
 * @file adminApi.ts
 * @description 超级管理员内容上传接口层（服务桩 / Stub）。
 *
 * 【研发对接说明】
 * 1. 将每个函数体中的 TODO 注释替换为真实的 HTTP 请求。
 * 2. 所有函数签名、入参类型、返回类型均已锁定，前端调用方无需修改。
 * 3. 文件上传统一走 `uploadFile`，获得 URL 后再填入对应 Payload。
 * 4. 认证继续复用现有后端 Cookie / Session，会话由统一请求层自动携带。
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
  ArticleUploadPayload,
  Banner,
  BannerSlot,
  BannerUploadPayload,
  UploadAssetType,
  UploadedFile,
} from "./types";
import { apiRequest } from "./client";

export interface AdminTagOption {
  slug_name: string;
  display_name: string;
  recommend?: boolean;
  reserved?: boolean;
}

export interface AdminArticleSummary {
  id: string;
  urlTitle: string;
  title: string;
  author: string;
  date: string;
  tag: string;
  excerpt: string;
  views: number;
  likes: number;
}

export interface AdminArticleDetail extends AdminArticleSummary {
  content: string;
  html: string;
  tags: AdminTagOption[];
}

export interface AdminArticleListResult {
  count: number;
  list: AdminArticleSummary[];
}

export interface ArticleWriteResult {
  id: string;
  urlTitle: string;
  waitForReview: boolean;
}

export interface AdminVideoSummary {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  duration: string;
  views: number;
  cover: string;
  description: string;
  isRecommend: boolean;
  isShow: boolean;
}

export interface AdminVideoDetail extends AdminVideoSummary {
  content: string;
  authorAvatar: string;
  authorIntro: string;
  externalLink: string;
  embedCode: string;
  durationSeconds: number;
}

export interface AdminVideoListResult {
  count: number;
  list: AdminVideoSummary[];
}

export interface VideoWritePayload {
  title: string;
  category: string;
  cover: string;
  isRecommend: boolean;
  isShow: boolean;
  duration: number;
  description: string;
  content: string;
  authorAvatar: string;
  authorName: string;
  authorIntro: string;
  embedCode: string;
  externalLink: string;
}

export interface VideoWriteResult {
  id: string;
}

export interface AdminProjectSummary {
  id: string;
  title: string;
  description: string;
  codeType: number;
  codeTypeName: string;
  tags: string[];
  repo: string;
  cover: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface AdminProjectDetail extends AdminProjectSummary {
  content: string;
  repoUrlMap: Record<string, string>;
  questionId: string;
}

export interface AdminProjectListResult {
  count: number;
  list: AdminProjectSummary[];
}

export interface ProjectWritePayload {
  title: string;
  description: string;
  cover: string;
  content: string;
  repoUrlMap: Record<string, string>;
  codeType: number;
  tags: string[];
  questionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 说明
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 当前 `ui-next` 后台请求层已复用 `apiRequest`：
 * - 自动处理 `VITE_API_BASE_URL`
 * - 自动附带 `credentials: "include"`
 * - 默认按现有后端 `/answer/api/v1/*` 返回结构解析
 */

// ─────────────────────────────────────────────────────────────────────────────
// 辅助：统一请求封装
// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const data = await apiRequest<T>(path, options);
    return { success: true, data };
  } catch (error) {
    console.warn("[adminApi] Request failed:", options.method ?? "GET", path, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "接口未实现，请研发对接后端后替换此逻辑。",
    };
  }
}

function normalizeTagSlug(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

function findTagOption(tag: string, options: AdminTagOption[]) {
  const normalized = normalizeTagSlug(tag);
  return options.find((item) => {
    return item.slug_name === normalized || item.display_name.toLowerCase() === tag.trim().toLowerCase();
  });
}

interface BackendQuestionWriteResp {
  id: string;
  url_title: string;
  wait_for_review?: boolean;
}

interface BackendPaged<T> {
  count: number;
  list: T[];
}

interface BackendUserInfo {
  username?: string;
  display_name?: string;
}

interface BackendQuestionTag {
  slug_name: string;
  display_name: string;
  recommend?: boolean;
  reserved?: boolean;
}

interface BackendQuestionInfo {
  id: string;
  url_title: string;
  title: string;
  content?: string;
  html?: string;
  description?: string;
  tags?: BackendQuestionTag[];
  view_count?: number;
  vote_count?: number;
  create_time?: number | string;
  created_at?: number | string;
  user_info?: BackendUserInfo;
}

interface BackendVideoInfo {
  id: string;
  title: string;
  is_recommend?: boolean;
  is_show?: boolean;
  cover?: string;
  description?: string;
  content?: string;
  author_avatar?: string;
  author_name?: string;
  author_intro?: string;
  external_link?: string;
  code?: string;
  duration?: number;
  type?: string;
  datetime?: number | string;
  view_count?: number;
  created_at?: number | string;
  updated_at?: number | string;
}

interface BackendVideoWriteResp {
  id: string;
}

interface BackendProjectInfo {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  content?: string;
  repo_url?: Record<string, string>;
  code_type?: number;
  code_type_name?: string;
  tags?: string[];
  question_id?: string;
  view_count?: number;
  vote_count?: number;
  created_at?: number | string;
  updated_at?: number | string;
}

function formatDate(value?: number | string) {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const numeric =
    typeof value === "number"
      ? value
      : /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isNaN(numeric)) {
    const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function excerptFromText(value = "", maxLength = 120) {
  const text = stripHtml(value);
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

function getAuthor(user?: BackendUserInfo) {
  return user?.display_name || user?.username || "管理员";
}

function getPrimaryTag(tags?: BackendQuestionTag[]) {
  return tags?.[0]?.display_name || tags?.[0]?.slug_name || "未分类";
}

function mapAdminArticleSummary(item: BackendQuestionInfo): AdminArticleSummary {
  return {
    id: item.id,
    urlTitle: item.url_title,
    title: item.title,
    author: getAuthor(item.user_info),
    date: formatDate(item.created_at || item.create_time),
    tag: getPrimaryTag(item.tags),
    excerpt: item.description || excerptFromText(item.content || item.html || ""),
    views: item.view_count || 0,
    likes: item.vote_count || 0,
  };
}

function mapAdminArticleDetail(item: BackendQuestionInfo): AdminArticleDetail {
  return {
    ...mapAdminArticleSummary(item),
    content: item.content || "",
    html: item.html || "",
    tags:
      item.tags?.map((tag) => ({
        slug_name: tag.slug_name,
        display_name: tag.display_name,
        recommend: tag.recommend,
        reserved: tag.reserved,
      })) || [],
  };
}

function getPrimaryRepo(repoUrlMap?: Record<string, string>) {
  if (!repoUrlMap) {
    return "";
  }
  return repoUrlMap.github || repoUrlMap.gitee || Object.values(repoUrlMap)[0] || "";
}

function mapAdminVideoSummary(item: BackendVideoInfo): AdminVideoSummary {
  return {
    id: item.id,
    title: item.title,
    author: item.author_name || "管理员",
    date: formatDate(item.datetime || item.created_at),
    category: item.type || "未分类",
    duration: formatDuration(item.duration),
    views: item.view_count || 0,
    cover: item.cover || "",
    description: item.description || excerptFromText(item.content || ""),
    isRecommend: Boolean(item.is_recommend),
    isShow: Boolean(item.is_show),
  };
}

function mapAdminVideoDetail(item: BackendVideoInfo): AdminVideoDetail {
  return {
    ...mapAdminVideoSummary(item),
    content: item.content || "",
    authorAvatar: item.author_avatar || "",
    authorIntro: item.author_intro || "",
    externalLink: item.external_link || "",
    embedCode: item.code || "",
    durationSeconds: item.duration || 0,
  };
}

function mapAdminProjectSummary(item: BackendProjectInfo): AdminProjectSummary {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    codeType: item.code_type || 1,
    codeTypeName: item.code_type_name || "Web",
    tags: item.tags || [],
    repo: getPrimaryRepo(item.repo_url),
    cover: item.cover || "",
    views: Number(item.view_count || 0),
    likes: item.vote_count || 0,
    createdAt: formatDate(item.created_at),
  };
}

function mapAdminProjectDetail(item: BackendProjectInfo): AdminProjectDetail {
  return {
    ...mapAdminProjectSummary(item),
    content: item.content || "",
    repoUrlMap: item.repo_url || {},
    questionId: item.question_id || "",
  };
}

export async function getArticleTagOptions(query = ""): Promise<ApiResponse<AdminTagOption[]>> {
  return request<AdminTagOption[]>(
    `/answer/api/v1/question/tags?tag=${encodeURIComponent(query)}`,
    { method: "GET" },
  );
}

export async function getAdminArticles(params?: {
  page?: number;
  pageSize?: number;
  order?: string;
  tag?: string;
}): Promise<ApiResponse<AdminArticleListResult>> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page || 1));
  query.set("page_size", String(params?.pageSize || 10));
  query.set("order", params?.order || "newest");
  query.set("content_type", "2");
  if (params?.tag) {
    query.set("tag", params.tag);
  }

  try {
    const data = await apiRequest<BackendPaged<BackendQuestionInfo>>(
      `/answer/api/v1/content/page?${query.toString()}`,
      { method: "GET" },
    );
    return {
      success: true,
      data: {
        count: data.count || 0,
        list: (data.list || []).map(mapAdminArticleSummary),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "文章列表加载失败，请稍后重试。",
    };
  }
}

export async function getAdminArticleDetail(id: string): Promise<ApiResponse<AdminArticleDetail>> {
  try {
    const data = await apiRequest<BackendQuestionInfo>(
      `/answer/api/v1/question/info?id=${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return { success: true, data: mapAdminArticleDetail(data) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "文章详情加载失败，请稍后重试。",
    };
  }
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
  // const res = await fetch(`/answer/api/v1/file`, { method: "POST", body: form, credentials: "include" });
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
): Promise<ApiResponse<ArticleWriteResult>> {
  const tagOptionsResp = await getArticleTagOptions(payload.tag);
  if (!tagOptionsResp.success || !tagOptionsResp.data) {
    return {
      success: false,
      error: tagOptionsResp.error || "文章标签加载失败，请稍后重试。",
    };
  }

  const matchedTag = findTagOption(payload.tag, tagOptionsResp.data);
  if (!matchedTag) {
    return {
      success: false,
      error: `标签“${payload.tag}”不存在，请先选择后端已有标签。`,
    };
  }

  try {
    const data = await apiRequest<BackendQuestionWriteResp>("/answer/api/v1/question", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        url_title: payload.title,
        content: payload.content,
        type: 2,
        tags: [
          {
            slug_name: matchedTag.slug_name,
            display_name: matchedTag.display_name,
            original_text: "",
          },
        ],
      }),
    });

    return {
      success: true,
      data: {
        id: data.id,
        urlTitle: data.url_title,
        waitForReview: Boolean(data.wait_for_review),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "文章发布失败，请稍后重试。",
    };
  }
}

/**
 * 编辑已有文章（全量更新）。
 *
 * PUT /admin/articles/:id
 */
export async function updateArticle(
  id: string,
  payload: ArticleUploadPayload
): Promise<ApiResponse<ArticleWriteResult>> {
  const tagOptionsResp = await getArticleTagOptions(payload.tag);
  if (!tagOptionsResp.success || !tagOptionsResp.data) {
    return {
      success: false,
      error: tagOptionsResp.error || "文章标签加载失败，请稍后重试。",
    };
  }

  const matchedTag = findTagOption(payload.tag, tagOptionsResp.data);
  if (!matchedTag) {
    return {
      success: false,
      error: `标签“${payload.tag}”不存在，请先选择后端已有标签。`,
    };
  }

  try {
    const data = await apiRequest<BackendQuestionWriteResp>("/answer/api/v1/question", {
      method: "PUT",
      body: JSON.stringify({
        id,
        title: payload.title,
        content: payload.content,
        tags: [
          {
            slug_name: matchedTag.slug_name,
            display_name: matchedTag.display_name,
            original_text: "",
          },
        ],
      }),
    });

    return {
      success: true,
      data: {
        id: data.id,
        urlTitle: data.url_title,
        waitForReview: Boolean(data.wait_for_review),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "文章更新失败，请稍后重试。",
    };
  }
}

/**
 * 删除文章。
 *
 * DELETE /admin/articles/:id
 */
export async function deleteArticle(id: string): Promise<ApiResponse> {
  return request("/answer/api/v1/question", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
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
export async function getAdminVideos(params?: {
  page?: number;
  pageSize?: number;
  order?: string;
}): Promise<ApiResponse<AdminVideoListResult>> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page || 1));
  query.set("page_size", String(params?.pageSize || 10));
  query.set("order", params?.order || "newest");

  try {
    const data = await apiRequest<BackendPaged<BackendVideoInfo>>(
      `/answer/api/v1/video/page?${query.toString()}`,
      { method: "GET" },
    );
    return {
      success: true,
      data: {
        count: data.count || 0,
        list: (data.list || []).map(mapAdminVideoSummary),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "视频列表加载失败，请稍后重试。",
    };
  }
}

export async function getAdminVideoDetail(id: string): Promise<ApiResponse<AdminVideoDetail>> {
  try {
    const data = await apiRequest<BackendVideoInfo>(
      `/answer/api/v1/video/info?id=${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return { success: true, data: mapAdminVideoDetail(data) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "视频详情加载失败，请稍后重试。",
    };
  }
}

export async function createVideo(
  payload: VideoWritePayload
): Promise<ApiResponse<VideoWriteResult>> {
  try {
    const data = await apiRequest<BackendVideoWriteResp>("/answer/api/v1/video/create", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        category: payload.category,
        cover: payload.cover,
        is_recommend: payload.isRecommend,
        is_show: payload.isShow,
        duration: payload.duration,
        description: payload.description,
        content: payload.content,
        author_avatar: payload.authorAvatar,
        author_name: payload.authorName,
        author_intro: payload.authorIntro,
        embed_code: payload.embedCode,
        external_link: payload.externalLink,
      }),
    });
    return {
      success: true,
      data: {
        id: data.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "视频创建失败，请稍后重试。",
    };
  }
}

/**
 * 编辑视频（含详情字段，支持只更新部分字段）。
 *
 * PUT /admin/videos/:id
 */
export async function updateVideo(
  id: string,
  payload: VideoWritePayload
): Promise<ApiResponse<VideoWriteResult>> {
  try {
    const data = await apiRequest<BackendVideoWriteResp>("/answer/api/v1/video/update", {
      method: "PUT",
      body: JSON.stringify({
        id,
        title: payload.title,
        category: payload.category,
        cover: payload.cover,
        is_recommend: payload.isRecommend,
        is_show: payload.isShow,
        duration: payload.duration,
        description: payload.description,
        content: payload.content,
        author_avatar: payload.authorAvatar,
        author_name: payload.authorName,
        author_intro: payload.authorIntro,
        embed_code: payload.embedCode,
        external_link: payload.externalLink,
      }),
    });
    return {
      success: true,
      data: {
        id: data.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "视频更新失败，请稍后重试。",
    };
  }
}

/**
 * 删除视频。
 *
 * DELETE /admin/videos/:id
 */
export async function deleteVideo(id: string): Promise<ApiResponse> {
  return request("/answer/api/v1/video/delete", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
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
export async function getAdminProjects(params?: {
  page?: number;
  pageSize?: number;
  order?: string;
}): Promise<ApiResponse<AdminProjectListResult>> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page || 1));
  query.set("page_size", String(params?.pageSize || 10));
  query.set("order", params?.order || "newest");

  try {
    const data = await apiRequest<BackendPaged<BackendProjectInfo>>(
      `/answer/api/v1/project/page?${query.toString()}`,
      { method: "GET" },
    );
    return {
      success: true,
      data: {
        count: data.count || 0,
        list: (data.list || []).map(mapAdminProjectSummary),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目列表加载失败，请稍后重试。",
    };
  }
}

export async function getAdminProjectDetail(id: string): Promise<ApiResponse<AdminProjectDetail>> {
  try {
    const data = await apiRequest<BackendProjectInfo>(
      `/answer/api/v1/project/info?id=${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return { success: true, data: mapAdminProjectDetail(data) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "项目详情加载失败，请稍后重试。",
    };
  }
}

export async function createProject(
  payload: ProjectWritePayload
): Promise<ApiResponse> {
  return request("/answer/api/v1/project", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      content: payload.content,
      repo_url: payload.repoUrlMap,
      code_type: payload.codeType,
      tags: payload.tags,
      question_id: payload.questionId,
    }),
  });
}

/**
 * 编辑开源项目（支持只更新部分字段，例如单独更新 stars/forks）。
 *
 * PUT /admin/projects/:id
 */
export async function updateProject(
  id: string,
  payload: ProjectWritePayload
): Promise<ApiResponse> {
  return request("/answer/api/v1/project", {
    method: "PUT",
    body: JSON.stringify({
      id,
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      content: payload.content,
      repo_url: payload.repoUrlMap,
      code_type: payload.codeType,
      tags: payload.tags,
    }),
  });
}

/**
 * 删除开源项目。
 *
 * DELETE /admin/projects/:id
 */
export async function deleteProject(id: string): Promise<ApiResponse> {
  return request("/answer/api/v1/project", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
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
