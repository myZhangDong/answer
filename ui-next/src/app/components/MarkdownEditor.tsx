import { useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Minus,
  Image,
  Eye,
  Edit3,
  Columns2,
  Table,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

type EditorMode = "edit" | "split" | "preview";

interface ToolItem {
  icon: React.ElementType;
  label: string;
  action: (textarea: HTMLTextAreaElement, setValue: (v: string) => void) => void;
  divider?: boolean;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
  before: string,
  after: string = "",
  placeholder = "文本"
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || placeholder;
  const newValue =
    value.slice(0, start) + before + selected + after + value.slice(end);
  setValue(newValue);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
  }, 0);
}

function insertLine(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
  prefix: string,
  placeholder = "内容"
) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", start);
  const endPos = lineEnd === -1 ? value.length : lineEnd;
  const lineContent = value.slice(lineStart, endPos).replace(/^#+\s|^>\s|^-\s|^\d+\.\s/, "");
  const newLine = prefix + (lineContent || placeholder);
  const newValue = value.slice(0, lineStart) + newLine + value.slice(endPos);
  setValue(newValue);
  setTimeout(() => {
    textarea.focus();
    const newCursor = lineStart + newLine.length;
    textarea.selectionStart = newCursor;
    textarea.selectionEnd = newCursor;
  }, 0);
}

const TOOLS: (ToolItem | "divider")[] = [
  {
    icon: Heading2,
    label: "二级标题",
    action: (ta, sv) => insertLine(ta, sv, "## ", "标题"),
  },
  {
    icon: Heading3,
    label: "三级标题",
    action: (ta, sv) => insertLine(ta, sv, "### ", "标题"),
  },
  "divider",
  {
    icon: Bold,
    label: "粗体",
    action: (ta, sv) => wrapSelection(ta, sv, "**", "**", "粗体文字"),
  },
  {
    icon: Italic,
    label: "斜体",
    action: (ta, sv) => wrapSelection(ta, sv, "*", "*", "斜体文字"),
  },
  "divider",
  {
    icon: Code,
    label: "行内代码",
    action: (ta, sv) => wrapSelection(ta, sv, "`", "`", "code"),
  },
  {
    icon: Edit3,
    label: "代码块",
    action: (ta, sv) => {
      const start = ta.selectionStart;
      const value = ta.value;
      const selected = ta.value.slice(start, ta.selectionEnd) || "// 代码";
      const block = `\`\`\`javascript\n${selected}\n\`\`\``;
      const newValue = value.slice(0, start) + block + value.slice(ta.selectionEnd);
      sv(newValue);
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = start + 14;
        ta.selectionEnd = start + 14 + selected.length;
      }, 0);
    },
  },
  "divider",
  {
    icon: Link,
    label: "链接",
    action: (ta, sv) => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const selected = value.slice(start, end) || "链接文字";
      const link = `[${selected}](url)`;
      sv(value.slice(0, start) + link + value.slice(end));
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = start + selected.length + 3;
        ta.selectionEnd = start + selected.length + 6;
      }, 0);
    },
  },
  {
    icon: Image,
    label: "图片",
    action: (ta, sv) => {
      const start = ta.selectionStart;
      const value = ta.value;
      const img = `![图片描述](图片URL)`;
      sv(value.slice(0, start) + img + value.slice(start));
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = start + img.length;
        ta.selectionEnd = start + img.length;
      }, 0);
    },
  },
  "divider",
  {
    icon: List,
    label: "无序列表",
    action: (ta, sv) => insertLine(ta, sv, "- ", "列表项"),
  },
  {
    icon: ListOrdered,
    label: "有序列表",
    action: (ta, sv) => insertLine(ta, sv, "1. ", "列表项"),
  },
  {
    icon: Quote,
    label: "引用",
    action: (ta, sv) => insertLine(ta, sv, "> ", "引用内容"),
  },
  "divider",
  {
    icon: Table,
    label: "表格",
    action: (ta, sv) => {
      const start = ta.selectionStart;
      const value = ta.value;
      const table = `\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |\n`;
      sv(value.slice(0, start) + table + value.slice(start));
      setTimeout(() => { ta.focus(); }, 0);
    },
  },
  {
    icon: Minus,
    label: "分割线",
    action: (ta, sv) => {
      const start = ta.selectionStart;
      const value = ta.value;
      const hr = `\n---\n`;
      sv(value.slice(0, start) + hr + value.slice(start));
      setTimeout(() => { ta.focus(); }, 0);
    },
  },
];

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "在此输入 Markdown 内容...",
  minHeight = 480,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTool = useCallback(
    (tool: ToolItem) => {
      if (!textareaRef.current) return;
      tool.action(textareaRef.current, onChange);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.slice(0, start) + "  " + value.slice(end);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = start + 2;
        ta.selectionEnd = start + 2;
      }, 0);
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="flex flex-col rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-[#111827] overflow-hidden">
      {/* ── 工具栏 ── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex-wrap">
        {TOOLS.map((tool, idx) =>
          tool === "divider" ? (
            <div
              key={`div-${idx}`}
              className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"
            />
          ) : (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              onClick={() => handleTool(tool)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-all"
            >
              <tool.icon className="w-3.5 h-3.5" />
            </button>
          )
        )}

        {/* 模式切换 */}
        <div className="ml-auto flex items-center gap-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg p-0.5">
          {(
            [
              { key: "edit", icon: Edit3, label: "编辑" },
              { key: "split", icon: Columns2, label: "分屏" },
              { key: "preview", icon: Eye, label: "预览" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                mode === key
                  ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 编辑区 ── */}
      <div className="flex flex-1" style={{ minHeight }}>
        {/* 编辑器 */}
        {(mode === "edit" || mode === "split") && (
          <div
            className={`flex flex-col ${
              mode === "split" ? "w-1/2 border-r border-slate-100 dark:border-slate-800" : "w-full"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              spellCheck={false}
              className="flex-1 w-full resize-none bg-transparent px-5 py-4 font-mono text-[14px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none leading-relaxed"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* 预览区 */}
        {(mode === "preview" || mode === "split") && (
          <div
            className={`overflow-y-auto px-6 py-4 ${
              mode === "split" ? "w-1/2" : "w-full"
            }`}
            style={{ minHeight }}
          >
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600 text-[14px]">
                预览区域（编辑内容后实时显示）
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 状态栏 ── */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[12px] text-slate-400 dark:text-slate-600">
        <span>字数：{wordCount}</span>
        <span>字符：{charCount}</span>
        <span className="ml-auto">Markdown 编辑器 · Tab = 两格缩进</span>
      </div>
    </div>
  );
}
