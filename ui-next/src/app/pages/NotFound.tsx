import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

function Illustration404() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] mx-auto"
      aria-hidden="true"
    >
      {/* Background circle glow */}
      <circle cx="240" cy="160" r="120" className="fill-[#009EFF]/[0.06] dark:fill-[#33B1FF]/[0.08]" />
      <circle cx="240" cy="160" r="80" className="fill-[#009EFF]/[0.04] dark:fill-[#33B1FF]/[0.05]" />

      {/* Grid / network dots */}
      {[
        [80, 60], [140, 40], [340, 40], [400, 60],
        [60, 140], [420, 140],
        [80, 240], [140, 260], [340, 260], [400, 240],
        [180, 80], [300, 80], [180, 240], [300, 240],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="3"
          className="fill-slate-300 dark:fill-slate-600"
          opacity={0.6 + (i % 3) * 0.15}
        />
      ))}

      {/* Connection lines (network style) */}
      {[
        [80, 60, 140, 40], [140, 40, 180, 80], [300, 80, 340, 40], [340, 40, 400, 60],
        [60, 140, 80, 60], [420, 140, 400, 60],
        [80, 240, 60, 140], [400, 240, 420, 140],
        [140, 260, 180, 240], [340, 260, 300, 240],
        [80, 240, 140, 260], [340, 260, 400, 240],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.7}
        />
      ))}

      {/* Broken link symbol in center */}
      {/* Left chain half */}
      <g className="stroke-[#009EFF] dark:stroke-[#33B1FF]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M200 148 L212 136 A20 20 0 0 1 240 136 L244 140" />
        <path d="M200 148 L196 152 A20 20 0 0 0 196 180 L208 168" />
      </g>

      {/* Right chain half (broken, shifted) */}
      <g className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M280 172 L268 184 A20 20 0 0 1 240 184 L236 180" />
        <path d="M280 172 L284 168 A20 20 0 0 0 284 140 L272 152" />
      </g>

      {/* Break spark marks */}
      <line x1="238" y1="150" x2="242" y2="146" className="stroke-[#009EFF] dark:stroke-[#33B1FF]" strokeWidth="2" strokeLinecap="round" />
      <line x1="248" y1="158" x2="252" y2="154" className="stroke-[#009EFF] dark:stroke-[#33B1FF]" strokeWidth="2" strokeLinecap="round" />
      <line x1="232" y1="166" x2="228" y2="170" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" strokeLinecap="round" />

      {/* Floating elements - disconnected nodes */}
      <circle cx="160" cy="130" r="6" className="fill-[#009EFF]/20 dark:fill-[#33B1FF]/20 stroke-[#009EFF] dark:stroke-[#33B1FF]" strokeWidth="1.5" />
      <circle cx="320" cy="190" r="6" className="fill-slate-200 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" />
      <circle cx="340" cy="120" r="4" className="fill-[#009EFF]/30 dark:fill-[#33B1FF]/30" />
      <circle cx="140" cy="200" r="4" className="fill-slate-300 dark:fill-slate-600" />

      {/* Small "x" marks for error indication */}
      <g className="stroke-red-400/60 dark:stroke-red-400/40" strokeWidth="1.5" strokeLinecap="round">
        <line x1="356" y1="86" x2="364" y2="94" />
        <line x1="364" y1="86" x2="356" y2="94" />
      </g>
      <g className="stroke-red-400/40 dark:stroke-red-400/30" strokeWidth="1.5" strokeLinecap="round">
        <line x1="112" y1="186" x2="120" y2="194" />
        <line x1="120" y1="186" x2="112" y2="194" />
      </g>

      {/* Bottom decoration - signal waves (lost signal) */}
      <path d="M220 220 Q230 210 240 220 Q250 230 260 220" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M210 232 Q225 218 240 232 Q255 246 270 232" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center">
      {/* Illustration */}
      <Illustration404 />

      {/* Error code */}
      <h1 className="mt-6 text-[72px] md:text-[96px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#8792A2] to-[#8792A2]/40 dark:from-[#90A1B9] dark:to-[#90A1B9]/40 select-none">
        404
      </h1>

      {/* Description */}
      <p className="mt-3 text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
        页面未找到
      </p>
      <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        抱歉，您访问的页面不存在或已被移除。请检查链接是否正确，或返回首页继续浏览。
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#009EFF] dark:bg-[#33B1FF] text-white text-sm font-medium hover:bg-[#008AE6] dark:hover:bg-[#33B1FF]/90 transition-all shadow-sm hover:shadow-md"
        >
          <Home className="w-4 h-4" />
          回到首页
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回上一页
        </button>
      </div>
    </div>
  );
}