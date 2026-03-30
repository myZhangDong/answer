import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Save, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createProject, getAdminProjectDetail, updateProject, type ProjectWritePayload } from "../api/adminApi";

const CODE_TYPE_OPTIONS = [
  { label: "Web", value: "1" },
  { label: "Mobile", value: "2" },
  { label: "Desktop", value: "3" },
];

interface ProjectForm {
  title: string;
  description: string;
  cover: string;
  content: string;
  codeType: string;
  tagsInput: string;
  githubUrl: string;
  giteeUrl: string;
  questionId: string;
}

function buildDefaultProject(): ProjectForm {
  return {
    title: "",
    description: "",
    cover: "",
    content: "",
    codeType: "1",
    tagsInput: "",
    githubUrl: "",
    giteeUrl: "",
    questionId: "",
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
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:ring-[#33B1FF]/40"
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
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProjectEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const returnTo =
    ((location.state as { from?: string } | null)?.from as string | undefined) || "/admin/projects";

  const [form, setForm] = useState<ProjectForm>(() => buildDefaultProject());
  const [extraRepoUrlMap, setExtraRepoUrlMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof ProjectForm) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  const repoSummary = useMemo(() => {
    const repoEntries = {
      ...extraRepoUrlMap,
      ...(form.githubUrl.trim() ? { github: form.githubUrl.trim() } : {}),
      ...(form.giteeUrl.trim() ? { gitee: form.giteeUrl.trim() } : {}),
    };
    return Object.keys(repoEntries).length;
  }, [extraRepoUrlMap, form.giteeUrl, form.githubUrl]);

  useEffect(() => {
    let cancelled = false;

    if (!isEditMode || !id) {
      setForm(buildDefaultProject());
      setExtraRepoUrlMap({});
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      setLoading(true);
      const result = await getAdminProjectDetail(id);
      if (cancelled) {
        return;
      }
      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "项目详情加载失败");
        return;
      }

      const detail = result.data;
      const repoUrlMap = detail.repoUrlMap || {};
      const { github = "", gitee = "", ...rest } = repoUrlMap;
      setExtraRepoUrlMap(rest);
      setForm({
        title: detail.title,
        description: detail.description,
        cover: detail.cover,
        content: detail.content,
        codeType: String(detail.codeType || 1),
        tagsInput: detail.tags.join(", "),
        githubUrl: github,
        giteeUrl: gitee,
        questionId: detail.questionId,
      });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  const resetForm = () => {
    if (!isEditMode || !id) {
      setForm(buildDefaultProject());
      setExtraRepoUrlMap({});
      return;
    }

    void (async () => {
      const result = await getAdminProjectDetail(id);
      if (!result.success || !result.data) {
        showToast("error", result.error || "项目详情加载失败");
        return;
      }

      const detail = result.data;
      const repoUrlMap = detail.repoUrlMap || {};
      const { github = "", gitee = "", ...rest } = repoUrlMap;
      setExtraRepoUrlMap(rest);
      setForm({
        title: detail.title,
        description: detail.description,
        cover: detail.cover,
        content: detail.content,
        codeType: String(detail.codeType || 1),
        tagsInput: detail.tags.join(", "),
        githubUrl: github,
        giteeUrl: gitee,
        questionId: detail.questionId,
      });
    })();
  };

  const buildPayload = (): ProjectWritePayload | null => {
    const tags = parseTags(form.tagsInput);
    const repoUrlMap = {
      ...extraRepoUrlMap,
      ...(form.githubUrl.trim() ? { github: form.githubUrl.trim() } : {}),
      ...(form.giteeUrl.trim() ? { gitee: form.giteeUrl.trim() } : {}),
    };

    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      showToast("error", "请填写项目名称、简介和正文内容");
      return null;
    }
    if (!isEditMode && !form.questionId.trim()) {
      showToast("error", "创建项目时必须填写关联文章 ID");
      return null;
    }
    if (Object.keys(repoUrlMap).length === 0) {
      showToast("error", "请至少填写一个仓库地址");
      return null;
    }

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      cover: form.cover.trim(),
      content: form.content,
      repoUrlMap,
      codeType: Number(form.codeType),
      tags,
      questionId: form.questionId.trim(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setSubmitting(true);
    const result = isEditMode && id ? await updateProject(id, payload) : await createProject(payload);
    setSubmitting(false);
    if (!result.success) {
      showToast("error", result.error || (isEditMode ? "项目更新失败" : "项目创建失败"));
      return;
    }

    navigate(returnTo, {
      replace: true,
      state: {
        toast: {
          type: "success" as const,
          msg: isEditMode ? "项目已更新" : "项目已创建",
        },
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
            {isEditMode ? "编辑项目" : "新建项目"}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            直接复用现有 `/answer/api/v1/project*` 管理接口。
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

      {loading ? (
        <div className="rounded-2xl bg-white px-5 py-12 text-center text-[14px] text-slate-500 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:text-slate-400 dark:ring-slate-800 sm:px-6">
          正在加载项目详情...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
            <Field label="项目名称" required>
              <Input value={form.title} onChange={set("title")} placeholder="请输入项目名称" />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="代码类型" required>
                <Select value={form.codeType} onChange={set("codeType")} options={CODE_TYPE_OPTIONS} />
              </Field>
              <Field
                label="关联文章 ID"
                required={!isEditMode}
                hint={isEditMode ? "创建后不再修改，仅作展示" : "当前后端创建项目必须显式关联一篇文章"}
              >
                <Input
                  value={form.questionId}
                  onChange={set("questionId")}
                  placeholder="请输入文章 ID"
                  disabled={isEditMode}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="封面图 URL">
                <Input value={form.cover} onChange={set("cover")} placeholder="https://..." />
              </Field>
              <Field label="标签" hint="多个标签使用英文逗号分隔">
                <Input value={form.tagsInput} onChange={set("tagsInput")} placeholder="React, TypeScript, Demo" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="GitHub 仓库地址" required={repoSummary === 0}>
                <Input value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/org/repo" />
              </Field>
              <Field label="Gitee 仓库地址">
                <Input value={form.giteeUrl} onChange={set("giteeUrl")} placeholder="https://gitee.com/org/repo" />
              </Field>
            </div>

            <Field label="项目简介" required>
              <Textarea value={form.description} onChange={set("description")} placeholder="一句话描述项目定位与用途" rows={3} />
            </Field>

            <Field label="项目正文" required hint="支持 Markdown，前台详情页会直接展示">
              <Textarea value={form.content} onChange={set("content")} placeholder="请输入项目正文内容" rows={14} />
            </Field>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009EFF] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] disabled:opacity-60 dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
            >
              <Save className="h-4 w-4" />
              {submitting ? "提交中..." : isEditMode ? "保存项目" : "创建项目"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              重置
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
