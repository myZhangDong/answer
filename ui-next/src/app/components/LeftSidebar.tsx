import { cn } from "./ui/utils";
import { Link, useLocation } from "react-router";
import { BookOpen, Code, PlayCircle } from "lucide-react";

export function LeftSidebar() {
  const location = useLocation();

  const navigation = [
    { name: "热门文章", href: "/", icon: BookOpen },
    { name: "视频教程", href: "/videos", icon: PlayCircle },
    { name: "开源项目", href: "/projects", icon: Code },
  ];

  return (
    <aside className="w-56 shrink-0 hidden min-[1200px]:block">
      <div className="sticky top-24 flex flex-col gap-1">
        {navigation.map((item) => {
          const isActive = 
            item.href === "/" 
              ? location.pathname === "/" || location.pathname.startsWith("/article")
              : location.pathname.startsWith(item.href);
              
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-[14px] transition-all duration-200",
                isActive
                  ? "bg-[#F0F8FF] dark:bg-[#33B1FF]/10 text-[#009EFF] dark:text-[#33B1FF] font-semibold"
                  : "text-[#4A5568] dark:text-slate-300 font-medium hover:bg-[#EAECEF]/60 dark:hover:bg-slate-800/50 hover:text-[#1A1F36] dark:hover:text-white"
              )}
            >
              <item.icon
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "h-[16px] w-[16px] shrink-0 transition-colors",
                  isActive ? "text-[#009EFF] dark:text-[#33B1FF]" : "text-[#8792A2] dark:text-slate-400 group-hover:text-[#4A5568] dark:group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}