import { motion } from "motion/react";
import { LampDesk } from "lucide-react";

interface DeskLampToggleProps {
  isDark: boolean;
  toggleDark: () => void;
}

export function DeskLampToggle({ isDark, toggleDark }: DeskLampToggleProps) {
  return (
    <div 
      className="relative flex flex-col items-center justify-center w-10 h-10 cursor-pointer group"
      onClick={toggleDark}
      title={isDark ? "开灯" : "关灯"}
    >
      {/* 亮灯时的光束效果：从灯泡位置向右下方自然衰减 */}
      <motion.div
        animate={{ 
          opacity: isDark ? 0 : 1, 
          scale: isDark ? 0.5 : 1 
        }}
        transition={{ duration: 0.3 }}
        className="absolute top-[36%] left-[46%] w-6 h-6 bg-gradient-to-br from-[#009EFF]/50 via-[#009EFF]/15 to-transparent blur-[2px] rounded-tl-full rounded-br-[10px] pointer-events-none z-20 origin-top-left"
      />

      {/* 台灯图标及点击动画 */}
      <motion.div
        whileTap={{ scale: 0.9, rotate: -15 }}
        animate={{ 
          color: isDark ? "#64748B" : "#009EFF", 
          rotate: isDark ? 0 : -5 // 开灯时稍微抬起灯头
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-10 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <LampDesk className="w-5 h-5 relative z-10" />
      </motion.div>
    </div>
  );
}
