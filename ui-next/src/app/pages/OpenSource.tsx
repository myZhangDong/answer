import { ThumbsUp, Github, Eye, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { DemoModal } from "../components/DemoModal";
import { ContentProject, fetchProjects } from "../api/contentApi";

// Language color mapping
const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Swift: "bg-orange-500",
  Vue: "bg-emerald-500",
  Dart: "bg-cyan-500"
};

const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

export function OpenSource() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoModal, setDemoModal] = useState<{ open: boolean; projectId: string; projectName: string; demoUrl: string }>({
    open: false,
    projectId: "",
    projectName: "",
    demoUrl: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetchProjects({ page: 1, pageSize: 100, order: "newest" });
        if (!active) {
          return;
        }
        setProjects(resp.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "项目加载失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId]);

  return (
    <div className="flex flex-col gap-8 pb-12 md:gap-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-900 dark:text-slate-100 mb-2.5 tracking-tight">开源项目</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px] max-w-2xl leading-relaxed">
            探索社区贡献的开源项目、UI 组件库和最佳实践 Demo。您可以在这里找到开箱即用的示例及代码，快速应用到您的项目中。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80">
            正在加载项目...
          </div>
        )}
        {!loading && error && (
          <div className="col-span-full rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
            {error}
          </div>
        )}
        {!loading && !error && projects.map((project) => {
          const isHighlighted = highlightId === String(project.id);
          return (
          <div 
            key={project.id} 
            ref={isHighlighted ? highlightRef : null}
            className={`group flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 dark:bg-slate-800 sm:p-6 ${
              isHighlighted 
                ? "ring-2 ring-[#009EFF] dark:ring-[#33B1FF] shadow-lg shadow-[#009EFF]/20 dark:shadow-[#33B1FF]/20" 
                : "ring-1 ring-slate-100/80 dark:ring-slate-700/80 hover:shadow-md hover:ring-blue-200/80 dark:hover:ring-blue-500/30"
            }`}
          >
            <div className="flex items-start justify-between mb-5 gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-1 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-md text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors ring-1 ring-slate-200/50 dark:ring-slate-700/50 group-hover:ring-blue-100 dark:group-hover:ring-blue-500/30 overflow-hidden">
                  {project.iconUrl ? (
                    <img src={project.iconUrl} alt={project.name} className="w-9 h-9 object-cover rounded-[4px]" />
                  ) : (
                    <Github className="w-7 h-7 m-1.5" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                    {project.name}
                  </h3>
                  {/* 浏览 & 点赞 */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(project.views)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{formatNumber(project.likes)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-[14px] mb-6 flex-1 leading-relaxed">
              {project.description}
              <Link to={`/project/${project.id}`} className="ml-1.5 inline-flex items-center whitespace-nowrap text-[#009EFF] transition-colors hover:text-blue-600 hover:underline dark:text-[#33B1FF] dark:hover:text-blue-400">
                查看详情<ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {project.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-[12px] font-medium rounded-md ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 group-hover:ring-blue-100/50 transition-colors">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto">
              <button
                onClick={() => {
                  const demoUrl = project.repo;
                  setDemoModal({ open: true, projectId: project.id, projectName: project.name, demoUrl });
                }}
                className="w-full rounded-lg bg-slate-100 py-3 text-[14px] font-medium text-[#009EFF] transition-all duration-300 hover:bg-[#009EFF] hover:text-white hover:shadow-md hover:shadow-[#009EFF]/20 dark:bg-slate-700/50 dark:text-[#33B1FF] dark:hover:bg-[#33B1FF] dark:hover:text-white dark:hover:shadow-[#33B1FF]/20">
                获取 Demo 示例
              </button>
            </div>
          </div>
          );
        })}
      </div>

      <DemoModal
        open={demoModal.open}
        onClose={() => setDemoModal((s) => ({ ...s, open: false }))}
        projectId={demoModal.projectId}
        projectName={demoModal.projectName}
        demoUrl={demoModal.demoUrl}
      />
    </div>
  );
}
