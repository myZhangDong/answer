import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
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
