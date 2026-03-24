import { PlayCircle, LayoutGrid, ChevronRight } from "lucide-react";
import { Link } from "react-router";

const HOT_TUTORIALS = [
  "环信IM Uniapp SDK集成教程",
  "AI驱动的IM解决方案",
  "千人千面专属对话",
  "离线唤醒提升到达率",
];

interface HotDemoItem {
  name: string;
  views: number;
  icon: string;
}

export function HotTutorialsWidget() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/80 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <PlayCircle className="w-[18px] h-[18px] text-[#009EFF] dark:text-[#33B1FF]" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">热门教程</h3>
      </div>
      <div className="flex flex-col gap-4">
        {HOT_TUTORIALS.map((title, idx) => (
          <Link key={idx} to="/videos" className="flex items-center gap-3 group">
            <PlayCircle className="w-[16px] h-[16px] text-[#009EFF] dark:text-[#33B1FF] shrink-0" />
            <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] truncate transition-colors">
              {title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function HotDemosWidget({ demos }: { demos: HotDemoItem[] }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/80 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <LayoutGrid className="w-[18px] h-[18px] text-[#009EFF] dark:text-[#33B1FF]" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">热门 Demo</h3>
      </div>
      <div className="flex flex-col gap-3">
        {demos.map((demo, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-100/80 dark:ring-slate-700/80 hover:ring-[#009EFF]/30 dark:hover:ring-[#33B1FF]/50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 shrink-0">
              <img src={demo.icon} alt={demo.name} className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors">
                {demo.name}
              </span>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{demo.views} 访问</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
