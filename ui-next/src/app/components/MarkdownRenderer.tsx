import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const htmlBodyClassName = [
  "text-slate-600",
  "dark:text-slate-300",
  "break-words",
  "[&_h1]:text-[28px]",
  "[&_h1]:font-bold",
  "[&_h1]:text-slate-900",
  "dark:[&_h1]:text-slate-100",
  "[&_h1]:mt-10",
  "[&_h1]:mb-5",
  "[&_h1]:leading-tight",
  "[&_h1]:tracking-tight",
  "[&_h1]:border-b",
  "[&_h1]:border-slate-100",
  "dark:[&_h1]:border-slate-800",
  "[&_h1]:pb-3",
  "[&_h2]:text-[22px]",
  "[&_h2]:font-semibold",
  "[&_h2]:text-slate-900",
  "dark:[&_h2]:text-slate-100",
  "[&_h2]:mt-10",
  "[&_h2]:mb-5",
  "[&_h3]:text-[18px]",
  "[&_h3]:font-semibold",
  "[&_h3]:text-slate-800",
  "dark:[&_h3]:text-slate-200",
  "[&_h3]:mt-8",
  "[&_h3]:mb-4",
  "[&_h4]:text-[16px]",
  "[&_h4]:font-semibold",
  "[&_h4]:text-slate-800",
  "dark:[&_h4]:text-slate-200",
  "[&_h4]:mt-6",
  "[&_h4]:mb-3",
  "[&_p]:text-[16px]",
  "[&_p]:leading-relaxed",
  "[&_p]:mb-5",
  "[&_a]:text-[#009EFF]",
  "dark:[&_a]:text-[#33B1FF]",
  "[&_a]:underline-offset-2",
  "hover:[&_a]:underline",
  "[&_ul]:list-disc",
  "[&_ul]:list-outside",
  "[&_ul]:ml-6",
  "[&_ul]:mb-5",
  "[&_ul]:space-y-2",
  "[&_ol]:list-decimal",
  "[&_ol]:list-outside",
  "[&_ol]:ml-6",
  "[&_ol]:mb-5",
  "[&_ol]:space-y-2",
  "[&_li]:leading-relaxed",
  "[&_blockquote]:border-l-4",
  "[&_blockquote]:border-[#009EFF]/40",
  "dark:[&_blockquote]:border-[#33B1FF]/40",
  "[&_blockquote]:pl-5",
  "[&_blockquote]:py-1",
  "[&_blockquote]:my-5",
  "[&_blockquote]:bg-[#009EFF]/5",
  "dark:[&_blockquote]:bg-[#33B1FF]/5",
  "[&_blockquote]:rounded-r-lg",
  "[&_blockquote]:italic",
  "[&_hr]:my-8",
  "[&_hr]:border-slate-200",
  "dark:[&_hr]:border-slate-700",
  "[&_strong]:font-semibold",
  "[&_strong]:text-slate-900",
  "dark:[&_strong]:text-slate-100",
  "[&_em]:italic",
  "[&_em]:text-slate-700",
  "dark:[&_em]:text-slate-300",
  "[&_img]:max-w-full",
  "[&_img]:rounded-xl",
  "[&_img]:my-6",
  "[&_table]:w-full",
  "[&_table]:text-[14px]",
  "[&_table]:border-collapse",
  "[&_table]:rounded-xl",
  "[&_table]:overflow-hidden",
  "[&_table]:ring-1",
  "[&_table]:ring-slate-200",
  "dark:[&_table]:ring-slate-700",
  "[&_thead]:bg-slate-50",
  "dark:[&_thead]:bg-slate-800",
  "[&_tbody_tr]:border-t",
  "[&_tbody_tr]:border-slate-100",
  "dark:[&_tbody_tr]:border-slate-800",
  "[&_th]:px-4",
  "[&_th]:py-3",
  "[&_th]:text-left",
  "[&_th]:font-semibold",
  "[&_th]:text-slate-700",
  "dark:[&_th]:text-slate-300",
  "[&_td]:px-4",
  "[&_td]:py-3",
  "[&_td]:text-slate-600",
  "dark:[&_td]:text-slate-400",
  "[&_pre]:overflow-x-auto",
  "[&_pre]:rounded-xl",
  "[&_pre]:bg-slate-950",
  "[&_pre]:p-4",
  "[&_pre]:my-6",
  "[&_pre]:text-slate-100",
  "[&_code]:font-mono",
].join(" ");

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function decodeHtmlEntitiesDeep(value: string) {
  let current = value;
  for (let i = 0; i < 3; i += 1) {
    const decoded = decodeHtmlEntities(current);
    if (decoded === current) {
      break;
    }
    current = decoded;
  }
  return current;
}

