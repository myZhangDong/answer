import { useState } from "react";
import { ThumbsUp, Star } from "lucide-react";

interface LikeAndRatingProps {
  initialLikes?: number;
  label?: string;
}

export function LikeAndRating({ initialLikes = 0, label = "文章" }: LikeAndRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);
  };

  return (
    <div className="mt-12 flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-10">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2.5 px-8 py-3.5 rounded-full border mb-10 transition-all duration-300 ${
          isLiked
            ? "bg-[#F0F8FF] dark:bg-[#33B1FF]/10 border-[#009EFF]/40 dark:border-[#33B1FF]/40 text-[#009EFF] dark:text-[#33B1FF] shadow-[0_4px_12px_rgba(0,158,255,0.15)] dark:shadow-[0_4px_12px_rgba(51,177,255,0.15)] scale-105"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
        }`}
      >
        <ThumbsUp
          className={`w-5 h-5 transition-transform ${isLiked ? "fill-[#009EFF] dark:fill-[#33B1FF] scale-110" : ""}`}
        />
        <span className="font-semibold text-[15px] tracking-wide">
          {isLiked ? "已赞" : "赞一个"} · {likes}
        </span>
      </button>

      <div className="w-16 h-px bg-slate-100 dark:bg-slate-800 mb-8" />

      <div className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-4">
        {label}对您有帮助吗？请给个评价吧
      </div>
      <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const activeRating = hoverRating || rating;
          const isFull = activeRating >= star;
          const isHalf = activeRating === star - 0.5;

          return (
            <div key={star} className="relative w-8 h-8 cursor-pointer text-slate-200 transition-transform hover:scale-110">
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHoverRating(star - 0.5)}
                onClick={() => setRating(star - 0.5)}
              />
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(star)}
              />
              <Star className="w-8 h-8 absolute top-0 left-0" />
              {isFull && <Star className="w-8 h-8 absolute top-0 left-0 fill-amber-400 text-amber-400" />}
              {isHalf && (
                <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden text-amber-400">
                  <Star className="w-8 h-8 fill-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[14px] text-slate-400 font-medium h-5">
        {rating > 0 ? `您已评价 ${rating} 颗星，谢谢支持！` : ""}
      </div>
    </div>
  );
}
