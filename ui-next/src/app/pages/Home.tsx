import { Clock, Eye, Tag, ChevronLeft, ChevronRight, TrendingUp, ThumbsUp } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { HotDemosWidget, HotTutorialsWidget } from "../components/SidebarWidgets";
import {
  ContentArticle,
  ContentArticleTagOption,
  ContentHomepageSettings,
  fetchArticleTags,
  fetchArticles,
  fetchHotProjects,
  fetchHotVideos,
  fetchHomepageSettings,
  ContentProject,
  ContentVideo,
} from "../api/contentApi";

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortType, setSortType] = useState<"latest" | "hot">("latest");
  const [hotPage, setHotPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [hotArticles, setHotArticles] = useState<ContentArticle[]>([]);
  const [hotProjects, setHotProjects] = useState<ContentProject[]>([]);
  const [hotVideos, setHotVideos] = useState<ContentVideo[]>([]);
  const [tagOptions, setTagOptions] = useState<ContentArticleTagOption[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<ContentHomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hotProjectsLoading, setHotProjectsLoading] = useState(true);
  const [hotVideosLoading, setHotVideosLoading] = useState(true);
  const activeCategory = searchParams.get("tag") || "";

  useEffect(() => {
    let active = true;

    const load = async () => {
      setHotProjectsLoading(true);
      setHotVideosLoading(true);

      const [tagsResult, homepageResult, hotArticlesResult, hotProjectsResult, hotVideosResult] = await Promise.allSettled([
        fetchArticleTags(),
        fetchHomepageSettings(),
        fetchArticles({ page: 1, pageSize: 100, order: "hot" }),
        fetchHotProjects(),
        fetchHotVideos(),
      ]);

      if (!active) {
        return;
      }

      if (tagsResult.status === "fulfilled") {
        setTagOptions(tagsResult.value.filter((item) => item.slugName && item.displayName));
      } else {
        setTagOptions([]);
      }

      if (homepageResult.status === "fulfilled") {
        setHomepageSettings(homepageResult.value);
      } else {
        setHomepageSettings(null);
      }

      if (hotArticlesResult.status === "fulfilled") {
        setHotArticles(hotArticlesResult.value.list);
      } else {
        setHotArticles([]);
      }

      if (hotProjectsResult.status === "fulfilled") {
        setHotProjects(hotProjectsResult.value);
      } else {
        setHotProjects([]);
      }

      if (hotVideosResult.status === "fulfilled") {
        setHotVideos(hotVideosResult.value);
      } else {
        setHotVideos([]);
      }

      setHotProjectsLoading(false);
      setHotVideosLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      setLoading(true);
      setError("");

      try {
        const resp = await fetchArticles({
          page: 1,
          pageSize: 100,
          order: sortType === "latest" ? "newest" : "hot",
          tag: activeCategory || undefined,
        });
        if (!active) {
          return;
        }
        setArticles(resp.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setArticles([]);
        setError(err instanceof Error ? err.message : "文章加载失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    setVisibleCount(8);
    loadArticles();

    return () => {
      active = false;
    };
  }, [activeCategory, sortType]);

  useEffect(() => {
    setHotPage(0);
  }, [activeCategory]);

  const categories = useMemo(() => {
    const base = [{ slugName: "", displayName: "全部" }];
    const normalized = tagOptions.map((item) => ({
      slugName: item.slugName,
      displayName: item.displayName,
    }));
    if (activeCategory && !normalized.some((item) => item.slugName === activeCategory)) {
      normalized.unshift({
        slugName: activeCategory,
        displayName: activeCategory,
      });
    }
    return base.concat(normalized);
  }, [activeCategory, tagOptions]);

  const totalHotPages = Math.max(1, Math.ceil(hotArticles.length / 4));
  const displayedHotArticles = hotArticles.slice(hotPage * 4, (hotPage + 1) * 4);

  const nextHotPage = () => setHotPage((p) => (p + 1) % totalHotPages);
  const prevHotPage = () => setHotPage((p) => (p - 1 + totalHotPages) % totalHotPages);
  const displayedArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;
  const homeBanner = homepageSettings?.homeBanner;
  const hotArticlesAd = homepageSettings?.hotArticlesAd;

  const handleCategoryChange = (slugName: string) => {
    const next = new URLSearchParams(searchParams);
    if (slugName) {
      next.set("tag", slugName);
    } else {
      next.delete("tag");
    }
    setSearchParams(next);
  };

  const renderLinkedImage = (imageUrl: string, linkUrl: string, alt: string, className: string) => {
    const image = (
      <ImageWithFallback
        src={imageUrl}
        alt={alt}
        className={className}
      />
    );

    if (!linkUrl) {
      return image;
    }

    const isExternal = /^https?:\/\//.test(linkUrl);
    return (
      <a
        href={linkUrl}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="block h-full w-full"
      >
        {image}
      </a>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {homeBanner?.enabled && homeBanner.imageUrl && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-800">
          {renderLinkedImage(
            homeBanner.imageUrl,
            homeBanner.linkUrl,
            "首页 Banner",
            "h-auto min-h-[160px] w-full object-cover md:min-h-[220px]",
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex flex-col gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-700/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              {categories.map((cat) => (
                <button
                  key={cat.slugName || "all"}
                  onClick={() => handleCategoryChange(cat.slugName)}
                  className={clsx(
                    "whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 sm:px-5",
                    activeCategory === cat.slugName
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm ring-1 ring-slate-900 dark:ring-slate-100"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {cat.displayName}
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
            {!loading && !error && displayedArticles.length === 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80">
                {activeCategory ? "当前标签下暂无文章。" : "暂无文章。"}
              </div>
            )}
            {!loading && !error && displayedArticles.map((article) => (
              <Link 
                key={article.id} 
                to={`/article/${article.id}`}
                className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-[#009EFF]/30 dark:bg-slate-800 dark:ring-slate-700/80 dark:hover:ring-[#33B1FF]/50 sm:p-6"
              >
                <h2 className="text-base md:text-[17px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors mb-2.5 line-clamp-1 tracking-tight">
                  {article.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-[1.6] mb-5 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center flex-wrap gap-x-4 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
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
                  <div className="flex items-center gap-1.5 text-slate-400 sm:ml-auto">
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
              onClick={() => setVisibleCount((prev) => Math.min(prev + 8, articles.length))}
              className="w-full mt-2 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              查看更多 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </main>

        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-[300px]">
          {hotArticlesAd?.enabled && hotArticlesAd.imageUrl && (
            <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
              {renderLinkedImage(
                hotArticlesAd.imageUrl,
                hotArticlesAd.linkUrl,
                "周热门文章广告位",
                "h-[140px] w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]",
              )}
            </div>
          )}

          {/* Hot Articles */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700/80 sm:p-6">
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
          <HotDemosWidget demos={hotProjects} loading={hotProjectsLoading} />

          {/* Hot Tutorials */}
          <HotTutorialsWidget tutorials={hotVideos} loading={hotVideosLoading} />
        </aside>
      </div>
    </div>
  );
}
