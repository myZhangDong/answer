import { PlayCircle, LayoutGrid, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { ContentProject, ContentVideo } from "../api/contentApi";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type HotTutorialItem = Pick<ContentVideo, "id" | "title" | "views">;
type HotDemoItem = Pick<ContentProject, "id" | "name" | "views" | "iconUrl">;

interface WidgetStateProps {
  loading?: boolean;
  emptyText?: string;
}

const DEFAULT_DEMO_ICON = "/placeholder-image.svg";

function WidgetEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] text-slate-500 ring-1 ring-slate-100/80 dark:bg-slate-900/50 dark:text-slate-400 dark:ring-slate-700/80">
      {text}
    </div>
  );
}

export function HotTutorialsWidget({
  tutorials,
  loading = false,
  emptyText = "暂无热门教程",
}: WidgetStateProps & { tutorials: HotTutorialItem[] }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700/80">
      <div className="mb-5 flex items-center gap-2.5">
        <PlayCircle className="h-[18px] w-[18px] text-[#009EFF] dark:text-[#33B1FF]" />
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">热门教程</h3>
      </div>
      {loading ? (
        <WidgetEmptyState text="正在加载热门教程..." />
      ) : tutorials.length === 0 ? (
        <WidgetEmptyState text={emptyText} />
      ) : (
        <div className="flex flex-col gap-3">
          {tutorials.map((tutorial) => (
            <Link
              key={tutorial.id}
              to={`/video/${tutorial.id}`}
              className="group flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100/80 transition-colors hover:ring-[#009EFF]/30 dark:bg-slate-900/50 dark:ring-slate-700/80 dark:hover:ring-[#33B1FF]/50"
            >
              <PlayCircle className="h-[16px] w-[16px] shrink-0 text-[#009EFF] dark:text-[#33B1FF]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-slate-700 transition-colors group-hover:text-[#009EFF] dark:text-slate-200 dark:group-hover:text-[#33B1FF]">
                  {tutorial.title}
                </div>
                <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {tutorial.views.toLocaleString()} 播放
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function HotDemosWidget({
  demos,
  loading = false,
  emptyText = "暂无热门 Demo",
}: WidgetStateProps & { demos: HotDemoItem[] }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700/80">
      <div className="mb-5 flex items-center gap-2.5">
        <LayoutGrid className="h-[18px] w-[18px] text-[#009EFF] dark:text-[#33B1FF]" />
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">热门 Demo</h3>
      </div>
      {loading ? (
        <WidgetEmptyState text="正在加载热门 Demo..." />
      ) : demos.length === 0 ? (
        <WidgetEmptyState text={emptyText} />
      ) : (
        <div className="flex flex-col gap-3">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              to={`/project/${demo.id}`}
              className="group flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100/80 transition-colors hover:ring-[#009EFF]/30 dark:bg-slate-900/50 dark:ring-slate-700/80 dark:hover:ring-[#33B1FF]/50"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                <ImageWithFallback
                  src={demo.iconUrl || DEFAULT_DEMO_ICON}
                  alt={demo.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-[#009EFF] dark:text-slate-200 dark:group-hover:text-[#33B1FF]">
                  {demo.name}
                </div>
                <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                  {demo.views.toLocaleString()} 访问
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
