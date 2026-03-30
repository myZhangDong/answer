import { Search, ChevronDown, LayoutDashboard, LogOut, ShieldCheck, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { LogoSvg } from "./LogoSvg";
import { DeskLampToggle } from "./DeskLampToggle";
import { useAdminAuth } from "../auth/AdminAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading, logout } = useAdminAuth();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.display_name || user?.username || user?.e_mail || "管理员";

  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const navItems = [
    { label: "首页", to: "/" },
    { label: "视频教程", to: "/videos" },
    { label: "开源项目", to: "/projects" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E8EB] bg-white/95 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 lg:px-8">
        <div className="flex h-full items-center gap-10">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
            <LogoSvg className="h-[24px] w-auto text-[#009EFF] dark:text-[#33B1FF]" />
          </Link>

          <nav className="ml-4 hidden h-full items-center md:flex">
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/" || location.pathname.startsWith("/article")
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex h-[64px] w-[96px] items-center justify-center text-[16px] font-normal transition-colors ${
                    isActive
                      ? "text-[#009EFF] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#009EFF] dark:text-[#33B1FF] dark:after:bg-[#33B1FF]"
                      : "text-[#4A5568] hover:text-[#009EFF] dark:text-slate-300 dark:hover:text-[#33B1FF]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="group relative hidden w-64 lg:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-[14px] w-[14px] text-[#8792A2] dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="搜索文章、视频、项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="h-[32px] w-full rounded-[6px] border border-transparent bg-[#F2F4F7] pl-8 pr-8 text-[14px] text-[#1A1F36] transition-all placeholder:text-[#8792A2] hover:bg-[#E4E7EC] focus:border-[#009EFF] focus:bg-white focus:outline-none focus:ring-[2px] focus:ring-[#009EFF]/20 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-400 dark:hover:bg-slate-700 dark:focus:border-[#33B1FF] dark:focus:bg-slate-900 dark:focus:ring-[#33B1FF]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none dark:text-slate-500 dark:hover:text-slate-300"
                aria-label="清空搜索内容"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <DeskLampToggle isDark={isDark} toggleDark={toggleDark} />

          <div className="relative flex h-[24px] items-center gap-4 border-l border-[#E5E8EB] pl-6 dark:border-slate-700">
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 py-4 text-[14px] font-medium text-slate-700 transition-colors hover:text-[#009EFF] dark:text-slate-200 dark:hover:text-[#33B1FF]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{displayName}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[156px]">
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="h-[15px] w-[15px]" />
                    进入后台
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                    }}
                    disabled={loading}
                  >
                    <LogOut className="h-[15px] w-[15px]" />
                    {loading ? "处理中..." : "退出登录"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a
                href="https://console.easemob.com/user/register"
                target="_blank"
                rel="noreferrer"
                className="rounded-[6px] bg-[#009EFF] px-4 py-1.5 text-[14px] font-medium text-white transition-all hover:bg-[#008AE6] focus:outline-none focus:ring-2 focus:ring-[#009EFF] focus:ring-offset-2 dark:bg-[#33B1FF] dark:hover:bg-[#33B1FF]/90 dark:focus:ring-[#33B1FF]"
              >
                注册环信
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
