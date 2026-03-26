import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { AdminForbidden } from "../pages/AdminForbidden";
import { LogoSvg } from "../components/LogoSvg";

function AdminLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 dark:bg-[#0B1120]">
      <LogoSvg className="h-8 w-auto text-slate-900 dark:text-white" />
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#009EFF] dark:bg-[#33B1FF]" />
        正在校验管理员会话...
      </div>
    </div>
  );
}

export function AdminRouteGuard() {
  const location = useLocation();
  const { ready, loading, loadSession, isAuthenticated, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (!ready && !loading) {
      void loadSession();
    }
  }, [ready, loading, loadSession]);

  if (!ready || loading) {
    return <AdminLoadingScreen />;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!isAdmin) {
    return <AdminForbidden />;
  }

  return <Outlet />;
}
