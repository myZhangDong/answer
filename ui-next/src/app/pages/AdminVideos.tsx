import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { deleteVideo, getAdminVideos, type AdminVideoSummary } from "../api/adminApi";
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

export function AdminVideos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<AdminVideoSummary[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
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

    const loadVideos = async () => {
      setLoading(true);
      const result = await getAdminVideos({
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) {
        return;
      }
      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "视频列表加载失败");
        setVideos([]);
        setCount(0);
        return;
      }
      setVideos(result.data.list);
      setCount(result.data.count);

      const nextTotalPages = Math.max(1, Math.ceil(result.data.count / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(nextTotalPages));
        setSearchParams(next, { replace: true });
      }
    };

    void loadVideos();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchParams, setSearchParams]);

  const updatePage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  const handleDelete = async (video: AdminVideoSummary) => {
    if (!window.confirm(`确定删除视频「${video.title}」吗？`)) {
      return;
    }
    setDeletingId(video.id);
    const result = await deleteVideo(video.id);
    setDeletingId(null);
    if (!result.success) {
      showToast("error", result.error || "视频删除失败");
      return;
    }
    showToast("success", "视频已删除");

    const listResult = await getAdminVideos({
      page: currentPage,
      pageSize: PAGE_SIZE,
    });
    if (!listResult.success || !listResult.data) {
      return;
    }
    setVideos(listResult.data.list);
    setCount(listResult.data.count);
    const nextTotalPages = Math.max(1, Math.ceil(listResult.data.count / PAGE_SIZE));
    if (currentPage > nextTotalPages) {
      updatePage(nextTotalPages);
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

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">视频管理</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              默认展示视频列表，点击条目跳前台视频页；编辑和新建会进入独立表单页。
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/videos/new${location.search}`, { state: { from: `${location.pathname}${location.search}` } })}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#009EFF] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
          >
            <Plus className="h-4 w-4" />
            新建视频
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          当前先支持分页管理，不做搜索；后续会和视频、项目列表一起补统一搜索。
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              正在加载视频列表...
            </div>
          ) : videos.length === 0 ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              当前还没有视频内容。
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white px-4 py-4 transition-colors hover:bg-slate-50/80 dark:bg-[#111827] dark:hover:bg-slate-900/50 sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/video/${video.id}`)}
                      className="flex min-w-0 flex-1 flex-col items-start gap-4 text-left sm:flex-row"
                    >
                      <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:h-20 sm:w-36">
                        {video.cover ? (
                          <img src={video.cover} alt={video.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
                            无封面
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                            {video.title}
                          </h3>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {video.category}
                          </span>
                          {video.isRecommend && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                              推荐
                            </span>
                          )}
                          {!video.isShow && (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                              隐藏
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                          {video.description || "暂无简介"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-slate-400 dark:text-slate-500">
                          <span>{video.author}</span>
                          <span>{video.date || "未设置日期"}</span>
                          <span>{video.duration}</span>
                          <span>{video.views} 播放</span>
                        </div>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={deletingId === video.id}
                          className="self-end shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => navigate(`/video/${video.id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          查看视频
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/videos/${video.id}/edit${location.search}`, {
                              state: { from: `${location.pathname}${location.search}` },
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          编辑视频
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleDelete(video)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                          删除视频
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
            共 {count} 个视频，当前第 {currentPage} / {totalPages} 页
          </p>
          <Pagination className="justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      updatePage(currentPage - 1);
                    }
                  }}
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
                        if (item !== currentPage) {
                          updatePage(item);
                        }
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
                      updatePage(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  );
}
