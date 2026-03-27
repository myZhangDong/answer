import { FileText, FolderGit2, LogOut, Settings2, Users, Video } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { LogoSvg } from "../components/LogoSvg";
import { useAdminAuth } from "../auth/AdminAuthContext";

const adminNavigation = [
  {
    to: "/admin/articles",
    label: "文章管理",
    icon: FileText,
  },
  {
    to: "/admin/videos",
    label: "视频管理",
    icon: Video,
  },
  {
    to: "/admin/projects",
    label: "项目管理",
    icon: FolderGit2,
  },
  {
    to: "/admin/users",
    label: "用户管理",
    icon: Users,
  },
  {
    to: "/admin/site-settings",
    label: "网站设置",
    icon: Settings2,
  },
];

function AdminSidebarLink({
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
        `group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] transition-all duration-200 ${
          isActive
            ? "bg-[#F0F8FF] text-[#009EFF] font-semibold dark:bg-[#33B1FF]/10 dark:text-[#33B1FF]"
            : "text-[#4A5568] font-medium hover:bg-[#EAECEF]/60 hover:text-[#1A1F36] dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
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
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-6">
          <LogoSvg className="h-7 w-auto" />
          <span className="rounded-md bg-[#009EFF]/10 px-2 py-0.5 text-[12px] font-medium text-[#009EFF] dark:bg-[#33B1FF]/10 dark:text-[#33B1FF]">
            管理后台
          </span>
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

      <main className="mx-auto flex max-w-[1400px] gap-6 px-6 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 flex flex-col gap-1">
            {adminNavigation.map((item) => (
              <AdminSidebarLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {adminNavigation.map((item) => (
              <AdminSidebarLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </nav>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