function toHeadingId(text: string) {
  return decodeHtmlEntities(stripHtml(text))
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function looksLikeHtml(content: string) {
  const trimmed = decodeHtmlEntitiesDeep(content).trim();
  if (!trimmed.includes("<") || !trimmed.includes(">")) {
    return false;
  }
  return /<\/?(p|div|br|h1|h2|h3|h4|ul|ol|li|blockquote|pre|code|table|img|a)(\s|>)/i.test(trimmed);
}

function addHeadingIdsToHtml(content: string) {
  const decodedContent = decodeHtmlEntitiesDeep(content);
  return decodedContent.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/\sid\s*=/i.test(attrs)) {
      return full;
    }
    const headingId = toHeadingId(inner);
    if (!headingId) {
      return full;
    }
    return `<h${level}${attrs} id="${headingId}">${inner}</h${level}>`;
  });
}

const components: Components = {
  // 去掉 pre 包裹，由 code 自己决定用 CodeBlock 还是行内 code
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      return (
        <CodeBlock language={match[1]}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#009EFF] dark:text-[#33B1FF] font-mono text-[0.875em]"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1({ children }) {
    return (
      <h1 className="text-[28px] font-bold text-slate-900 dark:text-slate-100 mt-10 mb-5 leading-tight tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
        {children}
      </h1>
    );
  },
  h2({ children, ...props }) {
    const id = String(children).toLowerCase().replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 mt-10 mb-5"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3({ children, ...props }) {
    const id = String(children).toLowerCase().replace(/\s+/g, "-");
    return (
      <h3
        id={id}
        className="text-[18px] font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="text-[16px] font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
        {children}
      </h4>
    );
  },
  p({ children }) {
    return (
      <p className="text-slate-600 dark:text-slate-300 text-[16px] leading-relaxed mb-5">
        {children}
      </p>
    );
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#009EFF] dark:text-[#33B1FF] hover:underline"
      >
        {children}
      </a>
    );
  },
  ul({ children }) {
    return (
      <ul className="list-disc list-outside ml-6 mb-5 space-y-2 text-slate-600 dark:text-slate-300 text-[16px]">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="list-decimal list-outside ml-6 mb-5 space-y-2 text-slate-600 dark:text-slate-300 text-[16px]">
        {children}
      </ol>
    );
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-[#009EFF]/40 dark:border-[#33B1FF]/40 pl-5 py-1 my-5 bg-[#009EFF]/5 dark:bg-[#33B1FF]/5 rounded-r-lg text-slate-600 dark:text-slate-400 italic">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="my-8 border-slate-200 dark:border-slate-700" />;
  },
  strong({ children }) {
    return (
      <strong className="font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </strong>
    );
  },
  em({ children }) {
    return (
      <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-[14px] border-collapse rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
    );
  },
  tbody({ children }) {
    return (
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </tbody>
    );
  },
  tr({ children }) {
    return (
      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        {children}
      </tr>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
        {children}
      </td>
    );
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className={htmlBodyClassName}
        dangerouslySetInnerHTML={{ __html: addHeadingIdsToHtml(content) }}
      />
    );
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** 从 Markdown 内容中提取所有 h2/h3 标题 */
export function extractHeadings(
  content: string
): { level: number; text: string; id: string }[] {
  if (looksLikeHtml(content)) {
    const headings: { level: number; text: string; id: string }[] = [];
    const matches = decodeHtmlEntitiesDeep(content).matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi);
    for (const match of matches) {
      const level = Number(match[1]);
      const text = decodeHtmlEntities(stripHtml(match[2]));
      const id = toHeadingId(match[2]);
      if (!text || !id) {
        continue;
      }
      headings.push({ level, text, id });
    }
    return headings;
  }

  const lines = content.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)$/);
    if (m2) {
      const text = m2[1].trim();
      headings.push({ level: 2, text, id: text.toLowerCase().replace(/\s+/g, "-") });
      continue;
    }
    const m3 = line.match(/^###\s+(.+)$/);
    if (m3) {
      const text = m3[1].trim();
      headings.push({ level: 3, text, id: text.toLowerCase().replace(/\s+/g, "-") });
    }
  }
  return headings;
}
