import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Search as SearchIcon,
  FileText,
  PlayCircle,
  Github,
  ChevronRight,
  Clock,
  Eye,
  ThumbsUp,
  Tag,
} from "lucide-react";
import {
  ContentArticle,
  ContentProject,
  ContentVideo,
  fetchArticles,
  fetchProjects,
  fetchVideos,
} from "../api/contentApi";

// ── 将三类数据统一扁平化为可搜索条目 ────────────────────────────
type SearchItem =
  | {
      kind: "article";
      id: string;
      title: string;
      description: string;
      author: string;
      date: string;
      views: number;
      likes: number;
      tag: string;
    }
  | {
      kind: "video";
      id: string;
      title: string;
      description: string;
      author: string;
      date: string;
      views: number;
      duration: string;
      category: string;
    }
  | {
      kind: "project";
      id: string;
      title: string;
      description: string;
      language: string;
      views: number;
      likes: number;
      tags: string[];
    };

// ── 高亮匹配关键字 ────────────────────────────────────────────
function highlight(text: string, keyword: string) {
  if (!keyword.trim()) return <>{text}</>;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="text-[#009EFF] dark:text-[#33B1FF] font-semibold bg-[#009EFF]/10 dark:bg-[#33B1FF]/20 px-0.5 rounded not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ── 搜索核心：标题 + 描述 + 附属字段全量匹配 ────────────────────
function matchItem(item: SearchItem, lq: string): boolean {
  if (item.title.toLowerCase().includes(lq)) return true;
  if (item.description.toLowerCase().includes(lq)) return true;
  if (item.kind === "article") {
    return item.author.toLowerCase().includes(lq) || item.tag.toLowerCase().includes(lq);
  }
  if (item.kind === "video") {
    return item.author.toLowerCase().includes(lq) || item.category.toLowerCase().includes(lq);
  }
  if (item.kind === "project") {
    return (
      item.language.toLowerCase().includes(lq) ||
      item.tags.some((t) => t.toLowerCase().includes(lq))
    );
  }
  return false;
}

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [articleResp, videoResp, projectResp] = await Promise.all([
          fetchArticles({ page: 1, pageSize: 100, order: "newest" }),
          fetchVideos({ page: 1, pageSize: 100, order: "newest" }),
          fetchProjects({ page: 1, pageSize: 100, order: "newest" }),
        ]);

        if (!active) {
          return;
        }

        const merged: SearchItem[] = [
          ...articleResp.list.map((a: ContentArticle) => ({
            kind: "article" as const,
            id: a.id,
            title: a.title,
            description: a.excerpt,
            author: a.author,
            date: a.date,
            views: a.views,
            likes: a.likes,
            tag: a.tag,
          })),
          ...videoResp.list.map((v: ContentVideo) => ({
            kind: "video" as const,
            id: v.id,
            title: v.title,
            description: `${v.category} · ${v.author} · 时长 ${v.duration}`,
            author: v.author,
            date: v.date,
            views: v.views,
            duration: v.duration,
            category: v.category,
          })),
          ...projectResp.list.map((p: ContentProject) => ({
            kind: "project" as const,
            id: p.id,
            title: p.name,
            description: p.description,
            language: p.language,
            views: p.views,
            likes: p.likes,
            tags: p.tags,
          })),
        ];
        setItems(merged);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "搜索数据加载失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lq = query.toLowerCase();
    const filtered = items.filter((item) => matchItem(item, lq));
    if (activeTab === "all") return filtered;
    return filtered.filter((item) => item.kind === activeTab);
  }, [query, activeTab, items]);

  // 每个 tab 对应的数量（无过滤）
  const counts = useMemo(() => {
    if (!query.trim()) return { article: 0, video: 0, project: 0, all: 0 };
    const lq = query.toLowerCase();
    const all = items.filter((item) => matchItem(item, lq));
    return {
      all: all.length,
      article: all.filter((i) => i.kind === "article").length,
      video: all.filter((i) => i.kind === "video").length,
      project: all.filter((i) => i.kind === "project").length,
    };
  }, [items, query]);

  const tabDefs = [
    { id: "all", label: "全部", count: counts.all },
    { id: "article", label: "文章", count: counts.article },
    { id: "video", label: "视频", count: counts.video },
    { id: "project", label: "开源项目", count: counts.project },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12 min-h-[60vh]">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" />
          搜索结果
        </h1>
        {query ? (
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">
            关于"
            <span className="font-semibold text-slate-900 dark:text-white">{query}</span>
            "的搜索结果，共{" "}
            <span className="font-semibold text-[#009EFF] dark:text-[#33B1FF]">
              {counts.all}
            </span>{" "}
            条
          </p>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">请输入关键字进行搜索</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabDefs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 text-[14px] font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "text-[#009EFF] dark:text-[#33B1FF]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
            {query && tab.count > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.id
                    ? "bg-[#009EFF]/10 dark:bg-[#33B1FF]/15 text-[#009EFF] dark:text-[#33B1FF]"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#009EFF] dark:bg-[#33B1FF] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80">
            正在建立搜索索引...
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
            {error}
          </div>
        )}
        {results.length > 0 ? (
          results.map((item) => <ResultCard key={`${item.kind}-${item.id}`} item={item} query={query} />)
        ) : query ? (
          <EmptyState query={query} />
        ) : null}
      </div>
    </div>
  );
}

// ── 搜索结果卡片 ─────────────────────────────────────────────────
function ResultCard({ item, query }: { item: SearchItem; query: string }) {
  const kindMeta = {
    article: { label: "文章", Icon: FileText, linkTo: `/article/${item.id}` },
    video: { label: "视频", Icon: PlayCircle, linkTo: `/video/${item.id}` },
    project: {
      label: "开源项目",
      Icon: Github,
      linkTo: `/project/${item.id}`,
    },
  }[item.kind];

  const { label, Icon, linkTo } = kindMeta;

  return (
    <Link
      to={linkTo}
      className="group flex flex-col gap-3 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80 transition-all duration-300 hover:shadow-md hover:ring-blue-200/80 dark:hover:ring-blue-500/30"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors tracking-tight leading-snug">
          {highlight(item.title, query)}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-md">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
      </div>

      {/* Description */}
      <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
        {highlight(item.description, query)}
      </p>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-1 text-[13px] text-slate-400 dark:text-slate-500">
        {item.kind === "article" && (
          <>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {item.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(item.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {item.likes}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/50">
                {item.tag}
              </span>
            </span>
          </>
        )}
        {item.kind === "video" && (
          <>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {item.duration}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {item.views} 次播放
            </span>
            <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/50">
              {item.category}
            </span>
          </>
        )}
        {item.kind === "project" && (
          <>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(item.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {item.likes || 0}
            </span>
            <span className="text-slate-400 dark:text-slate-500">{item.language}</span>
            <div className="flex gap-1 flex-wrap">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </>
        )}

        <span className="ml-auto flex items-center text-[#009EFF] dark:text-[#33B1FF] opacity-0 group-hover:opacity-100 transition-all translate-x-[-8px] group-hover:translate-x-0 duration-300 whitespace-nowrap">
          查看详情 <ChevronRight className="w-4 h-4 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}

// ── 空状态 ───────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-20 text-center flex flex-col items-center">
      <div className="mb-6">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10" y="38" width="60" height="32" rx="4"
            className="fill-slate-100 dark:fill-slate-800"
            stroke="rgb(148 163 184)" strokeWidth="2.5" strokeLinejoin="round"
          />
          <path
            d="M10 38 L10 30 L32 30 L36 38Z"
            className="fill-slate-200 dark:fill-slate-700"
            stroke="rgb(148 163 184)" strokeWidth="2.5" strokeLinejoin="round"
          />
          <path
            d="M70 38 L70 30 L48 30 L44 38Z"
            className="fill-slate-200 dark:fill-slate-700"
            stroke="rgb(148 163 184)" strokeWidth="2.5" strokeLinejoin="round"
          />
          <path
            d="M32 30 L36 38 H44 L48 30Z"
            className="fill-white dark:fill-slate-600"
            stroke="rgb(148 163 184)" strokeWidth="2.5" strokeLinejoin="round"
          />
          <line x1="40" y1="10" x2="40" y2="24" stroke="rgb(148 163 184)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <line x1="20" y1="18" x2="28" y2="26" stroke="rgb(148 163 184)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <line x1="60" y1="18" x2="52" y2="26" stroke="rgb(148 163 184)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        </svg>
      </div>
      <h3 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
        未找到"<span className="text-[#009EFF] dark:text-[#33B1FF]">{query}</span>"相关结果
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-[15px]">
        尝试更换关键词，或检查拼写是否正确
      </p>
      <p className="text-slate-400 dark:text-slate-500 text-[13px] mt-2">
        可搜索：文章标题 / 摘要 / 分类标签 · 视频名称 · 开源项目 / 编程语言
      </p>
    </div>
  );
}
