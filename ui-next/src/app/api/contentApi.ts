import { apiRequest } from "./client";

interface BackendUserInfo {
  username?: string;
  display_name?: string;
  avatar?: string;
}

interface BackendTag {
  slug_name?: string;
  display_name?: string;
}

interface BackendArticleListItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  html?: string;
  view_count?: number;
  vote_count?: number;
  created_at?: number | string;
  create_time?: number | string;
  user_info?: BackendUserInfo;
  tags?: BackendTag[];
}

interface BackendArticleDetail extends BackendArticleListItem {
  update_time?: number | string;
}

interface BackendPaged<T> {
  count: number;
  list: T[];
}

interface BackendVideoInfo {
  id: string;
  title: string;
  type?: string;
  cover?: string;
  description?: string;
  content?: string;
  author_avatar?: string;
  author_name?: string;
  author_intro?: string;
  external_link?: string;
  code?: string;
  duration?: number;
  view_count?: number;
  created_at?: number | string;
  updated_at?: number | string;
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
  view_count?: number;
  vote_count?: number;
  created_at?: number | string;
  updated_at?: number | string;
}

export interface ContentArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  tag: string;
  views: number;
  likes: number;
  excerpt: string;
  content: string;
  html: string;
  tags: string[];
}

export interface ContentVideo {
  id: string;
  title: string;
  author: string;
  date: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  content: string;
  authorAvatar: string;
  authorIntro: string;
  embedCode: string;
}

export interface ContentProject {
  id: string;
  name: string;
  description: string;
  language: string;
  views: number;
  likes: number;
  tags: string[];
  repo: string;
  repoUrlMap: Record<string, string>;
  iconUrl: string;
  content: string;
  createdAt: string;
}

export interface FetchListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  order?: string;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
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
        : NaN;

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

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getAuthor(user?: BackendUserInfo) {
  return user?.display_name || user?.username || "管理员";
}

function getPrimaryTag(tags?: BackendTag[]) {
  return tags?.[0]?.display_name || tags?.[0]?.slug_name || "未分类";
}

function excerptFromText(value = "", maxLength = 120) {
  const text = stripHtml(value);
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

function mapArticleListItem(item: BackendArticleListItem): ContentArticle {
  return {
    id: item.id,
    title: item.title,
    author: getAuthor(item.user_info),
    date: formatDate(item.created_at || item.create_time),
    tag: getPrimaryTag(item.tags),
    views: item.view_count || 0,
    likes: item.vote_count || 0,
    excerpt:
      item.description ||
      excerptFromText(item.content || item.html || ""),
    content: item.content || "",
    html: item.html || "",
    tags:
      item.tags?.map((tag) => tag.display_name || tag.slug_name || "").filter(Boolean) || [],
  };
}

function mapArticleDetail(item: BackendArticleDetail): ContentArticle {
  return {
    ...mapArticleListItem(item),
    content: item.content || "",
    html: item.html || "",
    excerpt:
      item.description ||
      excerptFromText(item.content || item.html || ""),
  };
}

function mapVideo(item: BackendVideoInfo): ContentVideo {
  return {
    id: item.id,
    title: item.title,
    author: item.author_name || "管理员",
    date: formatDate(item.created_at),
    duration: formatDuration(item.duration),
    category: item.type || "视频教程",
    views: item.view_count || 0,
    likes: 0,
    thumbnail: item.cover || "/placeholder-image.svg",
    videoUrl: item.external_link || "",
    description: item.description || "",
    content: item.content || "",
    authorAvatar: item.author_avatar || "",
    authorIntro: item.author_intro || "",
    embedCode: item.code || "",
  };
}

function mapProject(item: BackendProjectInfo): ContentProject {
  const repoUrlMap = item.repo_url || {};
  const repo =
    repoUrlMap.github ||
    repoUrlMap.gitee ||
    Object.values(repoUrlMap)[0] ||
    "";

  return {
    id: item.id,
    name: item.title,
    description: item.description || "",
    language: item.code_type_name || "Unknown",
    views: Number(item.view_count || 0),
    likes: item.vote_count || 0,
    tags: item.tags || [],
    repo,
    repoUrlMap,
    iconUrl: item.cover || "",
    content: item.content || "",
    createdAt: formatDate(item.created_at),
  };
}

export async function fetchArticles(
  params: FetchListParams = {},
): Promise<BackendPaged<ContentArticle>> {
  const query = toQuery({
    page: params.page || 1,
    page_size: params.pageSize || 20,
    order: params.order || "newest",
    search: params.search,
    content_type: 2,
  });
  const resp = await apiRequest<BackendPaged<BackendArticleListItem>>(
    `/answer/api/v1/content/page?${query}`,
  );

  return {
    count: resp.count || 0,
    list: (resp.list || []).map(mapArticleListItem),
  };
}

export async function fetchArticleDetail(id: string) {
  const resp = await apiRequest<BackendArticleDetail>(
    `/answer/api/v1/question/info?id=${encodeURIComponent(id)}`,
  );
  return mapArticleDetail(resp);
}

export async function fetchVideos(
  params: FetchListParams = {},
): Promise<BackendPaged<ContentVideo>> {
  const query = toQuery({
    page: params.page || 1,
    page_size: params.pageSize || 20,
    order: params.order || "newest",
    search: params.search,
  });
  const resp = await apiRequest<BackendPaged<BackendVideoInfo>>(
    `/answer/api/v1/video/page?${query}`,
  );
  return {
    count: resp.count || 0,
    list: (resp.list || []).map(mapVideo),
  };
}

export async function fetchVideoDetail(id: string) {
  const resp = await apiRequest<BackendVideoInfo>(
    `/answer/api/v1/video/info?id=${encodeURIComponent(id)}`,
  );
  return mapVideo(resp);
}

export async function fetchProjects(
  params: FetchListParams = {},
): Promise<BackendPaged<ContentProject>> {
  const query = toQuery({
    page: params.page || 1,
    page_size: params.pageSize || 20,
    order: params.order || "newest",
    search: params.search,
  });
  const resp = await apiRequest<BackendPaged<BackendProjectInfo>>(
    `/answer/api/v1/project/page?${query}`,
  );
  return {
    count: resp.count || 0,
    list: (resp.list || []).map(mapProject),
  };
}

export async function fetchProjectDetail(id: string) {
  const resp = await apiRequest<BackendProjectInfo>(
    `/answer/api/v1/project/info?id=${encodeURIComponent(id)}`,
  );
  return mapProject(resp);
}
