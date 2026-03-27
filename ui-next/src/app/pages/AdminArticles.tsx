import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { deleteArticle, getAdminArticles, getArticleTagOptions, type AdminArticleSummary, type AdminTagOption } from "../api/adminApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const PAGE_SIZE = 10;

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages] as const;
  }
  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages] as const;
}

export function AdminArticles() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<AdminArticleSummary[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagOptions, setTagOptions] = useState<AdminTagOption[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const currentTag = searchParams.get("tag") || "";
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const pageItems = useMemo(() => buildPageItems(currentPage, totalPages), [currentPage, totalPages]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const state = location.state as { toast?: { type: "success" | "error"; msg: string } } | null;
    if (state?.toast) {
      setToast(state.toast);
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
      window.setTimeout(() => setToast(null), 3500);
    }
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadTags = async () => {
      const result = await getArticleTagOptions();
      if (cancelled || !result.success || !result.data) {
        return;
      }
      setTagOptions(result.data);
    };

    void loadTags();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadArticles = async () => {
      setLoading(true);
      const result = await getAdminArticles({
        page: currentPage,
        pageSize: PAGE_SIZE,
        tag: currentTag || undefined,
      });
      if (cancelled) {
        return;
      }
      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "文章列表加载失败");
        setArticles([]);
        setCount(0);
        return;
      }
      setArticles(result.data.list);
      setCount(result.data.count);
      const nextTotalPages = Math.max(1, Math.ceil(result.data.count / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(nextTotalPages));
        setSearchParams(next, { replace: true });
      }
    };

    void loadArticles();
    return () => {
      cancelled = true;
    };
  }, [currentPage, currentTag, searchParams, setSearchParams]);

  const updateQuery = (patch: { page?: number; tag?: string }) => {
    const next = new URLSearchParams(searchParams);
    if (patch.page !== undefined) {
      next.set("page", String(patch.page));
    }
    if (patch.tag !== undefined) {
      if (patch.tag) {
        next.set("tag", patch.tag);
      } else {
        next.delete("tag");
      }
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const handleDelete = async (article: AdminArticleSummary) => {
    if (!window.confirm(`确定删除文章「${article.title}」吗？`)) {
      return;
    }
    setDeletingId(article.id);
    const result = await deleteArticle(article.id);
    setDeletingId(null);
    if (!result.success) {
      showToast("error", result.error || "文章删除失败");
      return;
    }
    showToast("success", "文章已删除");
    const resultAfterDelete = await getAdminArticles({
      page: currentPage,
      pageSize: PAGE_SIZE,
      tag: currentTag || undefined,
    });
    if (!resultAfterDelete.success || !resultAfterDelete.data) {
      return;
    }
    setArticles(resultAfterDelete.data.list);
    setCount(resultAfterDelete.data.count);
    const nextTotalPages = Math.max(1, Math.ceil(resultAfterDelete.data.count / PAGE_SIZE));
    if (currentPage > nextTotalPages) {
      updateQuery({ page: nextTotalPages });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800"
              : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">文章管理</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              默认展示文章列表，点击条目跳前台文章页；编辑和新建会进入独立表单页。
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/articles/new${location.search}`, { state: { from: `${location.pathname}${location.search}` } })}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#009EFF] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
          >
            <Plus className="h-4 w-4" />
            新建文章
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            <Search className="h-4 w-4" />
            当前优先支持按标签筛选
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300">标签筛选</label>
            <div className="relative min-w-[180px]">
              <select
                value={currentTag}
                onChange={(e) => updateQuery({ tag: e.target.value })}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
              >
                <option value="">全部标签</option>
                {tagOptions.map((tag) => (
                  <option key={tag.slug_name} value={tag.slug_name}>
                    {tag.display_name}
                  </option>
                ))}
              </select>
              <Tag className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              正在加载文章列表...
            </div>
          ) : articles.length === 0 ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              当前筛选条件下没有文章。
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {articles.map((article) => (
                <div key={article.id} className="bg-white px-5 py-4 transition-colors hover:bg-slate-50/80 dark:bg-[#111827] dark:hover:bg-slate-900/50">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/article/${article.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                          {article.title}
                        </h3>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {article.tag}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                        {article.excerpt || "暂无摘要"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-slate-400 dark:text-slate-500">
                        <span>{article.author}</span>
                        <span>{article.date || "未设置日期"}</span>
                        <span>{article.views} 浏览</span>
                        <span>{article.likes} 点赞</span>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={deletingId === article.id}
                          className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => navigate(`/article/${article.id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          查看文章
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/articles/${article.id}/edit${location.search}`, {
                              state: { from: `${location.pathname}${location.search}` },
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          编辑文章
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleDelete(article)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                          删除文章
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0 whitespace-nowrap text-[13px] text-slate-500 dark:text-slate-400">
            共 {count} 篇文章，当前第 {currentPage} / {totalPages} 页
          </p>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      updateQuery({ page: currentPage - 1 });
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        updateQuery({ page: item });
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      updateQuery({ page: currentPage + 1 });
                    }
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  );
}
