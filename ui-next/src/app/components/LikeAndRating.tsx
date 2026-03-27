import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, Star } from "lucide-react";

interface LikeAndRatingProps {
  likeCount: number;
  ratingAvg: number;
  ratingCount: number;
  likedByMe?: boolean;
  ratedByMe?: boolean;
  myRating?: number;
  label?: string;
  onLike?: () => Promise<void>;
  onRate?: (rating: number) => Promise<void>;
}

function formatRatingSummary(ratingAvg: number, ratingCount: number) {
  if (ratingCount <= 0) {
    return "暂无评分";
  }
  return `当前均分 ${ratingAvg.toFixed(1)} · ${ratingCount} 人评分`;
}

export function LikeAndRating({
  likeCount,
  ratingAvg,
  ratingCount,
  likedByMe = false,
  ratedByMe = false,
  myRating = 0,
  label = "文章",
  onLike,
  onRate,
}: LikeAndRatingProps) {
  const [selectedRating, setSelectedRating] = useState(myRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [likePending, setLikePending] = useState(false);
  const [ratingPending, setRatingPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const likeLocked = likedByMe || ratedByMe;
  const ratingLocked = ratedByMe;

  useEffect(() => {
    setSelectedRating(myRating);
  }, [myRating]);

  const activeRating = hoverRating || selectedRating;
  const ratingSummary = useMemo(
    () => formatRatingSummary(ratingAvg, ratingCount),
    [ratingAvg, ratingCount],
  );

  const handleLike = async () => {
    if (!onLike || likePending || likeLocked) {
      return;
    }
    try {
      setLikePending(true);
      setFeedback(null);
      await onLike();
      setFeedback({ type: "success", text: "点赞已提交" });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "点赞失败，请稍后再试",
      });
    } finally {
      setLikePending(false);
    }
  };

  const handleRate = async (value: number) => {
    if (!onRate || ratingPending || ratingLocked) {
      return;
    }
    try {
      setRatingPending(true);
      setFeedback(null);
      await onRate(value);
      setSelectedRating(value);
      setFeedback({ type: "success", text: `评分已更新为 ${value} 分` });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "评分失败，请稍后再试",
      });
    } finally {
      setRatingPending(false);
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center justify-center border-t border-slate-100 pt-10 dark:border-slate-800">
      <button
        onClick={handleLike}
        disabled={likePending || likeLocked}
        className={`mb-10 flex items-center gap-2.5 rounded-full border px-8 py-3.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${
          likeLocked
            ? "scale-105 border-[#009EFF]/40 bg-[#F0F8FF] text-[#009EFF] shadow-[0_4px_12px_rgba(0,158,255,0.15)] dark:border-[#33B1FF]/40 dark:bg-[#33B1FF]/10 dark:text-[#33B1FF] dark:shadow-[0_4px_12px_rgba(51,177,255,0.15)]"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        }`}
      >
        <ThumbsUp
          className={`h-5 w-5 transition-transform ${
            likeLocked ? "scale-110 fill-[#009EFF] dark:fill-[#33B1FF]" : ""
          }`}
        />
        <span className="text-[15px] font-semibold tracking-wide">
          {likePending ? "提交中..." : likedByMe ? "已点赞" : ratedByMe ? "已参与" : "赞一个"} · {likeCount}
        </span>
      </button>

      <div className="mb-8 h-px w-16 bg-slate-100 dark:bg-slate-800" />

      <div className="mb-2 text-[15px] font-medium text-slate-600 dark:text-slate-400">
        {label}对您有帮助吗？请给个评价吧
      </div>
      <div className="mb-3 text-[13px] text-slate-400 dark:text-slate-500">
        {ratedByMe && myRating > 0
          ? `您已评分 ${myRating} 分 · ${ratingSummary}`
          : likedByMe
            ? `您已点赞，仍可评分一次 · ${ratingSummary}`
            : ratingSummary}
      </div>
      <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = activeRating >= star;
          const isHalf = activeRating === star - 0.5;

          return (
            <div
              key={star}
              className={`relative h-8 w-8 text-slate-200 transition-transform ${
                ratingPending || ratingLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-110"
              }`}
            >
              <button
                type="button"
                className="absolute left-0 top-0 z-10 h-full w-1/2"
                aria-label={`评分 ${star - 0.5}`}
                disabled={ratingPending || ratingLocked}
                onMouseEnter={() => setHoverRating(star - 0.5)}
                onClick={() => handleRate(star - 0.5)}
              />
              <button
                type="button"
                className="absolute right-0 top-0 z-10 h-full w-1/2"
                aria-label={`评分 ${star}`}
                disabled={ratingPending || ratingLocked}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => handleRate(star)}
              />
              <Star className="absolute left-0 top-0 h-8 w-8" />
              {isFull && <Star className="absolute left-0 top-0 h-8 w-8 fill-amber-400 text-amber-400" />}
              {isHalf && (
                <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden text-amber-400">
                  <Star className="h-8 w-8 fill-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-5 text-[14px] font-medium">
        {feedback ? (
          <span className={feedback.type === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
            {feedback.text}
          </span>
        ) : ratedByMe && myRating > 0 ? (
          <span className="text-slate-400 dark:text-slate-500">当前匿名访客已评分 {myRating} 分，互动已完成</span>
        ) : likedByMe ? (
          <span className="text-slate-400 dark:text-slate-500">当前匿名访客已点赞，仍可评分一次</span>
        ) : selectedRating > 0 ? (
          <span className="text-slate-400 dark:text-slate-500">您本次评分 {selectedRating} 分</span>
        ) : null}
      </div>
    </div>
  );
}
