import { useState } from "react";
import { Check, Copy, Sun, Moon } from "lucide-react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-5 mb-8 shadow-inner group/code transition-colors duration-300",
        isLight ? "bg-[#f5f5f5]" : "bg-[#1e1e1e] dark:bg-[#0B1120]"
      )}
    >
      {/* 工具栏：亮/暗切换 + 复制 */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200">
        {/* 亮/暗切换 */}
        <button
          onClick={() => setIsLight((v) => !v)}
          title={isLight ? "切换暗色" : "切换亮色"}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
            isLight
              ? "bg-black/10 text-slate-600 hover:bg-black/20 hover:text-slate-900"
              : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-slate-200"
          )}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* 复制 */}
        <button
          onClick={handleCopy}
          title={copied ? "已复制" : "复制代码"}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
            copied
              ? "bg-green-500/20 text-green-400"
              : isLight
              ? "bg-black/10 text-slate-600 hover:bg-black/20 hover:text-slate-900"
              : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-slate-200"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <pre
        className={cn(
          "text-[14px] font-mono leading-relaxed transition-colors duration-300",
          isLight ? "text-[#1e1e1e]" : "text-[#d4d4d4]"
        )}
      >
        <code className={language ? `language-${language}` : ""}>{children}</code>
      </pre>
    </div>
  );
}
