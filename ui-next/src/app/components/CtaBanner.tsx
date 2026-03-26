import { FilePenLine } from "lucide-react";
import { Link } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function CtaBanner() {
  const { isAdmin } = useAdminAuth();
  const target = isAdmin ? "/admin" : "/admin/login";

  return (
    <div className="mt-14 rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50/30 dark:to-indigo-900/10 ring-1 ring-blue-100/60 dark:ring-blue-900/30 p-10 text-center relative overflow-hidden group hover:ring-blue-200 dark:hover:ring-blue-800/50 transition-all">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <FilePenLine className="w-40 h-40 text-blue-600" />
      </div>
      <h3 className="relative z-10 text-[22px] font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
        需要发布新的内容？
      </h3>
      <p className="relative z-10 text-slate-500 dark:text-slate-400 mb-8 font-medium text-[15px]">
        管理员登录后可继续发布和维护文章、视频、开源项目内容。
      </p>
      <Link
        to={target}
        className="relative z-10 inline-block rounded-full bg-blue-600 px-8 py-3 text-[15px] font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5"
      >
        {isAdmin ? "进入后台管理" : "登录后台发布"}
      </Link>
    </div>
  );
}
