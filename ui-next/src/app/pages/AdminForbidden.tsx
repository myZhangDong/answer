import { ShieldAlert, LogOut, Home } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { LogoSvg } from "../components/LogoSvg";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function AdminForbidden() {
  const { user, logout, loading } = useAdminAuth();
  const accountLabel = user?.display_name || user?.username || user?.e_mail || "当前账号";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,158,255,0.16),_transparent_42%),linear-gradient(180deg,_#F8FBFF_0%,_#EEF4FF_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,177,255,0.2),_transparent_32%),linear-gradient(180deg,_#0B1120_0%,_#111827_100%)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/60 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/8 dark:bg-[#0F172ACC] dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)] md:p-10">
          <LogoSvg className="h-8 w-auto text-slate-900 dark:text-white" />
          <div className="mt-8 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            管理后台访问受限
          </div>
          <div className="mt-6 flex items-start gap-4">
            <div className="rounded-2xl bg-red-50 p-3 text-red-500 dark:bg-red-500/10 dark:text-red-300">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                当前账号没有后台权限
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                已检测到登录会话，但账号 <span className="font-medium text-slate-900 dark:text-slate-100">{accountLabel}</span> 不是管理员，不能访问 `ui-next` 管理后台。
              </p>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                如需继续，请切换到管理员账号登录，或返回前台页面。
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                void logout();
              }}
              disabled={loading}
              className="h-11 rounded-xl bg-[#009EFF] px-5 text-white hover:bg-[#0089E0] dark:bg-[#33B1FF] dark:hover:bg-[#1FA8FF]">
              <LogOut className="h-4 w-4" />
              {loading ? "处理中..." : "退出当前账号"}
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl px-5">
              <Link to="/">
                <Home className="h-4 w-4" />
                返回前台
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
