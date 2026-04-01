import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Phone, RefreshCw, ShieldCheck, User, X } from "lucide-react";
import { ApiError } from "../api/client";
import { fetchDemoFormCaptcha, submitProjectDemoLead } from "../api/contentApi";
import { ensureUtmHelperScript } from "../utils/utmHelper";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  /** 后台配置的 Demo 示例网址，验证通过后打开 */
  demoUrl: string;
}

const PHONE_REG = /^1[3-9]\d{9}$/;

type FormErrorField = {
  error_field?: string;
  error_msg?: string;
};

export function DemoModal({ open, onClose, projectId, projectName, demoUrl }: DemoModalProps) {
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [captchaID, setCaptchaID] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaLoadError, setCaptchaLoadError] = useState("");

  // submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaLoadError("");
    setCaptchaError("");
    setCaptchaCode("");
    try {
      const challenge = await fetchDemoFormCaptcha();
      setCaptchaID(challenge.captchaId);
      setCaptchaImg(challenge.captchaImg);
      if (!challenge.verify || !challenge.captchaId || !challenge.captchaImg) {
        setCaptchaLoadError("验证码加载失败，请稍后重试");
      }
    } catch (error) {
      setCaptchaLoadError(error instanceof Error ? error.message : "验证码加载失败，请稍后重试");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    setFullName("");
    setFullNameError("");
    setPhone("");
    setPhoneError("");
    setCaptchaID("");
    setCaptchaImg("");
    setCaptchaCode("");
    setCaptchaError("");
    setCaptchaLoadError("");
    setSubmitting(false);
    setSubmitError("");
    void ensureUtmHelperScript();
    void loadCaptcha();
  }, [open]);

  const canSubmit = Boolean(fullName.trim() && phone && captchaCode && captchaID && !captchaLoading);

  const handleSubmit = async () => {
    setFullNameError("");
    setPhoneError("");
    setCaptchaError("");
    setSubmitError("");
    if (!fullName.trim()) {
      setFullNameError("请输入姓名");
      return;
    }
    if (!PHONE_REG.test(phone)) {
      setPhoneError("请输入正确的11位中国手机号");
      return;
    }
    if (!captchaCode.trim()) {
      setCaptchaError("请输入图片验证码");
      return;
    }
    if (!captchaID) {
      setSubmitError("验证码未加载完成，请刷新后重试");
      return;
    }
    setSubmitting(true);
    try {
      await submitProjectDemoLead({
        projectId,
        fullName: fullName.trim(),
        phone,
        captchaId: captchaID,
        captchaCode: captchaCode.trim(),
      });
      window.open(demoUrl, "_blank", "noopener,noreferrer");
      onClose();
    } catch (error) {
      const fieldErrors = error instanceof ApiError && Array.isArray(error.payload?.data)
        ? (error.payload.data as FormErrorField[])
        : [];
      const captchaFieldError = fieldErrors.find((item) => item.error_field === "captcha_code");
      if (captchaFieldError?.error_msg) {
        setCaptchaError(captchaFieldError.error_msg);
        void loadCaptcha();
      } else {
        setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后重试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={onClose}>
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* modal */}
      <div
        className="relative w-full max-w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-[#009EFF]/10 dark:bg-[#33B1FF]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100">获取 Demo 示例</h2>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            请完成图片验证以获取 <span className="font-medium text-slate-700 dark:text-slate-300">{projectName}</span> 的 Demo 示例资源
          </p>
        </div>

        {/* form */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">姓名</label>
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
              fullNameError
                ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus-within:border-[#009EFF] dark:focus-within:border-[#33B1FF]"
            }`}>
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                maxLength={100}
                placeholder="请输入姓名"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fullNameError) setFullNameError("");
                }}
                className="flex-1 bg-transparent outline-none text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            {fullNameError && (
              <p className="flex items-center gap-1 mt-1.5 text-[12px] text-red-500 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {fullNameError}
              </p>
            )}
          </div>

          {/* phone */}
          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">手机号</label>
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
              phoneError
                ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus-within:border-[#009EFF] dark:focus-within:border-[#33B1FF]"
            }`}>
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="text-[14px] text-slate-500 dark:text-slate-400 shrink-0 select-none">+86</span>
              <input
                type="tel"
                maxLength={11}
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                className="flex-1 bg-transparent outline-none text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            {phoneError && (
              <p className="flex items-center gap-1 mt-1.5 text-[12px] text-red-500 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {phoneError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">图片验证码</label>
            <div className="flex items-stretch gap-2">
              <div className={`flex-1 flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                captchaError
                  ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                  : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus-within:border-[#009EFF] dark:focus-within:border-[#33B1FF]"
              }`}>
                <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  maxLength={8}
                  placeholder="请输入图片验证码"
                  value={captchaCode}
                  onChange={(e) => {
                    setCaptchaCode(e.target.value.trim());
                    if (captchaError) setCaptchaError("");
                  }}
                  className="flex-1 bg-transparent outline-none text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                disabled={captchaLoading}
                className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50 disabled:cursor-not-allowed"
              >
                {captchaLoading ? (
                  <div className="flex h-[44px] w-[120px] items-center justify-center text-slate-400">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  </div>
                ) : captchaImg ? (
                  <img src={captchaImg} alt="图片验证码" className="h-[44px] w-[120px] object-cover" />
                ) : (
                  <div className="flex h-[44px] w-[120px] items-center justify-center text-[12px] text-slate-400">
                    点击刷新
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                disabled={captchaLoading}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-[#009EFF] hover:text-[#009EFF] disabled:cursor-not-allowed disabled:text-slate-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-[#33B1FF] dark:hover:text-[#33B1FF]"
              >
                <RefreshCw className={`h-4 w-4 ${captchaLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {captchaLoadError ? (
              <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {captchaLoadError}
              </p>
            ) : null}
            {captchaError ? (
              <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {captchaError}
              </p>
            ) : null}
          </div>

          {/* submit error */}
          {submitError && (
            <p className="flex items-center gap-1 text-[13px] text-red-500 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </p>
          )}

          {/* submit button */}
          <button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-lg text-[15px] font-medium transition-all duration-300 ${
              canSubmit && !submitting
                ? "bg-[#009EFF] dark:bg-[#33B1FF] text-white hover:bg-blue-600 dark:hover:bg-blue-400 shadow-md shadow-[#009EFF]/20 dark:shadow-[#33B1FF]/20 active:scale-[0.98]"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "验证中..." : "立即获取"}
          </button>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            提交即表示您同意接收环信开发者社区的相关信息。图片验证码仅用于身份核实，提交成功后将打开该项目的 Demo 示例链接。
          </p>
        </div>
      </div>
    </div>
  );
}
