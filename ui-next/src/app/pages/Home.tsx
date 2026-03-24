import { Clock, Eye, Tag, ChevronLeft, ChevronRight, TrendingUp, Sparkles, ArrowRight, Rocket, ThumbsUp } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { HotDemosWidget, HotTutorialsWidget } from "../components/SidebarWidgets";
import { ContentArticle, fetchArticles } from "../api/contentApi";

const CATEGORIES = ["全部", "Web", "iOS", "Android", "Server", "Uniapp", "React Native"];

const HOT_ARTICLES = [
  "怎样集成Web SDK",
  "消息撤回时间设置",
  "系统消息头像修改",
  "Uniapp集成教程",
  "Server端离线推送配置",
  "Flutter SDK 快速入门",
  "群组权限管理最佳实践",
  "音视频通话卡顿排查"
];

const HOT_DEMOS = [
  { name: "ChatDemo (聊天Demo)", views: 256, icon: "https://api.dicebear.com/7.x/shapes/svg?seed=ChatDemo&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899" },
  { name: "VideoCallDemo", views: 198, icon: "https://api.dicebear.com/7.x/shapes/svg?seed=VideoCallDemo&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899" },
  { name: "CustomerService UI", views: 145, icon: "https://api.dicebear.com/7.x/shapes/svg?seed=CustomerServiceUI&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899" },
  { name: "LiveStreamingDemo", views: 112, icon: "https://api.dicebear.com/7.x/shapes/svg?seed=LiveStreamingDemo&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899" },
  { name: "VoiceRoomDemo", views: 98, icon: "https://api.dicebear.com/7.x/shapes/svg?seed=VoiceRoomDemo&radius=15&backgroundColor=009EFF,33B1FF,14b8a6,8b5cf6,ec4899" },
];

