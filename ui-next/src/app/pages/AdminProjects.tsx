import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { deleteProject, getAdminProjects, type AdminProjectSummary } from "../api/adminApi";
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

export function AdminProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<AdminProjectSummary[]>([]);
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

    const loadProjects = async () => {
      setLoading(true);
      const result = await getAdminProjects({
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) {
        return;
      }
      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "项目列表加载失败");
        setProjects([]);
        setCount(0);
        return;
      }
      setProjects(result.data.list);
      setCount(result.data.count);

      const nextTotalPages = Math.max(1, Math.ceil(result.data.count / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(nextTotalPages));
        setSearchParams(next, { replace: true });
      }
    };

    void loadProjects();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchParams, setSearchParams]);

  const updatePage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  const handleDelete = async (project: AdminProjectSummary) => {
    if (!window.confirm(`确定删除项目「${project.title}」吗？`)) {
      return;
    }
    setDeletingId(project.id);
    const result = await deleteProject(project.id);
    setDeletingId(null);
    if (!result.success) {
      showToast("error", result.error || "项目删除失败");
      return;
    }
    showToast("success", "项目已删除");

    const listResult = await getAdminProjects({
      page: currentPage,
      pageSize: PAGE_SIZE,
    });
    if (!listResult.success || !listResult.data) {
      return;
    }
    setProjects(listResult.data.list);
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

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">项目管理</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              默认展示项目列表，点击条目跳前台项目页；编辑和新建会进入独立表单页。
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/projects/new${location.search}`, { state: { from: `${location.pathname}${location.search}` } })}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#009EFF] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
          >
            <Plus className="h-4 w-4" />
            新建项目
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          项目创建仍复用现有后端模型，创建时需要显式提供关联文章 ID。
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              正在加载项目列表...
            </div>
          ) : projects.length === 0 ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              当前还没有项目内容。
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white px-5 py-4 transition-colors hover:bg-slate-50/80 dark:bg-[#111827] dark:hover:bg-slate-900/50"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="flex min-w-0 flex-1 items-start gap-4 text-left"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        {project.cover ? (
                          <img src={project.cover} alt={project.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-slate-400">无图</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                            {project.title}
                          </h3>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {project.codeTypeName}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                          {project.description || "暂无简介"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {project.tags.length > 0 ? (
                            project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[12px] text-slate-400 dark:text-slate-500">暂无标签</span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-slate-400 dark:text-slate-500">
                          <span>{project.createdAt || "未设置日期"}</span>
                          <span>{project.views} 浏览</span>
                          <span>{project.likes} 点赞</span>
                          <span className="truncate">{project.repo || "未配置仓库地址"}</span>
                        </div>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={deletingId === project.id}
                          className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          查看项目
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}/edit${location.search}`, {
                              state: { from: `${location.pathname}${location.search}` },
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          编辑项目
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void handleDelete(project)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                          删除项目
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
            共 {count} 个项目，当前第 {currentPage} / {totalPages} 页
          </p>
          <Pagination className="justify-end">
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
