import { User } from "lucide-react";

const REGISTER_URL =
  "https://console.easemob.com/user/register?_gl=1*111y87j*_ga*NzExNTYwNDQ4LjE3NjU0NDQ4MDU.*_ga_G10ZH1K58T*czE3NzM4Mzc4OTAkbzg1JGcxJHQxNzczODM5NjA0JGo1NCRsMCRoMA..";

export function CtaBanner() {
  return (
    <div className="mt-14 rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50/30 dark:to-indigo-900/10 ring-1 ring-blue-100/60 dark:ring-blue-900/30 p-10 text-center relative overflow-hidden group hover:ring-blue-200 dark:hover:ring-blue-800/50 transition-all">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <User className="w-40 h-40 text-blue-600" />
      </div>
      <h3 className="relative z-10 text-[22px] font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        立即注册环信智能互动通讯云平台
      </h3>
      <p className="relative z-10 text-slate-500 dark:text-slate-400 mb-8 font-medium text-[15px]">
        免费体验 · 支持 IM + AI + RTC · 一天快速接入 · 99.99%服务可用性
      </p>
      <a
        href={REGISTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 inline-block rounded-full bg-blue-600 px-8 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5"
      >
        免费注册体验
      </a>
    </div>
  );
}
