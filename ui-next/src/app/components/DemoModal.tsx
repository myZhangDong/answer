import { useState, useRef, useCallback, useEffect } from "react";
import { X, Phone, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

// --- 内存级验证状态（页面刷新/关闭自动清空，有效期 1 小时）---
let _verifiedAt: number | null = null;
const VERIFIED_TTL = 60 * 60 * 1000; // 1 hour in ms

export function isDemoVerified(): boolean {
  if (_verifiedAt === null) return false;
  return Date.now() - _verifiedAt < VERIFIED_TTL;
}

function markDemoVerified() {
  _verifiedAt = Date.now();
}
// --- end ---

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  /** 后台配置的 Demo 示例网址，验证通过后打开 */
  demoUrl: string;
}

// 模拟发送验证码（桩接口，研发对接后端时替换）
async function sendSmsCode(_phone: string): Promise<{ success: boolean; error?: string }> {
  // TODO: 对接后端短信发送接口
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}

// 模拟校验验证码（桩接口）
async function verifySmsCode(_phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  // TODO: 对接后端验证码校验接口
  return new Promise((resolve) =>
    setTimeout(() => {
      if (code === "888888") resolve({ success: true });
      else resolve({ success: false, error: "验证码错误，请重新输入" });
    }, 600)
  );
}

const PHONE_REG = /^1[3-9]\d{9}$/;

export function DemoModal({ open, onClose, projectName, demoUrl }: DemoModalProps) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // slider
  const [sliderVerified, setSliderVerified] = useState(false);
  const [sliderError, setSliderError] = useState("");
  const [sliderX, setSliderX] = useState(0);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // sms
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState("");
  const [smsError, setSmsError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  // submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // reset on open
  useEffect(() => {
    if (open) {
      setPhone("");
      setPhoneError("");
      setSliderVerified(false);
      setSliderError("");
      setSliderX(0);
      setSmsSent(false);
      setSmsCode("");
      setSmsError("");
      setCountdown(0);
      setSubmitting(false);
      setSubmitError("");
    }
  }, [open]);

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // --- slider logic ---
  const THRESHOLD = 0.9;

  const handleSliderStart = useCallback((clientX: number) => {
    dragging.current = true;
    setSliderError("");
    const track = sliderTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const startX = clientX;
    const maxX = rect.width - 44;

    const onMove = (cx: number) => {
      if (!dragging.current) return;
      const dx = Math.max(0, Math.min(cx - startX, maxX));
      setSliderX(dx);
    };

    const onEnd = (cx: number) => {
      dragging.current = false;
      const dx = Math.max(0, Math.min(cx - startX, maxX));
      if (dx / maxX >= THRESHOLD) {
        setSliderX(maxX);
        setSliderVerified(true);
      } else {
        setSliderX(0);
        setSliderError("请将滑块拖到最右侧");
      }
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
    };

    const mouseMove = (e: MouseEvent) => onMove(e.clientX);
    const mouseUp = (e: MouseEvent) => onEnd(e.clientX);
    const touchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const touchEnd = (e: TouchEvent) => onEnd(e.changedTouches[0].clientX);

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", touchEnd);
  }, []);

  // --- send sms ---
  const handleSendSms = async () => {
    setPhoneError("");
    if (!PHONE_REG.test(phone)) {
      setPhoneError("请输入正确的11位中国手机号");
      return;
    }
    if (!sliderVerified) {
      setSliderError("请先完成滑动验证");
      return;
    }
    setSending(true);
    const res = await sendSmsCode(phone);
    setSending(false);
    if (res.success) {
      setSmsSent(true);
      setCountdown(60);
    } else {
      setSmsError(res.error || "发送失败，请稍后重试");
    }
  };

  // auto-send sms after slider verified
  useEffect(() => {
    if (sliderVerified && PHONE_REG.test(phone) && !smsSent) {
      handleSendSms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderVerified]);

  // --- submit ---
  const canSubmit = PHONE_REG.test(phone) && sliderVerified && smsCode.length === 6;

  const handleSubmit = async () => {
    setPhoneError("");
    setSmsError("");
    setSubmitError("");
    if (!PHONE_REG.test(phone)) {
      setPhoneError("请输入正确的11位中国手机号");
      return;
    }
    if (!sliderVerified) {
      setSliderError("请先完成滑动验证");
      return;
    }
    if (smsCode.length !== 6) {
      setSmsError("请输入6位短信验证码");
      return;
    }
    setSubmitting(true);
    const res = await verifySmsCode(phone, smsCode);
    setSubmitting(false);
    if (res.success) {
      markDemoVerified();
      window.open(demoUrl, "_blank", "noopener,noreferrer");
      onClose();
    } else {
      setSmsError(res.error || "验证失败");
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
            请完成手机验证以获取 <span className="font-medium text-slate-700 dark:text-slate-300">{projectName}</span> 的 Demo 示例资源
          </p>
        </div>

        {/* form */}
        <div className="px-6 pb-6 flex flex-col gap-4">
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

          {/* slider verification or sms code */}
          {!sliderVerified ? (
            <div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">滑动验证</label>
              <div
                ref={sliderTrackRef}
                className={`relative h-[44px] rounded-lg overflow-hidden select-none ${
                  sliderError
                    ? "border border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                    : "border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                }`}
              >
                {/* filled area */}
                <div
                  className="absolute inset-y-0 left-0 bg-[#009EFF]/10 dark:bg-[#33B1FF]/10 transition-none"
                  style={{ width: sliderX + 44 }}
                />
                {/* hint text */}
                <div className="absolute inset-0 flex items-center justify-center text-[13px] text-slate-400 dark:text-slate-500 pointer-events-none">
                  {sliderX === 0 && "请按住滑块，拖到最右边"}
                </div>
                {/* slider thumb */}
                <div
                  className="absolute top-0 bottom-0 w-[44px] flex items-center justify-center bg-white dark:bg-slate-700 shadow-md cursor-grab active:cursor-grabbing border-r border-slate-200 dark:border-slate-600 transition-none z-10"
                  style={{ left: sliderX }}
                  onMouseDown={(e) => handleSliderStart(e.clientX)}
                  onTouchStart={(e) => handleSliderStart(e.touches[0].clientX)}
                >
                  <ChevronRight className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" />
                </div>
              </div>
              {sliderError && (
                <p className="flex items-center gap-1 mt-1.5 text-[12px] text-red-500 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {sliderError}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400">验证通过</span>
              </div>
              <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">短信验证码</label>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                smsError
                  ? "border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/5"
                  : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus-within:border-[#009EFF] dark:focus-within:border-[#33B1FF]"
              }`}>
                <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="请输入6位验证码"
                  value={smsCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setSmsCode(v);
                    if (smsError) setSmsError("");
                  }}
                  className="flex-1 bg-transparent outline-none text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 tracking-[4px]"
                />
                <button
                  disabled={countdown > 0 || sending}
                  onClick={handleSendSms}
                  className="shrink-0 text-[13px] font-medium text-[#009EFF] dark:text-[#33B1FF] hover:text-blue-600 dark:hover:text-blue-400 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {sending ? "发送中..." : countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                </button>
              </div>
              {smsError && (
                <p className="flex items-center gap-1 mt-1.5 text-[12px] text-red-500 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {smsError}
                </p>
              )}
            </div>
          )}

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
            提交即表示您同意接收环信开发者社区的相关信息。验证码仅用于身份核实，我们不会泄露您的手机号。
          </p>
        </div>
      </div>
    </div>
  );
}