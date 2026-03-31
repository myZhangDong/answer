import { FilePenLine } from "lucide-react";
import {
  ConsoleRegisterContentType,
  ConsoleRegisterSource,
  EASEMOB_CONSOLE_REGISTER_URL,
  trackConsoleRegisterClick,
} from "../utils/consoleRegister";

interface CtaBannerProps {
  source: ConsoleRegisterSource;
  contentType?: ConsoleRegisterContentType;
  contentId?: string;
  contentTitle?: string;
}

export function CtaBanner({ source, contentType, contentId, contentTitle }: CtaBannerProps) {
  const handleClick = () => {
    trackConsoleRegisterClick({
      source,
      contentType,
      contentId,
      contentTitle,
    });
  };

  return (
    <div className="group relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/30 p-6 text-center ring-1 ring-blue-100/60 transition-all hover:ring-blue-200 dark:from-blue-900/20 dark:to-indigo-900/10 dark:ring-blue-900/30 dark:hover:ring-blue-800/50 sm:mt-14 sm:p-8 lg:p-10">
      <div className="absolute right-0 top-0 p-4 opacity-5 transition-transform duration-700 group-hover:scale-110 sm:p-6">
        <FilePenLine className="h-24 w-24 text-blue-600 sm:h-32 sm:w-32 lg:h-40 lg:w-40" />
      </div>
      <h3 className="relative z-10 mb-3 text-[20px] font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[22px]">
        立即注册环信智能互动通讯云平台
      </h3>
      <p className="relative z-10 mb-6 text-[14px] font-medium text-slate-500 dark:text-slate-400 sm:mb-8 sm:text-[15px]">
        免费体验 · 支持 IM + AI + RTC · 一天快速接入 · 99.99%服务可用性
      </p>
      <a
        href={EASEMOB_CONSOLE_REGISTER_URL}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        className="relative z-10 inline-block rounded-full bg-blue-600 px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:px-8 sm:text-[15px]"
      >
        免费注册体验
      </a>
    </div>
  );
}
