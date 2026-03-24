import { Play, Clock, Eye, User, ChevronRight, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { clsx } from "clsx";
import { ContentVideo, fetchVideos } from "../api/contentApi";

const CATEGORIES = ["全部", "基础篇", "进阶篇", "群组篇", "AI篇"];

export function VideoTutorials() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [visibleCount, setVisibleCount] = useState(8);
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetchVideos({ page: 1, pageSize: 100, order: "newest" });
        if (!active) {
          return;
        }
        setVideos(resp.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "视频加载失败");
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

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => activeCategory === "全部" || video.category === activeCategory),
    [activeCategory, videos],
  );
  const displayedVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, filteredVideos.length));
  };

  return (
    <div className="flex gap-8 items-start pb-12">
      <div className="flex-1 min-w-0 flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-[24px] font-semibold text-slate-900 dark:text-slate-100 mb-2.5 tracking-tight">视频教程</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">提供丰富的视频教程，帮助您快速了解和接入环信服务。</p>
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

        <div className="flex flex-col gap-8">
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {loading && (
            <div className="col-span-full rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-100/80 dark:ring-slate-700/80">
              正在加载视频...
            </div>
          )}
          {!loading && error && (
            <div className="col-span-full rounded-2xl bg-white dark:bg-slate-800 p-6 text-sm text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
              {error}
            </div>
          )}
          {displayedVideos.map((video) => (
            <Link to={`/video/${video.id}`} key={video.id} className="group flex flex-col gap-4 cursor-pointer">
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:ring-[#009EFF]/30 dark:group-hover:ring-[#33B1FF]/30">
                <ImageWithFallback 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] px-2 py-1 rounded-md font-medium backdrop-blur-sm">
                  {video.duration}
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 className="font-semibold text-[15px] text-slate-900 dark:text-slate-100 line-clamp-1 mb-3 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors leading-snug tracking-tight">
                  {video.title}
                </h3>
                <div className="flex items-center gap-3.5 text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {video.author}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {video.views}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                    {video.likes}
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {video.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

          {!loading && !error && hasMore && (
            <button 
              onClick={handleLoadMore}
              className="w-full mt-2 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              查看更多 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
