import { ChevronLeft, Github, Eye, Star, FileText, Code } from "lucide-react";
import { Link, useParams } from "react-router";
import { CodeBlock } from "../components/CodeBlock";
import { CtaBanner } from "../components/CtaBanner";
import { HotDemosWidget } from "../components/SidebarWidgets";
import { useEffect, useState } from "react";
import { ContentProject, fetchProjectDetail } from "../api/contentApi";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

const placeholderImg = "/placeholder-image.svg";

const HOT_DEMOS = [
  { name: "ChatDemo (聊天Demo)", views: 256, icon: placeholderImg },
  { name: "VideoCallDemo", views: 198, icon: placeholderImg },
  { name: "CustomerService UI", views: 145, icon: placeholderImg },
  { name: "LiveStreamingDemo", views: 112, icon: placeholderImg },
  { name: "VoiceRoomDemo", views: 98, icon: placeholderImg },
];

const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

export function OpenSourceDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<ContentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetchProjectDetail(id);
        if (!active) {
          return;
        }
        setProject(resp);
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
  }, [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-slate-500 dark:text-slate-400">正在加载项目...</div>;
  }

  if (error || !project) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-red-500">{error || "项目不存在"}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Link to="/projects" className="inline-flex items-center text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> 返回列表
        </Link>
      </div>

      <div className="flex gap-8 items-start">
        <main className="flex-1 min-w-0">
          <article className="rounded-2xl bg-white dark:bg-[#111827] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 dark:ring-slate-800 p-8 md:p-12 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-1 bg-slate-50 dark:bg-slate-900/50 rounded-md text-slate-700 dark:text-slate-300 ring-1 ring-slate-200/50 dark:ring-slate-700/50 overflow-hidden">
                  {project.iconUrl ? (
                    <img src={project.iconUrl} alt={project.name} className="w-12 h-12 object-cover rounded-[4px]" />
                  ) : (
                    <Github className="w-8 h-8 m-2" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-[28px] md:text-[32px] font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-tight flex items-center gap-3">
                    {project.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-5 text-[14px] text-slate-500 dark:text-slate-400 mt-6">
                <div className="flex items-center gap-1.5 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors cursor-pointer">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(project.views)} 浏览</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors cursor-pointer">
                  <Star className="w-4 h-4" />
                  <span>{formatNumber(project.likes)} 点赞</span>
                </div>

                <div className="flex gap-2 ml-2">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] font-medium rounded-md ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#009EFF] dark:prose-a:text-[#33B1FF] hover:prose-a:text-blue-500 prose-p:leading-loose">
              <p className="text-slate-600 dark:text-slate-300 text-[16px] text-lg font-medium mb-10 border-l-4 border-[#009EFF] dark:border-[#33B1FF] pl-4">
                {project.description}
              </p>

              <h2 id="about" className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 mt-10 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" /> 项目介绍
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-[16px] mb-5">
                本项目是一个开源的参考实现，帮助开发者快速掌握并在实际业务中应用相应的技术。我们提供了清晰的目录结构、详尽的代码注释，以及开箱即用的模块。
              </p>

              <h2 id="install" className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 mt-10 mb-5 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#009EFF] dark:text-[#33B1FF]" /> 快速开始
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-[16px] mb-3">
                克隆项目到本地并安装依赖：
              </p>
              {project.repo ? (
                <CodeBlock language="bash">{`git clone ${project.repo}\ncd ${project.name.toLowerCase()}\nnpm install\nnpm run dev`}</CodeBlock>
              ) : null}

              <p className="text-slate-600 dark:text-slate-300 text-[16px] mb-5">
                随后访问 <code>http://localhost:3000</code> 即可查看运行效果。如果需要修改配置，请参考项目根目录下的 <code>.env.example</code> 文件进行设置。
              </p>
              {project.content && <MarkdownRenderer content={project.content} />}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-4">
                <button className="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-[#009EFF] dark:text-[#33B1FF] text-[14px] font-medium hover:bg-[#009EFF] hover:text-white dark:hover:bg-[#33B1FF] dark:hover:text-white hover:shadow-md hover:shadow-[#009EFF]/20 dark:hover:shadow-[#33B1FF]/20 transition-all duration-300">
                  获取 Demo 示例
                </button>
              </div>
            </div>

            {/* CTA Banner */}
            <CtaBanner />
          </article>
        </main>

        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 sticky top-24">
          <HotDemosWidget demos={HOT_DEMOS} />
        </aside>
      </div>
    </div>
  );
}
