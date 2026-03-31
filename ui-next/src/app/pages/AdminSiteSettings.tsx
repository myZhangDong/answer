import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, Save, Upload, X } from "lucide-react";
import { uploadFile } from "../api/adminApi";
import {
  getAdminHomepageSettings,
  getSiteBrandingSettings,
  getSiteGeneralSettings,
  getSiteSeoSettings,
  type SiteBrandingSettings,
  type SiteGeneralSettings,
  type SiteHomepageBannerSettings,
  type SiteHomepageSettings,
  type SiteSeoSettings,
  updateAdminHomepageSettings,
  updateSiteBrandingSettings,
  updateSiteGeneralSettings,
  updateSiteSeoSettings,
} from "../api/siteSettingsApi";
import { useSiteInfo } from "../site/SiteInfoContext";
import { normalizeUploadedAssetUrl } from "../utils/assetUrl";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
      <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
        <h2 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label}
        {hint && <span className="ml-2 text-[12px] font-normal text-slate-400 dark:text-slate-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
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
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:ring-[#33B1FF]/40"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors ${
        checked
          ? "bg-[#009EFF]/10 text-[#009EFF] ring-1 ring-[#009EFF]/20 dark:bg-[#33B1FF]/10 dark:text-[#33B1FF] dark:ring-[#33B1FF]/20"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
      }`}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-[#009EFF] dark:bg-[#33B1FF]" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

function SaveButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-[#009EFF] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0089e0] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#33B1FF] dark:hover:bg-[#1fa8ff]"
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {loading ? "保存中..." : children}
    </button>
  );
}

function UploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  uploadType,
  onToast,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  uploadType: "branding-image" | "banner-image";
  onToast: (type: "success" | "error", msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const previewUrl = normalizeUploadedAssetUrl(value);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setUploading(true);
    const result = await uploadFile(file, uploadType);
    setUploading(false);

    if (!result.success || !result.data) {
      onToast("error", result.error || `${label}上传失败`);
      return;
    }

    onChange(result.data.url);
    onToast("success", `${label}上传成功`);
  };

  return (
    <Field label={label}>
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800 md:w-44">
            {previewUrl ? (
              <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <ImagePlus className="h-6 w-6" />
                <span className="text-[12px]">未上传</span>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <Input
              value={value}
              onChange={(nextValue) => onChange(normalizeUploadedAssetUrl(nextValue))}
              placeholder="可直接粘贴图片地址，或使用上传按钮"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "上传中..." : "上传图片"}
                <input type="file" accept={accept} className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                  清空
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Field>
  );
}

const DEFAULT_GENERAL: SiteGeneralSettings = {
  name: "",
  short_description: "",
  description: "",
  site_url: "",
  contact_email: "",
  check_update: true,
};

const DEFAULT_BRANDING: SiteBrandingSettings = {
  logo: "",
  mobile_logo: "",
  square_icon: "",
  favicon: "",
};

const DEFAULT_SEO: SiteSeoSettings = {
  permalink: 4,
  robots: "",
};

const DEFAULT_BANNER: SiteHomepageBannerSettings = {
  enabled: false,
  image_url: "",
  link_url: "",
};

const DEFAULT_HOMEPAGE: SiteHomepageSettings = {
  home_banner: { ...DEFAULT_BANNER },
  hot_articles_ad: { ...DEFAULT_BANNER },
};

export function AdminSiteSettings() {
  const { refreshSiteInfo } = useSiteInfo();
  const [general, setGeneral] = useState<SiteGeneralSettings>(DEFAULT_GENERAL);
  const [branding, setBranding] = useState<SiteBrandingSettings>(DEFAULT_BRANDING);
  const [seo, setSeo] = useState<SiteSeoSettings>(DEFAULT_SEO);
  const [homepage, setHomepage] = useState<SiteHomepageSettings>(DEFAULT_HOMEPAGE);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [generalResult, brandingResult, seoResult, homepageResult] = await Promise.allSettled([
          getSiteGeneralSettings(),
          getSiteBrandingSettings(),
          getSiteSeoSettings(),
          getAdminHomepageSettings(),
        ]);

        if (cancelled) {
          return;
        }

        setGeneral({
          ...DEFAULT_GENERAL,
          ...(generalResult.status === "fulfilled" ? generalResult.value : {}),
        });
        setBranding({
          ...DEFAULT_BRANDING,
          ...(brandingResult.status === "fulfilled" ? brandingResult.value : {}),
        });
        setSeo({
          ...DEFAULT_SEO,
          ...(seoResult.status === "fulfilled" ? seoResult.value : {}),
        });

        const homepageData = homepageResult.status === "fulfilled" ? homepageResult.value : DEFAULT_HOMEPAGE;
        setHomepage({
          ...DEFAULT_HOMEPAGE,
          ...homepageData,
          home_banner: {
            ...DEFAULT_BANNER,
            ...(homepageData?.home_banner || {}),
          },
          hot_articles_ad: {
            ...DEFAULT_BANNER,
            ...(homepageData?.hot_articles_ad || {}),
          },
        });

        const failedCount = [
          generalResult,
          brandingResult,
          seoResult,
          homepageResult,
        ].filter((result) => result.status === "rejected").length;
        if (failedCount > 0) {
          showToast("error", "部分配置加载失败，未加载项已使用默认值");
        }
      } catch (error) {
        if (!cancelled) {
          showToast("error", error instanceof Error ? error.message : "网站设置加载失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSection = async (key: string, action: () => Promise<unknown>, successMsg: string) => {
    setSavingKey(key);
    try {
      await action();
      await refreshSiteInfo();
      showToast("success", successMsg);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : `${successMsg}失败`);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
        <div className="rounded-2xl bg-white px-5 py-14 text-center text-[14px] text-slate-500 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:text-slate-400 dark:ring-slate-800 sm:px-6">
        正在加载网站设置...
      </div>
    );
  }

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

      <SectionCard title="基础信息" description="对应旧后台 General 配置。">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("general", () => updateSiteGeneralSettings(general), "基础信息已更新");
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="站点名称">
              <Input value={general.name} onChange={(value) => setGeneral((current) => ({ ...current, name: value }))} />
            </Field>
            <Field label="站点 URL">
              <Input value={general.site_url} onChange={(value) => setGeneral((current) => ({ ...current, site_url: value }))} />
            </Field>
          </div>
          <Field label="联系邮箱">
            <Input
              type="email"
              value={general.contact_email}
              onChange={(value) => setGeneral((current) => ({ ...current, contact_email: value }))}
            />
          </Field>
          <Field label="站点短描述">
            <Textarea
              rows={2}
              value={general.short_description}
              onChange={(value) => setGeneral((current) => ({ ...current, short_description: value }))}
            />
          </Field>
          <Field label="站点描述">
            <Textarea
              rows={4}
              value={general.description}
              onChange={(value) => setGeneral((current) => ({ ...current, description: value }))}
            />
          </Field>
          <Toggle
            checked={general.check_update}
            onChange={(value) => setGeneral((current) => ({ ...current, check_update: value }))}
            label="允许后台检查更新"
          />
          <div>
            <SaveButton loading={savingKey === "general"}>保存基础信息</SaveButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="品牌资源" description="配置站点图标和浏览器标签页资源。">
        <div className="flex flex-col gap-8">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void saveSection("branding", () => updateSiteBrandingSettings(branding), "品牌资源已更新");
            }}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <UploadField
                label="Square Icon"
                value={branding.square_icon}
                onChange={(value) => setBranding((current) => ({ ...current, square_icon: value }))}
                uploadType="branding-image"
                onToast={showToast}
              />
              <UploadField
                label="Favicon"
                value={branding.favicon}
                onChange={(value) => setBranding((current) => ({ ...current, favicon: value }))}
                accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                uploadType="branding-image"
                onToast={showToast}
              />
            </div>
            <div>
              <SaveButton loading={savingKey === "branding"}>保存品牌资源</SaveButton>
            </div>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="SEO" description="对应旧后台 SEO 配置。">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("seo", () => updateSiteSeoSettings(seo), "SEO 配置已更新");
          }}
        >
          <Field label="Permalink">
            <select
              value={String(seo.permalink)}
              onChange={(e) => setSeo((current) => ({ ...current, permalink: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
            >
              <option value="4">/questions/D1D1</option>
              <option value="3">/questions/D1D1/post-title</option>
              <option value="2">/questions/10010000000000001</option>
              <option value="1">/questions/10010000000000001/post-title</option>
            </select>
          </Field>
          <Field label="Robots">
            <Textarea value={seo.robots} onChange={(value) => setSeo((current) => ({ ...current, robots: value }))} rows={10} />
          </Field>
          <div>
            <SaveButton loading={savingKey === "seo"}>保存 SEO 配置</SaveButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="首页运营位" description="管理首页顶部 Banner 和“周热门文章”上方广告位。">
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("homepage", () => updateAdminHomepageSettings(homepage), "首页运营位已更新");
          }}
        >
          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">首页顶部 Banner</h3>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">前台首页顶部直接展示“图片 + 链接”的 Banner。</p>
              </div>
              <Toggle
                checked={homepage.home_banner.enabled}
                onChange={(value) =>
                  setHomepage((current) => ({
                    ...current,
                    home_banner: {
                      ...current.home_banner,
                      enabled: value,
                    },
                  }))
                }
                label={homepage.home_banner.enabled ? "已启用" : "已关闭"}
              />
            </div>
            <div className="grid gap-4">
              <UploadField
                label="Banner 图片"
                value={homepage.home_banner.image_url}
                onChange={(value) =>
                  setHomepage((current) => ({
                    ...current,
                    home_banner: {
                      ...current.home_banner,
                      image_url: value,
                    },
                  }))
                }
                uploadType="banner-image"
                onToast={showToast}
              />
              <Field label="点击链接">
                <Input
                  value={homepage.home_banner.link_url}
                  onChange={(value) =>
                    setHomepage((current) => ({
                      ...current,
                      home_banner: {
                        ...current.home_banner,
                        link_url: value,
                      },
                    }))
                  }
                  placeholder="支持站内相对路径或完整 URL"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">周热门文章广告位</h3>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">位于首页右侧“周热门文章”上方，未配置时直接隐藏。</p>
              </div>
              <Toggle
                checked={homepage.hot_articles_ad.enabled}
                onChange={(value) =>
                  setHomepage((current) => ({
                    ...current,
                    hot_articles_ad: {
                      ...current.hot_articles_ad,
                      enabled: value,
                    },
                  }))
                }
                label={homepage.hot_articles_ad.enabled ? "已启用" : "已关闭"}
              />
            </div>
            <div className="grid gap-4">
              <UploadField
                label="广告图片"
                value={homepage.hot_articles_ad.image_url}
                onChange={(value) =>
                  setHomepage((current) => ({
                    ...current,
                    hot_articles_ad: {
                      ...current.hot_articles_ad,
                      image_url: value,
                    },
                  }))
                }
                uploadType="banner-image"
                onToast={showToast}
              />
              <Field label="点击链接">
                <Input
                  value={homepage.hot_articles_ad.link_url}
                  onChange={(value) =>
                    setHomepage((current) => ({
                      ...current,
                      hot_articles_ad: {
                        ...current.hot_articles_ad,
                        link_url: value,
                      },
                    }))
                  }
                  placeholder="支持站内相对路径或完整 URL"
                />
              </Field>
            </div>
          </div>

          <div>
            <SaveButton loading={savingKey === "homepage"}>保存首页运营位</SaveButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