export function Home() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [sortType, setSortType] = useState<"latest" | "hot">("latest");
  const [hotPage, setHotPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetchArticles({ page: 1, pageSize: 100, order: "newest" });
        if (!active) {
          return;
        }
        setArticles(resp.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "文章加载失败");
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

  const processedArticles = useMemo(() => {
    return [...articles]
      .filter((article) => activeCategory === "全部" || article.tag === activeCategory)
      .sort((a, b) => {
        if (sortType === "latest") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.likes - a.likes || b.views - a.views;
      });
  }, [activeCategory, articles, sortType]);

  const hotArticles = useMemo(
    () => [...articles].sort((a, b) => b.likes - a.likes || b.views - a.views),
    [articles],
  );

  const totalHotPages = Math.max(1, Math.ceil(hotArticles.length / 4));
  const displayedHotArticles = hotArticles.slice(hotPage * 4, (hotPage + 1) * 4);

  const nextHotPage = () => setHotPage((p) => (p + 1) % totalHotPages);
  const prevHotPage = () => setHotPage((p) => (p - 1 + totalHotPages) % totalHotPages);
  const displayedArticles = processedArticles.slice(0, visibleCount);
  const hasMore = visibleCount < processedArticles.length;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Trendy AI-Style Hero Banner */}
      <div className="relative w-full min-h-[180px] md:min-h-[220px] rounded-2xl overflow-hidden bg-[#020617] border border-white/5 shadow-2xl flex items-center group">
        {/* Pure CSS Premium Background Effects (MiniMax/Vercel Style) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle noise texture for high-end grain effect */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
          
          {/* Glowing Fluid Orbs in Easemob Blue */}
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[80%] bg-[#009EFF] dark:bg-[#33B1FF] rounded-full mix-blend-screen opacity-20 blur-[100px] group-hover:opacity-30 transition-opacity duration-700" />
          <div className="absolute bottom-[10%] -right-[20%] w-[50%] h-[60%] bg-[#0040FF] rounded-full mix-blend-screen opacity-20 blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] bg-[#009EFF] dark:bg-[#33B1FF] rounded-full mix-blend-screen opacity-[0.15] blur-[100px]" />
          
          {/* Subtle Developer Dot Grid fading out towards bottom-right */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom_right,black_20%,transparent_70%)] opacity-40" />
        </div>
        
        {/* Banner Content */}
        <div className="relative z-10 px-6 md:px-10 py-8 md:py-12 flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-6 md:gap-8">
          <div className="flex flex-col flex-1 max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] backdrop-blur-md w-fit mb-4 cursor-pointer hover:bg-white/[0.08] transition-colors">
              <Sparkles className="w-4 h-4 text-[#009EFF] dark:text-[#33B1FF]" />
              <span className="text-[13px] md:text-sm font-medium text-[#E2E8F0] tracking-wide">环信 IM 5.0 全新发布</span>
            </div>
            
            <h1 className="text-[32px] md:text-[40px] lg:text-[44px] font-bold text-white mb-4 tracking-tight leading-[1.2]">
              构建下一代 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009EFF] dark:from-[#33B1FF] to-[#4DB8FF]">实时交互</span> 体验
            </h1>
            
            <p className="text-[#94A3B8] text-sm md:text-[15px] leading-relaxed line-clamp-2 md:line-clamp-none max-w-[540px]">
              千万级并发架构，全面升级的音视频与消息 SDK。不仅仅是极简集成的通讯能力，更助力开发者快速构建全场景 AI 实时对话应用。
            </p>
          </div>
          
          <div className="flex flex-row items-center gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#009EFF] dark:bg-[#33B1FF] text-white text-[14px] font-medium hover:bg-[#008AE6] dark:hover:bg-[#33B1FF]/90 transition-all shadow-[0_0_20px_rgba(0,158,255,0.2)] dark:shadow-[0_0_20px_rgba(51,177,255,0.2)] hover:shadow-[0_0_30px_rgba(0,158,255,0.35)] dark:hover:shadow-[0_0_30px_rgba(51,177,255,0.35)] whitespace-nowrap">
              <Rocket className="w-4 h-4" />
              快速开始
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/[0.03] text-white text-[14px] font-medium border border-white/[0.08] hover:bg-white/[0.08] backdrop-blur-md transition-all whitespace-nowrap">
              查看指南 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex gap-8 items-start">
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex flex-col gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-700/80">
            <div className="flex items-end justify-between">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">技术文章</h1>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSortType("latest")}
                  className={clsx(
                    "text-[14px] font-medium transition-colors hover:text-[#009EFF] dark:hover:text-[#33B1FF]",
                    sortType === "latest" 
                      ? "text-[#009EFF] dark:text-[#33B1FF]" 
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  最新
                </button>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
                <button 
                  onClick={() => setSortType("hot")}
                  className={clsx(
                    "text-[14px] font-medium transition-colors hover:text-[#009EFF] dark:hover:text-[#33B1FF]",
                    sortType === "hot" 
                      ? "text-[#009EFF] dark:text-[#33B1FF]" 
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  热门
                </button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex items-center gap-3 overflow-x-auto pt-1 pl-1 -ml-1 -mt-1 pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "whitespace-nowrap px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200",
                    activeCategory === cat
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm ring-1 ring-slate-900 dark:ring-slate-100"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {loading && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80">
                正在加载文章...
              </div>
            )}
            {!loading && error && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
                {error}
              </div>
            )}
            {!loading && !error && displayedArticles.map((article) => (
              <Link 
                key={article.id} 
                to={`/article/${article.id}`}
                className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80 transition-all duration-300 hover:shadow-md hover:ring-[#009EFF]/30 dark:hover:ring-[#33B1FF]/50 hover:-translate-y-0.5"
              >
                <h2 className="text-base md:text-[17px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors mb-2.5 line-clamp-1 tracking-tight">
                  {article.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-[1.6] mb-5 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center flex-wrap gap-y-3 gap-x-5 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-[#F0F8FF] dark:bg-[#33B1FF]/10 flex items-center justify-center text-[#009EFF] dark:text-[#33B1FF] text-[11px] font-bold ring-1 ring-[#009EFF]/20 dark:ring-[#33B1FF]/20">
                      {article.author.charAt(0).toUpperCase()}
                    </div>
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {article.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/50 group-hover:bg-[#F0F8FF] dark:group-hover:bg-[#33B1FF]/10 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] group-hover:ring-[#009EFF]/30 dark:group-hover:ring-[#33B1FF]/30 transition-colors">
                      {article.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {article.likes}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    {article.views}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && !error && hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 8, processedArticles.length))}
              className="w-full mt-2 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              查看更多 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </main>

        <aside className="w-[300px] shrink-0 hidden xl:flex flex-col gap-6">
          {/* Ad Banner - 宽度固定，高度随图片比例自适应 */}
          <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 relative group cursor-pointer h-[140px]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1592758080692-b6a5dbe9c725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHN0YWdlfGVufDF8fHx8MTc3MzMxMzY3NXww&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="RTE 2025 Developer Conference" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-5">
              <span className="text-[#009EFF] dark:text-[#33B1FF] text-xs font-bold mb-1.5 tracking-wider uppercase">推荐活动</span>
              <span className="text-white font-semibold text-base leading-snug">2025 RTE 开发者大会 · 立即报名</span>
            </div>
          </div>

          {/* Hot Articles */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/80 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-[18px] h-[18px] text-[#009EFF] dark:text-[#33B1FF]" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">周热门文章</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={prevHotPage}
                  className="p-1 rounded-md text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] hover:bg-[#F0F8FF] dark:hover:bg-[#33B1FF]/10 transition-colors" 
                  title="上一页"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextHotPage}
                  className="p-1 rounded-md text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] hover:bg-[#F0F8FF] dark:hover:bg-[#33B1FF]/10 transition-colors" 
                  title="下一页"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {displayedHotArticles.map((article, idx) => {
                const actualIdx = hotPage * 4 + idx;
                return (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="group flex gap-3 items-center"
                  >
                    <span className={`text-[13px] font-bold ${actualIdx < 3 ? 'text-[#009EFF] dark:text-[#33B1FF]' : 'text-slate-400 dark:text-slate-500'}`}>
                      {String(actualIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hot Demos */}
          <HotDemosWidget demos={HOT_DEMOS} />

          {/* Hot Tutorials */}
          <HotTutorialsWidget />
        </aside>
      </div>
    </div>
  );
}
