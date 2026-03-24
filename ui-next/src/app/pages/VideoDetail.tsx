import { ChevronLeft, PlayCircle, Eye, Clock, ThumbsUp, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { CtaBanner } from "../components/CtaBanner";
import { LikeAndRating } from "../components/LikeAndRating";
import { HotTutorialsWidget } from "../components/SidebarWidgets";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { ContentVideo, fetchVideoDetail } from "../api/contentApi";

export function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState<ContentVideo | null>(null);
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
        const resp = await fetchVideoDetail(id);
        if (!active) {
          return;
        }
        setVideo(resp);
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
  }, [id]);

  if (loading) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-slate-500 dark:text-slate-400">正在加载视频...</div>;
  }

  if (error || !video) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-red-500">{error || "视频不存在"}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Link to="/videos" className="inline-flex items-center text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> 返回视频列表
        </Link>
      </div>

      <div className="flex gap-8 items-start">
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white dark:bg-[#111827] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 dark:ring-slate-800 p-8 md:p-12 transition-colors">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
              <h1 className="text-[28px] md:text-[32px] font-bold text-slate-900 dark:text-slate-100 mb-5 leading-tight tracking-tight">
                {video.title}
              </h1>
              
              <div className="flex items-center flex-wrap gap-5 text-[14px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <img 
                    src={video.authorAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=admin"} 
                    alt={video.author} 
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                  />
                  {video.author}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {video.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {video.views}次播放
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-slate-400" />
                  {video.likes}次点赞
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-slate-400" />
                  暂无评分
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[12px] font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                    {video.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Player Mock */}
            {video.embedCode ? (
              <div
                className="w-full max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-800"
                dangerouslySetInnerHTML={{ __html: video.embedCode }}
              />
            ) : (
              <div className="aspect-video w-full max-w-4xl mx-auto bg-slate-900 dark:bg-black rounded-2xl overflow-hidden relative flex items-center justify-center group cursor-pointer mb-8 ring-1 ring-slate-200/50 dark:ring-slate-800">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                {video.videoUrl ? (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-[#009EFF] dark:group-hover:bg-[#33B1FF] transition-all duration-300"
                  >
                    <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                  </a>
                ) : (
                  <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-medium">
                  {video.duration}
                </div>
              </div>
            )}

            {/* Video Description */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 prose-p:leading-loose">
              <h3 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 mb-4 mt-8">视频简介</h3>
              <div className="text-slate-600 dark:text-slate-300 text-[16px] leading-relaxed mb-4">
                {video.description}
              </div>
              {video.content && <MarkdownRenderer content={video.content} />}
            </div>

            <LikeAndRating initialLikes={video.likes} label="视频" />

            <CtaBanner />
          </div>
        </main>

        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 sticky top-24">
          <HotTutorialsWidget />
        </aside>
      </div>
    </div>
  );
}
