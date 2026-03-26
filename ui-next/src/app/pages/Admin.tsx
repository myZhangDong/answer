import { FileText, FolderGit2, LogOut, Video } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { LogoSvg } from "../components/LogoSvg";
import { useAdminAuth } from "../auth/AdminAuthContext";

function AdminTabLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
          isActive
            ? "bg-[#009EFF]/10 text-[#009EFF] dark:bg-[#33B1FF]/10 dark:text-[#33B1FF]"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        }`
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </NavLink>
  );
}

export function Admin() {
  const navigate = useNavigate();
  const { logout, user, loading } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
          <LogoSvg className="h-7 w-auto" />
          <span className="rounded-md bg-[#009EFF]/10 px-2 py-0.5 text-[12px] font-medium text-[#009EFF] dark:bg-[#33B1FF]/10 dark:text-[#33B1FF]">
            管理后台
          </span>
          <nav className="ml-6 flex items-center gap-1">
            <AdminTabLink to="/admin/articles" label="文章管理" icon={FileText} />
            <AdminTabLink to="/admin/videos" label="视频管理" icon={Video} />
            <AdminTabLink to="/admin/projects" label="项目管理" icon={FolderGit2} />
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                {user?.display_name || user?.username || user?.e_mail || "管理员"}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">复用现有后台会话</p>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate("/admin/login", { replace: true });
              }}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              {loading ? "处理中..." : "退出"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
