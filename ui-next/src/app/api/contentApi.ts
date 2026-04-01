import { apiRequest } from "./client";
import { normalizeUploadedAssetUrl } from "../utils/assetUrl";

interface BackendUserInfo {
  username?: string;
  display_name?: string;
  avatar?: string;
}

interface BackendQuestionOperator {
  username?: string;
  display_name?: string;
}

interface BackendTag {
  slug_name?: string;
  display_name?: string;
}

interface BackendTagOption {
  tag_id?: string;
  slug_name?: string;
  display_name?: string;
  recommend?: boolean;
  reserved?: boolean;
}

interface BackendPaged<T> {
  count: number;
  list: T[];
}

interface BackendArticleListItem {
  id: string;
  title: string;
  author_name?: string;
  description?: string;
  content?: string;
  html?: string;
  view_count?: number;
  created_at?: number | string;
  create_time?: number | string;
  operator?: BackendQuestionOperator;
  user_info?: BackendUserInfo;
  tags?: BackendTag[];
}

interface BackendArticleDetail extends BackendArticleListItem {
  update_time?: number | string;
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
  created_at?: number | string;
  updated_at?: number | string;
}

interface BackendContentFeedback {
  object_type: ContentObjectType;
  object_id: string;
  like_count?: number;
  rating_avg?: number;
  rating_count?: number;
  liked_by_me?: boolean;
  rated_by_me?: boolean;
  my_rating?: number;
}

interface BackendCaptchaChallenge {
  captcha_id?: string;
  captcha_img?: string;
  verify?: boolean;
}

export type ContentObjectType = "article" | "video" | "project";

export interface ContentFeedback {
  objectType: ContentObjectType;
  objectId: string;
  likeCount: number;
  ratingAvg: number;
  ratingCount: number;
  likedByMe: boolean;
  ratedByMe: boolean;
  myRating: number;
}

export interface CaptchaChallenge {
  captchaId: string;
  captchaImg: string;
  verify: boolean;
}

interface BackendHomepageBanner {
  enabled?: boolean;
  image_url?: string;
  link_url?: string;
}

interface BackendHomepageSettings {
  home_banner?: BackendHomepageBanner;
  hot_articles_ad?: BackendHomepageBanner;
}

export interface ContentArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  tag: string;
  tagSlugs: string[];
  views: number;
  likes: number;
  ratingAvg: number;
  ratingCount: number;
  likedByMe: boolean;
  ratedByMe: boolean;
  myRating: number;
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
  ratingAvg: number;
  ratingCount: number;
  likedByMe: boolean;
  ratedByMe: boolean;
  myRating: number;
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
  ratingAvg: number;
  ratingCount: number;
  likedByMe: boolean;
  ratedByMe: boolean;
  myRating: number;
  tags: string[];
  repo: string;
  repoUrlMap: Record<string, string>;
  iconUrl: string;
  content: string;
  createdAt: string;
}

export interface ContentHomepageBanner {
  enabled: boolean;
  imageUrl: string;
  linkUrl: string;
}

export interface ContentHomepageSettings {
  homeBanner: ContentHomepageBanner;
  hotArticlesAd: ContentHomepageBanner;
}

export interface ContentArticleTagOption {
  tagId: string;
  slugName: string;
  displayName: string;
  recommend: boolean;
  reserved: boolean;
}

export interface FetchListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  order?: string;
  tag?: string;
}

export interface SubmitProjectDemoLeadPayload {
  projectId: string;
  fullName: string;
  phone: string;
  captchaId: string;
  captchaCode: string;
}

type FeedbackCarrier = {
  id: string;
  likes: number;
  ratingAvg: number;
  ratingCount: number;
  likedByMe: boolean;
  ratedByMe: boolean;
  myRating: number;
};

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

