import { Search, ChevronDown, LayoutDashboard, LogOut, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { LogoSvg } from "./LogoSvg";

import { DeskLampToggle } from "./DeskLampToggle";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId] = useState("admin.test@easemob.com");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoggedIn(false);
  };

  const formatUserId = (id: string) => {
    let displayed = id;
    if (displayed.length > 12) {
      displayed = displayed.substring(0, 11) + "...";
    }
    if (displayed.length > 1) {
      const firstChar = displayed.substring(0, 1);
      const encryptLen = Math.min(displayed.length - 1, 6);
      const encryptedStr = "*".repeat(encryptLen);
      const restStr = displayed.substring(1 + encryptLen);
      return firstChar + encryptedStr + restStr;
    }
    return displayed;
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E5E8EB] dark:border-slate-800 transition-all">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-10 h-full">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
            <LogoSvg className="h-[24px] w-auto text-[#009EFF] dark:text-[#33B1FF]" />
          </Link>
          
          <nav className="hidden md:flex items-center ml-4 h-full">
            <Link to="/" className={`relative flex items-center justify-center w-[88px] h-[64px] text-[16px] font-normal transition-colors ${location.pathname === '/' ? 'text-[#009EFF] dark:text-[#33B1FF] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#009EFF] dark:after:bg-[#33B1FF]' : 'text-[#4A5568] dark:text-slate-300 hover:text-[#009EFF] dark:hover:text-[#33B1FF]'}`}>
              首页
            </Link>
            <Link to="/videos" className={`relative flex items-center justify-center w-[88px] h-[64px] text-[16px] font-normal transition-colors ${location.pathname.startsWith('/videos') ? 'text-[#009EFF] dark:text-[#33B1FF] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#009EFF] dark:after:bg-[#33B1FF]' : 'text-[#4A5568] dark:text-slate-300 hover:text-[#009EFF] dark:hover:text-[#33B1FF]'}`}>
              视频教程
            </Link>
            <Link to="/projects" className={`relative flex items-center justify-center w-[88px] h-[64px] text-[16px] font-normal transition-colors ${location.pathname.startsWith('/projects') ? 'text-[#009EFF] dark:text-[#33B1FF] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#009EFF] dark:after:bg-[#33B1FF]' : 'text-[#4A5568] dark:text-slate-300 hover:text-[#009EFF] dark:hover:text-[#33B1FF]'}`}>
              开源项目
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block w-64 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-[14px] w-[14px] text-[#8792A2] dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="搜索文章、视频、项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="h-[32px] w-full rounded-[6px] border border-transparent bg-[#F2F4F7] dark:bg-slate-800 pl-8 pr-8 text-[14px] text-[#1A1F36] dark:text-slate-200 placeholder-[#8792A2] dark:placeholder-slate-400 transition-all hover:bg-[#E4E7EC] dark:hover:bg-slate-700 focus:border-[#009EFF] dark:focus:border-[#33B1FF] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-[2px] focus:ring-[#009EFF]/20 dark:focus:ring-[#33B1FF]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
                aria-label="清空搜索内容"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <DeskLampToggle isDark={isDark} toggleDark={toggleDark} />

          <div className="flex items-center gap-4 border-l border-[#E5E8EB] dark:border-slate-700 pl-6 h-[24px] relative">
            {isLoggedIn ? (
              <div className="relative group cursor-pointer flex items-center h-full">
                <div className="flex items-center gap-1.5 text-[14px] font-medium text-slate-700 dark:text-slate-200 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors py-4">
                  <span>{formatUserId(userId)}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] group-hover:rotate-180 transition-all duration-300" />
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute top-[32px] right-0 w-[140px] pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden py-1.5">
                    <a href="https://console.easemob.com/index" target="_blank" rel="noreferrer" className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#009EFF] dark:hover:text-[#33B1FF] flex items-center gap-2.5 transition-colors block">
                      <LayoutDashboard className="w-[15px] h-[15px] shrink-0" />
                      登录工作台
                    </a>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-[15px] h-[15px] shrink-0" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="rounded-[6px] bg-[#009EFF] dark:bg-[#33B1FF] px-4 py-1.5 text-[14px] font-medium text-white transition-all hover:bg-[#008AE6] dark:hover:bg-[#33B1FF]/90 focus:outline-none focus:ring-2 focus:ring-[#009EFF] dark:focus:ring-[#33B1FF] focus:ring-offset-2"
              >
                注册环信
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}