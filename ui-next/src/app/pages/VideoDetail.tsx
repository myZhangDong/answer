import { ChevronLeft, PlayCircle, Eye, Clock, ThumbsUp, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { CtaBanner } from "../components/CtaBanner";
import { LikeAndRating } from "../components/LikeAndRating";
import { HotTutorialsWidget } from "../components/SidebarWidgets";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import {
  ContentVideo,
  fetchContentFeedback,
  fetchVideoDetail,
  submitContentLike,
  submitContentRating,
} from "../api/contentApi";
import {
  getContentFeedbackVisitorState,
  markContentFeedbackVisitorAction,
} from "../utils/contentFeedbackVisitor";

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
        const localVisitorState = getContentFeedbackVisitorState("video", id);
        void fetchContentFeedback("video", id)
          .then((feedback) => {
            if (!active) {
              return;
            }
            setVideo((prev) =>
              prev
                ? {
                    ...prev,
                    likes: feedback.likeCount,
                    ratingAvg: feedback.ratingAvg,
                    ratingCount: feedback.ratingCount,
                    likedByMe: feedback.likedByMe || Boolean(localVisitorState?.liked),
                    ratedByMe: feedback.ratedByMe || Boolean(localVisitorState?.rated),
                    myRating: feedback.myRating || localVisitorState?.rating || 0,
                  }
                : prev,
            );
          })
          .catch(() => {
            if (!active || !localVisitorState) {
              return;
            }
            setVideo((prev) =>
              prev
                ? {
                    ...prev,
                    likedByMe: Boolean(localVisitorState.liked),
                    ratedByMe: Boolean(localVisitorState.rated),
                    myRating: localVisitorState.rating || 0,
                  }
                : prev,
            );
          });
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

  const handleLike = async () => {
    const feedback = await submitContentLike("video", video.id);
    markContentFeedbackVisitorAction("video", video.id, "like");
    setVideo((prev) =>
      prev
        ? {
            ...prev,
            likes: feedback.likeCount,
            ratingAvg: feedback.ratingAvg,
            ratingCount: feedback.ratingCount,
            likedByMe: true,
            ratedByMe: prev.ratedByMe || feedback.ratedByMe,
            myRating: prev.myRating || feedback.myRating,
          }
        : prev,
    );
  };

  const handleRate = async (rating: number) => {
    const feedback = await submitContentRating("video", video.id, rating);
    markContentFeedbackVisitorAction("video", video.id, "rating", rating);
    setVideo((prev) =>
      prev
        ? {
            ...prev,
            likes: feedback.likeCount,
            ratingAvg: feedback.ratingAvg,
            ratingCount: feedback.ratingCount,
            likedByMe: prev.likedByMe || feedback.likedByMe,
            ratedByMe: true,
            myRating: rating || feedback.myRating || prev.myRating,
          }
        : prev,
    );
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="mb-5">
        <Link to="/videos" className="inline-flex items-center text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> 返回视频列表
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 transition-colors dark:bg-[#111827] dark:ring-slate-800 sm:p-6 md:p-10 lg:p-12">
            
            {/* Header */}
            <div className="mb-6 border-b border-slate-100 pb-6 dark:border-slate-800 sm:mb-8 sm:pb-8">
              <h1 className="mb-4 text-[24px] font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:mb-5 sm:text-[28px] md:text-[32px]">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[13px] text-slate-500 dark:text-slate-400 sm:text-[14px]">
                <div className="flex min-w-0 items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <img 
                    src={video.authorAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=admin"} 
                    alt={video.author} 
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                  />
                  <span className="truncate">{video.author}</span>
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
                  {video.ratingCount > 0
                    ? `${video.ratingAvg.toFixed(1)} 分 · ${video.ratingCount} 人评分`
                    : "暂无评分"}
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
                className="mx-auto mb-8 w-full max-w-4xl overflow-hidden rounded-2xl ring-1 ring-slate-200/50 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:max-w-full dark:ring-slate-800"
                dangerouslySetInnerHTML={{ __html: video.embedCode }}
              />
            ) : (
              <div className="group relative mx-auto mb-8 flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200/50 dark:bg-black dark:ring-slate-800">
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
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#009EFF] dark:group-hover:bg-[#33B1FF] sm:h-20 sm:w-20"
                >
                    <PlayCircle className="h-8 w-8 fill-white/20 text-white sm:h-10 sm:w-10" />
                  </a>
                ) : (
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md sm:h-20 sm:w-20">
                    <PlayCircle className="h-8 w-8 fill-white/20 text-white sm:h-10 sm:w-10" />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm sm:bottom-4 sm:right-4 sm:text-sm">
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

            <LikeAndRating
              likeCount={video.likes}
              ratingAvg={video.ratingAvg}
              ratingCount={video.ratingCount}
              likedByMe={video.likedByMe}
              ratedByMe={video.ratedByMe}
              myRating={video.myRating}
              label="视频"
              onLike={handleLike}
              onRate={handleRate}
            />

            <CtaBanner />
          </div>
        </main>

        <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:w-64">
          <HotTutorialsWidget />
        </aside>
      </div>
    </div>
  );
}
