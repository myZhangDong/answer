import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, Save, Tag, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createArticle, getAdminArticleDetail, getArticleTagOptions, updateArticle, type AdminTagOption } from "../api/adminApi";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { useAdminAuth } from "../auth/AdminAuthContext";

interface ArticleForm {
  title: string;
  author: string;
  date: string;
  tag: string;
  excerpt: string;
  coverUrl: string;
  content: string;
}

type ArticleEditorLocationState = {
  from?: string;
  restoredDraft?: ArticleForm;
  refreshedFromTagManager?: boolean;
  toast?: { type: "success" | "error"; msg: string };
} | null;

function buildDefaultArticle(author = "", tag = "Web"): ArticleForm {
  return {
    title: "",
    author,
    date: new Date().toISOString().slice(0, 10),
    tag,
    excerpt: "",
    coverUrl: "",
    content: `## 简介

在此填写文章正文，支持完整的 **Markdown** 语法。

## 代码示例

\`\`\`javascript
console.log('Hello, 环信！');
\`\`\`

## 小结

> 这是一段引用文字，用于强调重要信息。
`,
  };
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && (
          <span className="ml-2 text-[12px] font-normal text-slate-400 dark:text-slate-500">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:ring-[#33B1FF]/40"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:ring-[#33B1FF]/40"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: AdminTagOption[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
    >
      {options.map((opt) => (
        <option key={opt.slug_name} value={opt.display_name}>
          {opt.display_name}
        </option>
      ))}
    </select>
  );
}

export function AdminArticleEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAdminAuth();
  const authorName = user?.display_name || user?.username || user?.e_mail || "";
  const navigationState = location.state as ArticleEditorLocationState;
  const returnTo = (navigationState?.from as string | undefined) || "/admin/articles";

  const [form, setForm] = useState<ArticleForm>(() => buildDefaultArticle(authorName));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagOptions, setTagOptions] = useState<AdminTagOption[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof ArticleForm) => (val: string) =>
    setForm((current) => ({ ...current, [key]: val }));

  const defaultTagName = useMemo(
    () => tagOptions[0]?.display_name || "Web",
    [tagOptions],
  );
  const selectableTagOptions = useMemo(() => {
    if (!form.tag) {
      return tagOptions;
    }
    const exists = tagOptions.some((item) => item.display_name === form.tag);
    if (exists) {
      return tagOptions;
    }
    return [{ slug_name: `legacy-${form.tag}`, display_name: `${form.tag}（已失效）` }, ...tagOptions];
  }, [form.tag, tagOptions]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!navigationState?.toast) {
      return;
    }
    setToast(navigationState.toast);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    window.setTimeout(() => setToast(null), 3500);
  }, [location.pathname, location.search, navigate, navigationState]);

  useEffect(() => {
    if (!navigationState?.refreshedFromTagManager || navigationState.toast) {
      return;
    }
    showToast("success", "已返回文章编辑页，请重新选择或确认标签");
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, navigate, navigationState]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setTagsLoading(true);
      const tagResult = await getArticleTagOptions();
      if (cancelled) {
        return;
      }
      if (!tagResult.success || !tagResult.data) {
        setTagsLoading(false);
        showToast("error", tagResult.error || "文章标签加载失败");
        return;
      }

      setTagOptions(tagResult.data);
      setTagsLoading(false);

      if (navigationState?.restoredDraft) {
        setForm({
          ...navigationState.restoredDraft,
          author: navigationState.restoredDraft.author || authorName,
          tag: navigationState.restoredDraft.tag || tagResult.data[0]?.display_name || "Web",
        });
        return;
      }

      if (!isEditMode) {
        setForm((current) => ({
          ...current,
          author: authorName,
          tag: current.tag || tagResult.data[0]?.display_name || "Web",
        }));
        return;
      }

      if (!id) {
        return;
      }
      setLoading(true);
      const detailResult = await getAdminArticleDetail(id);
      setLoading(false);
      if (cancelled) {
        return;
      }
      if (!detailResult.success || !detailResult.data) {
        showToast("error", detailResult.error || "文章详情加载失败");
        return;
      }

      const detail = detailResult.data;
      setForm({
        title: detail.title,
        author: detail.author || authorName,
        date: detail.date || new Date().toISOString().slice(0, 10),
        tag: detail.tags[0]?.display_name || detail.tag || tagResult.data[0]?.display_name || "Web",
        excerpt: detail.excerpt || "",
        coverUrl: "",
        content: detail.content,
      });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [authorName, id, isEditMode, navigationState]);

  const resetForm = () => {
    if (isEditMode && id) {
      void (async () => {
        const detailResult = await getAdminArticleDetail(id);
        if (!detailResult.success || !detailResult.data) {
          showToast("error", detailResult.error || "文章详情加载失败");
          return;
        }
        const detail = detailResult.data;
        setForm({
          title: detail.title,
          author: detail.author || authorName,
          date: detail.date || new Date().toISOString().slice(0, 10),
          tag: detail.tags[0]?.display_name || detail.tag || defaultTagName,
          excerpt: detail.excerpt || "",
          coverUrl: "",
          content: detail.content,
        });
      })();
      return;
    }
    setForm(buildDefaultArticle(authorName, defaultTagName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.tag || !form.content) {
      showToast("error", "请填写标题、标签和正文内容");
      return;
    }

    setSubmitting(true);
    const result = isEditMode && id ? await updateArticle(id, form) : await createArticle(form);
    setSubmitting(false);
    if (!result.success || !result.data) {
      showToast("error", result.error || (isEditMode ? "文章更新失败" : "文章创建失败"));
      return;
    }

    navigate(returnTo, {
      replace: true,
      state: {
        toast: {
          type: "success" as const,
          msg: result.data.waitForReview
            ? `文章已提交审核，内容 ID：${result.data.id}`
            : isEditMode
              ? `文章已更新，内容 ID：${result.data.id}`
              : `文章已发布成功，内容 ID：${result.data.id}`,
        },
      },
    });
  };

  const handleGoToTagManager = () => {
    navigate("/admin/article-tags", {
      state: {
        returnTo: `${location.pathname}${location.search}`,
        returnLabel: isEditMode ? "返回编辑文章" : "返回新建文章",
        articleDraft: form,
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
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">
            {isEditMode ? "编辑文章" : "新建文章"}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            编辑和新建都使用现有 `question(type=2)` 写接口。
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
          <Field label="文章标题" required>
            <Input value={form.title} onChange={set("title")} placeholder="请输入文章标题" />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="作者" hint="会按填写值显示在文章列表和详情页">
              <Input value={form.author} onChange={set("author")} placeholder="用户名" />
            </Field>
            <Field label="发布日期" hint="当前后端写接口暂不单独持久化此字段">
              <Input type="date" value={form.date} onChange={set("date")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="技术标签" required hint="优先按后端已有标签选择">
              <div className="flex flex-col gap-2">
                <Select
                  value={form.tag}
                  onChange={set("tag")}
                  options={
                    tagOptions.length > 0 || form.tag
                      ? selectableTagOptions
                      : [{ slug_name: "loading", display_name: tagsLoading ? "标签加载中..." : "暂无可用标签" }]
                  }
                />
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[12px] text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>{tagOptions.length > 0 ? "标签不合适？可以先去标签管理补充。" : "当前没有可用标签，请先创建标签。"}</span>
                  <button
                    type="button"
                    onClick={handleGoToTagManager}
                    className="inline-flex items-center gap-1 self-start rounded-md px-2 py-1 font-medium text-[#009EFF] transition-colors hover:bg-[#009EFF]/8 dark:text-[#33B1FF] dark:hover:bg-[#33B1FF]/10"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    去创建标签
                  </button>
                </div>
              </div>
            </Field>
            <Field label="封面图 URL" hint="当前后端文章写接口暂不支持落库">
              <Input value={form.coverUrl} onChange={set("coverUrl")} placeholder="https://..." />
            </Field>
          </div>

          <Field label="摘要" hint="当前列表摘要由后端 description/excerpt 规则生成，此字段暂不直接入库">
            <Textarea
              value={form.excerpt}
              onChange={set("excerpt")}
              placeholder="一句话描述文章内容"
              rows={2}
            />
          </Field>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-6 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
            当前文章后台继续复用现有 `question(type=2)` 写接口。实际落库字段为标题、正文和标签；作者会作为文章扩展信息单独保存，封面、摘要、发布日期暂不作为独立后端字段写入。
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              正文内容
              <span className="ml-2 text-[12px] font-normal text-slate-400">（Markdown）</span>
            </h3>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#009EFF] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-[#33B1FF]"
            >
              <Eye className="h-3.5 w-3.5" />
              全屏预览
            </button>
          </div>
          <MarkdownEditor
            value={form.content}
            onChange={set("content")}
            placeholder="请输入文章正文（支持 Markdown 语法）"
            minHeight={520}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009EFF] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] disabled:opacity-60 dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
          >
            <Save className="h-4 w-4" />
            {submitting ? "提交中…" : isEditMode ? "保存修改" : "发布文章"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isEditMode ? "恢复已保存版本" : "重置"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          正在加载文章内容...
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0B1120]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-[#0B1120]/90 sm:px-6">
              <span className="min-w-0 truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {form.title || "（未填写标题）"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
              <MarkdownRenderer content={form.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
