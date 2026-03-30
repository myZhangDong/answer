import { FilePenLine } from "lucide-react";
import { Link } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function CtaBanner() {
  const { isAdmin } = useAdminAuth();
  const target = isAdmin ? "/admin" : "/admin/login";

  return (
    <div className="group relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/30 p-6 text-center ring-1 ring-blue-100/60 transition-all hover:ring-blue-200 dark:from-blue-900/20 dark:to-indigo-900/10 dark:ring-blue-900/30 dark:hover:ring-blue-800/50 sm:mt-14 sm:p-8 lg:p-10">
      <div className="absolute right-0 top-0 p-4 opacity-5 transition-transform duration-700 group-hover:scale-110 sm:p-6">
        <FilePenLine className="h-24 w-24 text-blue-600 sm:h-32 sm:w-32 lg:h-40 lg:w-40" />
      </div>
      <h3 className="relative z-10 mb-3 text-[20px] font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[22px]">
        需要发布新的内容？
      </h3>
      <p className="relative z-10 mb-6 text-[14px] font-medium text-slate-500 dark:text-slate-400 sm:mb-8 sm:text-[15px]">
        管理员登录后可继续发布和维护文章、视频、开源项目内容。
      </p>
      <Link
        to={target}
        className="relative z-10 inline-block rounded-full bg-blue-600 px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:px-8 sm:text-[15px]"
      >
        {isAdmin ? "进入后台管理" : "登录后台发布"}
      </Link>
    </div>
  );
}