function getArticleAuthor(authorName?: string, operator?: BackendQuestionOperator, user?: BackendUserInfo) {
  return authorName || operator?.display_name || operator?.username || getAuthor(user);
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

function mapContentFeedback(item: BackendContentFeedback): ContentFeedback {
  return {
    objectType: item.object_type,
    objectId: item.object_id,
    likeCount: item.like_count || 0,
    ratingAvg: item.rating_avg || 0,
    ratingCount: item.rating_count || 0,
    likedByMe: Boolean(item.liked_by_me),
    ratedByMe: Boolean(item.rated_by_me),
    myRating: item.my_rating || 0,
  };
}

function applyFeedback<T extends FeedbackCarrier>(item: T, feedback?: ContentFeedback): T {
  if (!feedback) {
    return item;
  }
  return {
    ...item,
    likes: feedback.likeCount,
    ratingAvg: feedback.ratingAvg,
    ratingCount: feedback.ratingCount,
    likedByMe: feedback.likedByMe,
    ratedByMe: feedback.ratedByMe,
    myRating: feedback.myRating,
  };
}

function mapArticleListItem(item: BackendArticleListItem): ContentArticle {
  return {
    id: item.id,
    title: item.title,
    author: getArticleAuthor(item.author_name, item.operator, item.user_info),
    date: formatDate(item.created_at || item.create_time),
    tag: getPrimaryTag(item.tags),
    tagSlugs:
      item.tags?.map((tag) => tag.slug_name || "").filter(Boolean) || [],
    views: item.view_count || 0,
    likes: 0,
    ratingAvg: 0,
    ratingCount: 0,
    likedByMe: false,
    ratedByMe: false,
    myRating: 0,
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
    ratingAvg: 0,
    ratingCount: 0,
    likedByMe: false,
    ratedByMe: false,
    myRating: 0,
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
    likes: 0,
    ratingAvg: 0,
    ratingCount: 0,
    likedByMe: false,
    ratedByMe: false,
    myRating: 0,
    tags: item.tags || [],
    repo,
    repoUrlMap,
    iconUrl: item.cover || "",
    content: item.content || "",
    createdAt: formatDate(item.created_at),
  };
}

function mapHomepageBanner(item?: BackendHomepageBanner): ContentHomepageBanner {
  return {
    enabled: Boolean(item?.enabled),
    imageUrl: normalizeUploadedAssetUrl(item?.image_url),
    linkUrl: item?.link_url || "",
  };
}

async function fetchFeedbackMap(
  objectType: ContentObjectType,
  objectIDs: string[],
): Promise<Map<string, ContentFeedback>> {
  const normalizedIDs = Array.from(new Set(objectIDs.filter(Boolean)));
  if (normalizedIDs.length === 0) {
    return new Map();
  }

  const resp = await apiRequest<BackendContentFeedback[]>(
    "/answer/api/v1/content/feedback/batch",
    {
      method: "POST",
      body: JSON.stringify({
        object_type: objectType,
        object_ids: normalizedIDs,
      }),
    },
  );

  return new Map(
    (resp || []).map((item) => {
      const feedback = mapContentFeedback(item);
      return [feedback.objectId, feedback];
    }),
  );
}

async function attachFeedback<T extends FeedbackCarrier>(
  objectType: ContentObjectType,
  list: T[],
): Promise<T[]> {
  if (list.length === 0) {
    return list;
  }

  try {
    const feedbackMap = await fetchFeedbackMap(
      objectType,
      list.map((item) => item.id),
    );
    return list.map((item) => applyFeedback(item, feedbackMap.get(item.id)));
  } catch {
    return list;
  }
}

export async function fetchContentFeedback(
  objectType: ContentObjectType,
  objectID: string,
): Promise<ContentFeedback> {
  const query = toQuery({
    object_type: objectType,
    object_id: objectID,
  });
  const resp = await apiRequest<BackendContentFeedback>(
    `/answer/api/v1/content/feedback?${query}`,
  );
  return mapContentFeedback(resp);
}

export async function fetchContentFeedbackBatch(
  objectType: ContentObjectType,
  objectIDs: string[],
): Promise<ContentFeedback[]> {
  const feedbackMap = await fetchFeedbackMap(objectType, objectIDs);
  return objectIDs
    .filter(Boolean)
    .map(
      (objectID) =>
        feedbackMap.get(objectID) || {
          objectType,
          objectId: objectID,
          likeCount: 0,
          ratingAvg: 0,
          ratingCount: 0,
          likedByMe: false,
          ratedByMe: false,
          myRating: 0,
        },
    );
}

export async function submitContentLike(
  objectType: ContentObjectType,
  objectID: string,
): Promise<ContentFeedback> {
  const resp = await apiRequest<BackendContentFeedback>(
    "/answer/api/v1/content/feedback/like",
    {
      method: "POST",
      body: JSON.stringify({
        object_type: objectType,
        object_id: objectID,
      }),
    },
  );
  return mapContentFeedback(resp);
}

export async function submitContentRating(
  objectType: ContentObjectType,
  objectID: string,
  rating: number,
): Promise<ContentFeedback> {
  const resp = await apiRequest<BackendContentFeedback>(
    "/answer/api/v1/content/feedback/rating",
    {
      method: "POST",
      body: JSON.stringify({
        object_type: objectType,
        object_id: objectID,
        rating,
      }),
    },
  );
  return mapContentFeedback(resp);
}

export async function fetchArticles(
  params: FetchListParams = {},
): Promise<BackendPaged<ContentArticle>> {
  const query = toQuery({
    page: params.page || 1,
    page_size: params.pageSize || 20,
    order: params.order || "newest",
    search: params.search,
    tag: params.tag,
    content_type: 2,
  });
  const resp = await apiRequest<BackendPaged<BackendArticleListItem>>(
    `/answer/api/v1/content/page?${query}`,
  );
  const list = await attachFeedback(
    "article",
    (resp.list || []).map(mapArticleListItem),
  );

  return {
    count: resp.count || 0,
    list,
  };
}

export async function fetchArticleDetail(id: string) {
  const resp = await apiRequest<BackendArticleDetail>(
    `/answer/api/v1/question/info?id=${encodeURIComponent(id)}`,
  );
  return mapArticleDetail(resp);
}

export async function fetchArticleTags(query = ""): Promise<ContentArticleTagOption[]> {
  const keyword = query.trim();
  if (!keyword) {
    const resp = await apiRequest<BackendPaged<BackendTagOption>>(
      "/answer/api/v1/tags/page?page=1&page_size=100&query_cond=name",
    );
    return (resp.list || []).map((item) => ({
      tagId: item.tag_id || "",
      slugName: item.slug_name || "",
      displayName: item.display_name || item.slug_name || "",
      recommend: Boolean(item.recommend),
      reserved: Boolean(item.reserved),
    }));
  }

  const resp = await apiRequest<BackendTagOption[]>(
    `/answer/api/v1/question/tags?tag=${encodeURIComponent(keyword)}`,
  );
  return (resp || []).map((item) => ({
    tagId: item.tag_id || "",
    slugName: item.slug_name || "",
    displayName: item.display_name || item.slug_name || "",
    recommend: Boolean(item.recommend),
    reserved: Boolean(item.reserved),
  }));
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
  const list = await attachFeedback("video", (resp.list || []).map(mapVideo));
  return {
    count: resp.count || 0,
    list,
  };
}

export async function fetchHotVideos(): Promise<ContentVideo[]> {
  const resp = await fetchVideos({
    page: 1,
    pageSize: 4,
    order: "hot",
  });
  return resp.list;
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
  const list = await attachFeedback("project", (resp.list || []).map(mapProject));
  return {
    count: resp.count || 0,
    list,
  };
}

export async function fetchHotProjects(): Promise<ContentProject[]> {
  const resp = await fetchProjects({
    page: 1,
    pageSize: 2,
    order: "hot",
  });
  return resp.list;
}

export async function fetchProjectDetail(id: string) {
  const resp = await apiRequest<BackendProjectInfo>(
    `/answer/api/v1/project/info?id=${encodeURIComponent(id)}`,
  );
  return mapProject(resp);
}

export async function fetchDemoFormCaptcha(): Promise<CaptchaChallenge> {
  const query = toQuery({
    action: "demo_form",
  });
  const resp = await apiRequest<BackendCaptchaChallenge>(
    `/answer/api/v1/user/action/record?${query}`,
  );
  return {
    captchaId: resp.captcha_id || "",
    captchaImg: resp.captcha_img || "",
    verify: Boolean(resp.verify),
  };
}

export async function submitProjectDemoLead(payload: SubmitProjectDemoLeadPayload) {
  return apiRequest<{ success: boolean }>("/answer/api/v1/project/demo/lead", {
    method: "POST",
    body: JSON.stringify({
      project_id: payload.projectId,
      full_name: payload.fullName,
      phone: payload.phone,
      captcha_id: payload.captchaId,
      captcha_code: payload.captchaCode,
    }),
  });
}

export async function fetchHomepageSettings(): Promise<ContentHomepageSettings> {
  const resp = await apiRequest<BackendHomepageSettings>("/answer/api/v1/siteinfo/homepage");
  return {
    homeBanner: mapHomepageBanner(resp.home_banner),
    hotArticlesAd: mapHomepageBanner(resp.hot_articles_ad),
  };
}
