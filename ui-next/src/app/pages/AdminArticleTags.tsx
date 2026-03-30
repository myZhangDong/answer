import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
  createAdminArticleTag,
  deleteAdminArticleTag,
  getAdminArticleTagDetail,
  getAdminArticleTags,
  recoverAdminArticleTag,
  updateAdminArticleTag,
  type AdminArticleTagRecord,
} from "../api/adminApi";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const PAGE_SIZE = 20;

type ToastState = {
  type: "success" | "error";
  msg: string;
} | null;

type TagForm = {
  displayName: string;
  slugName: string;
  originalText: string;
  editSummary: string;
};

type ArticleTagManagerLocationState = {
  returnTo?: string;
  returnLabel?: string;
  articleDraft?: unknown;
};

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

function formatTime(timestamp?: number) {
  if (!timestamp || timestamp <= 0) {
    return "—";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function normalizeTagSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function buildEmptyTagForm(): TagForm {
  return {
    displayName: "",
    slugName: "",
    originalText: "",
    editSummary: "",
  };
}

export function AdminArticleTags() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = (location.state as ArticleTagManagerLocationState | null) || null;

  const [tags, setTags] = useState<AdminArticleTagRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<TagForm>(buildEmptyTagForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [lastDeletedTag, setLastDeletedTag] = useState<AdminArticleTagRecord | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("keyword") || "");

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const keyword = searchParams.get("keyword") || "";
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const pageItems = useMemo(() => buildPageItems(currentPage, totalPages), [currentPage, totalPages]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;

    const loadTags = async () => {
      setLoading(true);
      const result = await getAdminArticleTags({
        page: currentPage,
        pageSize: PAGE_SIZE,
        displayName: keyword || undefined,
      });
      if (cancelled) {
        return;
      }

      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "标签列表加载失败");
        setTags([]);
        setCount(0);
        return;
      }

      setTags(result.data.list);
      setCount(result.data.count);

      const nextTotalPages = Math.max(1, Math.ceil(result.data.count / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(nextTotalPages));
        setSearchParams(next, { replace: true });
      }
    };

    void loadTags();
    return () => {
      cancelled = true;
    };
  }, [currentPage, keyword, searchParams, setSearchParams]);

  const reloadCurrentPage = async () => {
    const result = await getAdminArticleTags({
      page: currentPage,
      pageSize: PAGE_SIZE,
      displayName: keyword || undefined,
    });
    if (!result.success || !result.data) {
      showToast("error", result.error || "标签列表加载失败");
      return;
    }
    setTags(result.data.list);
    setCount(result.data.count);
  };

  const updateQuery = (patch: { page?: number; keyword?: string }) => {
    const next = new URLSearchParams(searchParams);
    if (patch.page !== undefined) {
      next.set("page", String(patch.page));
    }
    if (patch.keyword !== undefined) {
      if (patch.keyword.trim()) {
        next.set("keyword", patch.keyword.trim());
      } else {
        next.delete("keyword");
      }
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setForm(buildEmptyTagForm());
    setSlugTouched(false);
    setEditingTagId(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = async (tag: AdminArticleTagRecord) => {
    setDialogMode("edit");
    setEditingTagId(tag.tag_id);
    setSlugTouched(true);
    setForm(buildEmptyTagForm());
    setDialogOpen(true);
    setSubmitting(false);

    const detail = await getAdminArticleTagDetail(tag.tag_id);
    if (!detail.success || !detail.data) {
      showToast("error", detail.error || "标签详情加载失败");
      setDialogOpen(false);
      return;
    }

    setForm({
      displayName: detail.data.display_name,
      slugName: detail.data.slug_name,
      originalText: detail.data.original_text || "",
      editSummary: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      display_name: form.displayName.trim(),
      slug_name: normalizeTagSlug(form.slugName),
      original_text: form.originalText.trim(),
    };

    if (!payload.display_name || !payload.slug_name || !payload.original_text) {
      showToast("error", "请填写标签名称、Slug 和标签描述");
      return;
    }

    setSubmitting(true);
    const result =
      dialogMode === "create"
        ? await createAdminArticleTag(payload)
        : await updateAdminArticleTag({
            tag_id: editingTagId || "",
            ...payload,
            edit_summary: form.editSummary.trim(),
          });
    setSubmitting(false);

    if (!result.success) {
      showToast("error", result.error || (dialogMode === "create" ? "标签创建失败" : "标签更新失败"));
      return;
    }

    setDialogOpen(false);
    setForm(buildEmptyTagForm());
    setEditingTagId(null);
    await reloadCurrentPage();
    showToast(
      "success",
      dialogMode === "create"
        ? `标签「${payload.display_name}」已创建`
        : "标签已更新",
    );
  };

  const handleDelete = async (tag: AdminArticleTagRecord) => {
    if (!window.confirm(`确定删除标签「${tag.display_name}」吗？`)) {
      return;
    }
    setDeletingTagId(tag.tag_id);
    const result = await deleteAdminArticleTag(tag.tag_id);
    setDeletingTagId(null);
    if (!result.success) {
      showToast("error", result.error || "标签删除失败");
      return;
    }
    setLastDeletedTag(tag);
    await reloadCurrentPage();
    showToast("success", `标签「${tag.display_name}」已删除`);
  };

  const handleRecoverLastDeleted = async () => {
    if (!lastDeletedTag) {
      return;
    }
    setRecovering(true);
    const result = await recoverAdminArticleTag(lastDeletedTag.tag_id);
    setRecovering(false);
    if (!result.success) {
      showToast("error", result.error || "标签恢复失败");
      return;
    }
    const recoveredName = lastDeletedTag.display_name;
    setLastDeletedTag(null);
    await reloadCurrentPage();
    showToast("success", `标签「${recoveredName}」已恢复`);
  };

  const handleReturnToEditor = () => {
    if (!state?.returnTo) {
      return;
    }
    navigate(state.returnTo, {
      state: {
        restoredDraft: state.articleDraft,
        refreshedFromTagManager: true,
      },
    });
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
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {lastDeletedTag && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">刚刚删除了标签「{lastDeletedTag.display_name}」</p>
              <p className="mt-1 text-amber-700/80 dark:text-amber-100/80">
                如果这是误删，可以直接恢复上一个已删除标签。
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => void handleRecoverLastDeleted()} disabled={recovering}>
            <RotateCcw className="h-4 w-4" />
            {recovering ? "恢复中..." : "恢复标签"}
          </Button>
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">文章标签</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              管理文章创建、编辑和筛选共用的标签数据源。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {state?.returnTo && (
              <Button type="button" variant="outline" onClick={handleReturnToEditor} className="w-full sm:w-auto">
                <Tag className="h-4 w-4" />
                {state.returnLabel || "返回文章编辑"}
              </Button>
            )}
            <Button type="button" onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              新建标签
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateQuery({ keyword: searchInput, page: 1 });
            }}
            className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="按标签名称搜索"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              搜索
            </Button>
          </form>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400 md:max-w-sm">
            当前优先维护文章标签；视频分类仍按独立配置管理。
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">正在加载标签列表...</div>
          ) : tags.length === 0 ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              当前没有可用标签，请先创建一个标签。
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
                {tags.map((tag) => (
                  <div key={tag.tag_id} className="bg-white px-4 py-4 dark:bg-[#111827]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{tag.display_name}</span>
                          {tag.recommend && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                              推荐
                            </span>
                          )}
                          {tag.reserved && (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                              保留
                            </span>
                          )}
                        </div>
                        <p className="mt-2 break-all font-mono text-[12px] text-slate-500 dark:text-slate-400">
                          {tag.slug_name}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            disabled={deletingTagId === tag.tag_id}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => void handleOpenEditDialog(tag)}>
                            <Pencil className="h-4 w-4" />
                            编辑标签
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void handleDelete(tag)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除标签
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-3 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                      {tag.description || "暂无描述"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">ID: {tag.tag_id}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">文章 {tag.question_count ?? 0}</span>
                      <span>{formatTime(tag.updated_at || tag.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">标签</TableHead>
                      <TableHead className="px-4">Slug</TableHead>
                      <TableHead className="px-4">描述</TableHead>
                      <TableHead className="px-4">文章数</TableHead>
                      <TableHead className="px-4">更新时间</TableHead>
                      <TableHead className="px-4 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.tag_id}>
                        <TableCell className="px-4">
                          <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">{tag.display_name}</span>
                              {tag.recommend && (
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                  推荐
                                </span>
                              )}
                              {tag.reserved && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                  保留
                                </span>
                              )}
                            </div>
                            <span className="text-[12px] text-slate-400 dark:text-slate-500">ID: {tag.tag_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 font-mono text-[12px] text-slate-500 dark:text-slate-400">{tag.slug_name}</TableCell>
                        <TableCell className="px-4 whitespace-normal text-[13px] text-slate-500 dark:text-slate-400">
                          {tag.description || "暂无描述"}
                        </TableCell>
                        <TableCell className="px-4 text-slate-600 dark:text-slate-300">{tag.question_count ?? 0}</TableCell>
                        <TableCell className="px-4 text-[13px] text-slate-500 dark:text-slate-400">
                          {formatTime(tag.updated_at || tag.created_at)}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                disabled={deletingTagId === tag.tag_id}
                                className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => void handleOpenEditDialog(tag)}>
                                <Pencil className="h-4 w-4" />
                                编辑标签
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => void handleDelete(tag)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                删除标签
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            共 {count} 个标签，当前第 {currentPage} / {totalPages} 页
          </p>
          <Pagination className="justify-start sm:justify-end">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "新建标签" : "编辑标签"}</DialogTitle>
            <DialogDescription>
              标签名称用于后台展示，Slug 用于筛选与写接口，描述会作为标签介绍内容保存。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">标签名称</label>
                <Input
                  value={form.displayName}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setForm((current) => ({
                      ...current,
                      displayName: nextValue,
                      slugName: slugTouched ? current.slugName : normalizeTagSlug(nextValue),
                    }));
                  }}
                  placeholder="例如：Web SDK"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Slug</label>
                <Input
                  value={form.slugName}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((current) => ({ ...current, slugName: e.target.value }));
                  }}
                  placeholder="例如：web-sdk"
                />
              </div>
            </div>

            {dialogMode === "edit" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">编辑说明</label>
                <Input
                  value={form.editSummary}
                  onChange={(e) => setForm((current) => ({ ...current, editSummary: e.target.value }))}
                  placeholder="可选，说明本次调整内容"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">标签描述</label>
              <textarea
                value={form.originalText}
                onChange={(e) => setForm((current) => ({ ...current, originalText: e.target.value }))}
                placeholder="输入标签介绍，支持 Markdown"
                rows={8}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:ring-[#33B1FF]/40"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "提交中..." : dialogMode === "create" ? "创建标签" : "保存修改"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
