import { useState } from "react";
import {
  FileText,
  Video,
  FolderGit2,
  Lock,
  LogOut,
  Upload,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { LogoSvg } from "../components/LogoSvg";
import type { ArticleTag } from "../api/types";

// ── 简易鉴权 ────────────────────────────────────────────────────
const ADMIN_PASSWORD = "easemob2025"; // 演示用，生产环境请接真实认证

// ── 类型 ────────────────────────────────────────────────────────
type Tab = "article" | "video" | "project";

interface ArticleForm {
  title: string;
  author: string;
  date: string;
  tag: ArticleTag;
  excerpt: string;
  coverUrl: string;
  content: string;
}

interface VideoForm {
  title: string;
  author: string;
  date: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}

interface ProjectForm {
  name: string;
  description: string;
  language: string;
  tags: string;
  repo: string;
  iconUrl: string;
}

const ARTICLE_TAGS: ArticleTag[] = [
  "Web", "iOS", "Android", "Server", "Uniapp", "React Native",
];
const VIDEO_CATEGORIES = ["基础篇", "进阶篇", "群组篇", "AI篇"];

// ── 子组件：输入框 ───────────────────────────────────────────────
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
        {required && <span className="text-red-500 ml-0.5">*</span>}
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
      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:focus:ring-[#33B1FF]/40 transition"
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
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:focus:ring-[#33B1FF]/40 transition cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
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
      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:focus:ring-[#33B1FF]/40 resize-none transition"
    />
  );
}

// ── 文章表单 ────────────────────────────────────────────────────
const defaultArticle: ArticleForm = {
  title: "",
  author: "",
  date: new Date().toISOString().slice(0, 10),
  tag: "Web",
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

function ArticleFormPanel() {
  const [form, setForm] = useState<ArticleForm>(defaultArticle);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof ArticleForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.content) {
      showToast("error", "请填写标题、作者和正文内容");
      return;
    }
    setSubmitting(true);
    // TODO: 调用 createArticle(form) 接口
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    showToast("success", "文章已提交（接口桩模式，实际未写入）");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* 基础信息 */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] ring-1 ring-slate-100/80 dark:ring-slate-800 p-6 flex flex-col gap-5">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          基础信息
        </h3>
        <Field label="文章标题" required>
          <Input value={form.title} onChange={set("title")} placeholder="请输入文章标题" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="作者" required>
            <Input value={form.author} onChange={set("author")} placeholder="用户名" />
          </Field>
          <Field label="发布日期" required>
            <Input type="date" value={form.date} onChange={set("date")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="技术标签" required>
            <Select value={form.tag} onChange={set("tag")} options={ARTICLE_TAGS} />
          </Field>
          <Field label="封面图 URL" hint="可选">
            <Input value={form.coverUrl} onChange={set("coverUrl")} placeholder="https://..." />
          </Field>
        </div>

        <Field label="摘要" hint="建议 ≤ 120 字，列表页展示" required>
          <Textarea
            value={form.excerpt}
            onChange={set("excerpt")}
            placeholder="一句话描述文章内容"
            rows={2}
          />
        </Field>
      </div>

      {/* Markdown 编辑器 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            正文内容
            <span className="ml-2 text-[12px] font-normal text-slate-400">（Markdown）</span>
          </h3>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
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

      {/* 提交 */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#009EFF] hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff] text-white text-[14px] font-medium transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          {submitting ? "提交中…" : "发布文章"}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultArticle)}
          className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          重置
        </button>
      </div>

      {/* 全屏预览 Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 backdrop-blur-sm">
          <div className="flex-1 bg-white dark:bg-[#0B1120] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur border-b border-slate-100 dark:border-slate-800">
              <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {form.title || "（未填写标题）"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-w-3xl mx-auto px-6 py-10">
              <MarkdownRenderer content={form.content} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// ── 视频表单 ────────────────────────────────────────────────────
const defaultVideo: VideoForm = {
  title: "",
  author: "",
  date: new Date().toISOString().slice(0, 10),
  duration: "",
  category: "基础篇",
  thumbnail: "",
  videoUrl: "",
  description: "",
};

function VideoFormPanel() {
  const [form, setForm] = useState<VideoForm>(defaultVideo);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof VideoForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      showToast("error", "请填写视频标题和作者");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    showToast("success", "视频已提交（接口桩模式，实际未写入）");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-[#111827] ring-1 ring-slate-100/80 dark:ring-slate-800 p-6 flex flex-col gap-5">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          视频信息
        </h3>
        <Field label="视频标题" required>
          <Input value={form.title} onChange={set("title")} placeholder="请输入视频标题" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="作者" required>
            <Input value={form.author} onChange={set("author")} placeholder="用户名" />
          </Field>
          <Field label="发布日期">
            <Input type="date" value={form.date} onChange={set("date")} />
          </Field>
          <Field label="时长" hint="MM:SS">
            <Input value={form.duration} onChange={set("duration")} placeholder="12:45" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="分类" required>
            <Select value={form.category} onChange={set("category")} options={VIDEO_CATEGORIES} />
          </Field>
          <Field label="封面图 URL">
            <Input value={form.thumbnail} onChange={set("thumbnail")} placeholder="https://..." />
          </Field>
        </div>
        <Field label="视频地址">
          <Input value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://..." />
        </Field>
        <Field label="视频简介">
          <Textarea value={form.description} onChange={set("description")} placeholder="简要描述视频内容" rows={3} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#009EFF] hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff] text-white text-[14px] font-medium transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          {submitting ? "提交中…" : "发布视频"}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultVideo)}
          className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          重置
        </button>
      </div>
    </form>
  );
}

// ── 开源项目表单 ─────────────────────────────────────────────────
const defaultProject: ProjectForm = {
  name: "",
  description: "",
  language: "",
  tags: "",
  repo: "",
  iconUrl: "",
};

function ProjectFormPanel() {
  const [form, setForm] = useState<ProjectForm>(defaultProject);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof ProjectForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.repo) {
      showToast("error", "请填写项目名称和仓库路径");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    showToast("success", "项目已提交（接口桩模式，实际未写入）");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-[#111827] ring-1 ring-slate-100/80 dark:ring-slate-800 p-6 flex flex-col gap-5">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          项目信息
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="项目名称" required>
            <Input value={form.name} onChange={set("name")} placeholder="ChatUI-React" />
          </Field>
          <Field label="主编程语言">
            <Input value={form.language} onChange={set("language")} placeholder="TypeScript" />
          </Field>
        </div>
        <Field label="仓库路径" required hint="格式：org/repo">
          <Input value={form.repo} onChange={set("repo")} placeholder="easemob/chatui-react" />
        </Field>
        <Field label="技术标签" hint="逗号分隔，如：React, UI Kit, IM">
          <Input value={form.tags} onChange={set("tags")} placeholder="React, UI Kit, IM" />
        </Field>
        <Field label="图标 URL" hint="可选，建议 SVG 或方形图片">
          <Input value={form.iconUrl} onChange={set("iconUrl")} placeholder="https://..." />
        </Field>
        <Field label="项目简介">
          <Textarea value={form.description} onChange={set("description")} placeholder="简要描述项目功能与特点" rows={3} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#009EFF] hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff] text-white text-[14px] font-medium transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          {submitting ? "提交中…" : "发布项目"}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultProject)}
          className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          重置
        </button>
      </div>
    </form>
  );
}

// ── 主页面 ───────────────────────────────────────────────────────
export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("article");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("密码错误，请重试");
    }
  };

  // ── 登录门 ──
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <LogoSvg className="h-8 w-auto" />
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#111827] ring-1 ring-slate-100/80 dark:ring-slate-800 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 mb-6">
              <Lock className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" />
              <h1 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100">
                管理后台
              </h1>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  管理员密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:focus:ring-[#33B1FF]/40 transition"
                />
                {error && (
                  <p className="text-[13px] text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#009EFF] hover:bg-[#0089e0] dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff] text-white text-[14px] font-medium transition-colors"
              >
                登录
              </button>
              <p className="text-center text-[12px] text-slate-400 dark:text-slate-600">
                演示密码：easemob2025
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── 管理界面 ──
  const TABS = [
    { key: "article" as Tab, label: "发布文章", icon: FileText },
    { key: "video" as Tab, label: "发布视频", icon: Video },
    { key: "project" as Tab, label: "发布项目", icon: FolderGit2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#111827]/90 backdrop-blur border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <LogoSvg className="h-7 w-auto" />
          <span className="px-2 py-0.5 rounded-md bg-[#009EFF]/10 dark:bg-[#33B1FF]/10 text-[12px] font-medium text-[#009EFF] dark:text-[#33B1FF]">
            管理后台
          </span>
          <nav className="flex items-center gap-1 ml-6">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  tab === key
                    ? "bg-[#009EFF]/10 dark:bg-[#33B1FF]/10 text-[#009EFF] dark:text-[#33B1FF]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setAuthed(false)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            退出
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === "article" && <ArticleFormPanel />}
        {tab === "video" && <VideoFormPanel />}
        {tab === "project" && <ProjectFormPanel />}
      </main>
    </div>
  );
}
