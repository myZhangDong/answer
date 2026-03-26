import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Save, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createVideo, getAdminVideoDetail, updateVideo, type VideoWritePayload } from "../api/adminApi";
import { useAdminAuth } from "../auth/AdminAuthContext";

const VIDEO_CATEGORIES = ["基础篇", "进阶篇", "群组篇", "AI篇"];

interface VideoForm {
  title: string;
  category: string;
  cover: string;
  isRecommend: boolean;
  isShow: boolean;
  duration: string;
  description: string;
  content: string;
  authorAvatar: string;
  authorName: string;
  authorIntro: string;
  embedCode: string;
  externalLink: string;
}

function buildDefaultVideo(authorName = ""): VideoForm {
  return {
    title: "",
    category: "基础篇",
    cover: "",
    isRecommend: false,
    isShow: true,
    duration: "",
    description: "",
    content: "",
    authorAvatar: "",
    authorName,
    authorIntro: "",
    embedCode: "",
    externalLink: "",
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

export function AdminVideoEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAdminAuth();
  const authorName = user?.display_name || user?.username || user?.e_mail || "";
  const returnTo =
    ((location.state as { from?: string } | null)?.from as string | undefined) || "/admin/videos";

  const [form, setForm] = useState<VideoForm>(() => buildDefaultVideo(authorName));
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const set = (key: keyof VideoForm) => (value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;

    if (!isEditMode || !id) {
      setForm(buildDefaultVideo(authorName));
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      setLoading(true);
      const result = await getAdminVideoDetail(id);
      if (cancelled) {
        return;
      }
      setLoading(false);
      if (!result.success || !result.data) {
        showToast("error", result.error || "视频详情加载失败");
        return;
      }
      const detail = result.data;
      setForm({
        title: detail.title,
        category: detail.category || VIDEO_CATEGORIES[0],
        cover: detail.cover,
        isRecommend: detail.isRecommend,
        isShow: detail.isShow,
        duration: detail.durationSeconds ? String(detail.durationSeconds) : "",
        description: detail.description,
        content: detail.content,
        authorAvatar: detail.authorAvatar,
        authorName: detail.author || authorName,
        authorIntro: detail.authorIntro,
        embedCode: detail.embedCode,
        externalLink: detail.externalLink,
      });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [authorName, id, isEditMode]);

  const resetForm = () => {
    if (!isEditMode || !id) {
      setForm(buildDefaultVideo(authorName));
      return;
    }

    void (async () => {
      const result = await getAdminVideoDetail(id);
      if (!result.success || !result.data) {
        showToast("error", result.error || "视频详情加载失败");
        return;
      }
      const detail = result.data;
      setForm({
        title: detail.title,
        category: detail.category || VIDEO_CATEGORIES[0],
        cover: detail.cover,
        isRecommend: detail.isRecommend,
        isShow: detail.isShow,
        duration: detail.durationSeconds ? String(detail.durationSeconds) : "",
        description: detail.description,
        content: detail.content,
        authorAvatar: detail.authorAvatar,
        authorName: detail.author || authorName,
        authorIntro: detail.authorIntro,
        embedCode: detail.embedCode,
        externalLink: detail.externalLink,
      });
    })();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.authorName.trim()) {
      showToast("error", "请填写视频标题和作者名称");
      return;
    }

    const duration = form.duration.trim() ? Number(form.duration) : 0;
    if (Number.isNaN(duration) || duration < 0) {
      showToast("error", "视频时长需要填写为非负整数秒数");
      return;
    }

    const payload: VideoWritePayload = {
      title: form.title.trim(),
      category: form.category,
      cover: form.cover.trim(),
      isRecommend: form.isRecommend,
      isShow: form.isShow,
      duration,
      description: form.description.trim(),
      content: form.content,
      authorAvatar: form.authorAvatar.trim(),
      authorName: form.authorName.trim(),
      authorIntro: form.authorIntro.trim(),
      embedCode: form.embedCode,
      externalLink: form.externalLink.trim(),
    };

    setSubmitting(true);
    const result = isEditMode && id ? await updateVideo(id, payload) : await createVideo(payload);
    setSubmitting(false);
    if (!result.success) {
      showToast("error", result.error || (isEditMode ? "视频更新失败" : "视频创建失败"));
      return;
    }

    navigate(returnTo, {
      replace: true,
      state: {
        toast: {
          type: "success" as const,
          msg: isEditMode
            ? `视频已更新${result.data?.id ? `，内容 ID：${result.data.id}` : ""}`
            : `视频已创建${result.data?.id ? `，内容 ID：${result.data.id}` : ""}`,
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

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">
            {isEditMode ? "编辑视频" : "新建视频"}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            直接复用现有 `/answer/api/v1/video/*` 管理接口。
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center text-[14px] text-slate-500 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:text-slate-400 dark:ring-slate-800">
          正在加载视频详情...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800">
            <Field label="视频标题" required>
              <Input value={form.title} onChange={set("title")} placeholder="请输入视频标题" />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="作者名称" required hint="默认取当前管理员信息">
                <Input value={form.authorName} onChange={set("authorName")} placeholder="请输入作者名称" />
              </Field>
              <Field label="视频分类" required hint="会映射到后端 type 字段">
                <Select
                  value={form.category}
                  onChange={set("category")}
                  options={VIDEO_CATEGORIES.map((item) => ({ label: item, value: item }))}
                />
              </Field>
              <Field label="时长（秒）" hint="前台会自动格式化为 MM:SS">
                <Input value={form.duration} onChange={set("duration")} placeholder="例如 125" type="number" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="封面图 URL">
                <Input value={form.cover} onChange={set("cover")} placeholder="https://..." />
              </Field>
              <Field label="外链地址" hint="没有嵌入代码时可作为播放跳转地址">
                <Input value={form.externalLink} onChange={set("externalLink")} placeholder="https://..." />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="作者头像 URL">
                <Input value={form.authorAvatar} onChange={set("authorAvatar")} placeholder="https://..." />
              </Field>
              <Field label="作者简介">
                <Input value={form.authorIntro} onChange={set("authorIntro")} placeholder="一句话介绍作者" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="推荐状态">
                <Select
                  value={form.isRecommend ? "true" : "false"}
                  onChange={(value) => set("isRecommend")(value === "true")}
                  options={[
                    { label: "普通", value: "false" },
                    { label: "推荐", value: "true" },
                  ]}
                />
              </Field>
              <Field label="显示状态">
                <Select
                  value={form.isShow ? "true" : "false"}
                  onChange={(value) => set("isShow")(value === "true")}
                  options={[
                    { label: "显示", value: "true" },
                    { label: "隐藏", value: "false" },
                  ]}
                />
              </Field>
            </div>

            <Field label="视频简介">
              <Textarea value={form.description} onChange={set("description")} placeholder="简要描述视频内容" rows={3} />
            </Field>

            <Field label="嵌入代码" hint="填写 iframe/embed HTML 时，前台优先按嵌入播放器渲染">
              <Textarea value={form.embedCode} onChange={set("embedCode")} placeholder="<iframe ... />" rows={5} />
            </Field>

            <Field label="正文内容" hint="支持 Markdown，展示在视频详情页说明区">
              <Textarea value={form.content} onChange={set("content")} placeholder="请输入视频正文或补充说明" rows={12} />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#009EFF] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] disabled:opacity-60 dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
            >
              <Save className="h-4 w-4" />
              {submitting ? "提交中..." : isEditMode ? "保存视频" : "创建视频"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
