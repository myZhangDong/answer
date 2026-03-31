import { Search, ChevronDown, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { DeskLampToggle } from "./DeskLampToggle";
import { LogoSvg } from "./LogoSvg";
import { useAdminAuth } from "../auth/AdminAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import {
  EASEMOB_CONSOLE_REGISTER_URL,
  trackConsoleRegisterClick,
} from "../utils/consoleRegister";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading, logout } = useAdminAuth();

  const runSearch = () => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      return;
    }
    setMobileSearchOpen(false);
    setMobileNavOpen(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const displayName = user?.display_name || user?.username || user?.e_mail || "管理员";
  const navItems = [
    { label: "首页", to: "/" },
    { label: "视频教程", to: "/videos" },
    { label: "开源项目", to: "/projects" },
  ];

  const isNavItemActive = (to: string) =>
    to === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/article")
      : location.pathname.startsWith(to);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };

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

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

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

  const handleConsoleRegisterClick = (source: "header_desktop" | "header_mobile") => {
    trackConsoleRegisterClick({ source });
    if (source === "header_mobile") {
      setMobileNavOpen(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E8EB] bg-white/95 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 md:gap-10">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-[#009EFF]/40 hover:text-[#009EFF] focus:outline-none focus:ring-2 focus:ring-[#009EFF]/20 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#33B1FF]/40 dark:hover:text-[#33B1FF] dark:focus:ring-[#33B1FF]/20"
              aria-label="打开导航菜单"
            >
              <Menu className="h-5 w-5" />
            </button>
            <SheetContent side="left" className="w-[86vw] max-w-[360px] border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900">
              <SheetHeader className="gap-2 border-b border-slate-100 px-5 py-5 text-left dark:border-slate-800">
                <SheetTitle className="flex items-center gap-3 text-[16px] text-slate-900 dark:text-slate-100">
                  <LogoSvg className="h-6 w-auto text-[#009EFF] dark:text-[#33B1FF]" />
                  内容导航
                </SheetTitle>
                <SheetDescription className="text-[13px] text-slate-500 dark:text-slate-400">
                  浏览文章、视频教程与开源项目
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索文章、视频、项目..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:border-[#009EFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009EFF]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#33B1FF] dark:focus:bg-slate-900 dark:focus:ring-[#33B1FF]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="清空搜索内容"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = isNavItemActive(item.to);

                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => navigate(item.to)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] transition-colors ${
                          isActive
                            ? "bg-[#F0F8FF] text-[#009EFF] dark:bg-[#33B1FF]/10 dark:text-[#33B1FF]"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {isActive ? (
                          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })}
                </nav>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    快捷操作
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={runSearch}
                      className="inline-flex items-center justify-center rounded-xl bg-[#009EFF] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#008AE6] dark:bg-[#33B1FF] dark:hover:bg-[#33B1FF]/90"
                    >
                      搜索内容
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        进入后台
                      </button>
                    ) : (
                      <a
                        href={EASEMOB_CONSOLE_REGISTER_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleConsoleRegisterClick("header_mobile")}
                        className="inline-flex items-center justify-center rounded-xl border border-[#009EFF]/20 bg-white px-4 py-2.5 text-[14px] font-medium text-[#009EFF] transition-colors hover:bg-[#009EFF]/6 dark:border-[#33B1FF]/20 dark:bg-slate-900 dark:text-[#33B1FF] dark:hover:bg-[#33B1FF]/10"
                      >
                        注册环信
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="min-w-0 flex items-center transition-opacity hover:opacity-80">
            <LogoSvg className="h-[24px] w-auto text-[#009EFF] dark:text-[#33B1FF]" />
          </Link>

          <nav className="ml-2 hidden h-full items-center md:flex lg:ml-4">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex h-[52px] w-[88px] items-center justify-center text-[15px] font-normal transition-colors lg:w-[96px] lg:text-[16px] ${
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-[#009EFF]/40 hover:text-[#009EFF] focus:outline-none focus:ring-2 focus:ring-[#009EFF]/20 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#33B1FF]/40 dark:hover:text-[#33B1FF] dark:focus:ring-[#33B1FF]/20"
            aria-label={mobileSearchOpen ? "收起搜索框" : "展开搜索框"}
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <div className="group relative hidden w-64 lg:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-[14px] w-[14px] text-[#8792A2] dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="搜索文章、视频、项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
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

          <div className="relative flex h-[24px] items-center gap-2 border-l border-[#E5E8EB] pl-2 sm:gap-4 sm:pl-4 lg:pl-6 dark:border-slate-700">
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 py-4 text-[14px] font-medium text-slate-700 transition-colors hover:text-[#009EFF] dark:text-slate-200 dark:hover:text-[#33B1FF] sm:gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
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
                href={EASEMOB_CONSOLE_REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleConsoleRegisterClick("header_desktop")}
                className="rounded-[10px] bg-[#009EFF] px-3 py-2 text-[13px] font-medium text-white transition-all hover:bg-[#008AE6] focus:outline-none focus:ring-2 focus:ring-[#009EFF] focus:ring-offset-2 dark:bg-[#33B1FF] dark:hover:bg-[#33B1FF]/90 dark:focus:ring-[#33B1FF] sm:px-4 sm:py-1.5 sm:text-[14px]"
              >
                <span className="sm:hidden">注册</span>
                <span className="hidden sm:inline">注册环信</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-slate-100 px-4 py-3 lg:hidden dark:border-slate-800">
          <div className="mx-auto max-w-[1440px]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="搜索文章、视频、项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-20 text-[14px] text-slate-900 transition placeholder:text-slate-400 focus:border-[#009EFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009EFF]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#33B1FF] dark:focus:bg-slate-900 dark:focus:ring-[#33B1FF]/20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    aria-label="清空搜索内容"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={runSearch}
                  className="inline-flex items-center rounded-lg bg-[#009EFF] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#008AE6] dark:bg-[#33B1FF] dark:hover:bg-[#33B1FF]/90"
                >
                  搜索
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
