import { Clock, Eye, ChevronLeft, ChevronRight, ListTree, FileText, ThumbsUp, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import { MarkdownRenderer, extractHeadings } from "../components/MarkdownRenderer";
import { CtaBanner } from "../components/CtaBanner";
import { LikeAndRating } from "../components/LikeAndRating";
import { useEffect, useMemo, useState } from "react";
import { ContentArticle, fetchArticleDetail, fetchArticles } from "../api/contentApi";

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ContentArticle | null>(null);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
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
        const [detail, listResp] = await Promise.all([
          fetchArticleDetail(id),
          fetchArticles({ page: 1, pageSize: 100, order: "newest" }),
        ]);
        if (!active) {
          return;
        }
        setArticle(detail);
        setArticles(listResp.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "文章加载失败");
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

  const currentIndex = useMemo(
    () => articles.findIndex((item) => item.id === article?.id),
    [article?.id, articles],
  );
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < articles.length - 1
      ? articles[currentIndex + 1]
      : null;

  const headings = extractHeadings(article?.content || "");

  if (loading) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-slate-500 dark:text-slate-400">正在加载文章...</div>;
  }

  if (error || !article) {
    return <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 text-sm text-red-500">{error || "文章不存在"}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> 返回列表
        </Link>
      </div>

      <div className="flex gap-8 items-start">
        <main className="flex-1 min-w-0">
          <article className="rounded-2xl bg-white dark:bg-[#111827] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 dark:ring-slate-800 p-8 md:p-12 transition-colors">
            {/* 文章头部 */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
              <h1 className="text-[28px] md:text-[32px] font-bold text-slate-900 dark:text-slate-100 mb-5 leading-tight tracking-tight">
                {article.title}
              </h1>
              <div className="flex items-center flex-wrap gap-5 text-[14px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#009EFF] to-[#33B1FF] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                    {article.author.slice(0, 1).toUpperCase()}
                  </div>
                {article.author}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {article.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {(article.views || 0).toLocaleString()}次浏览
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-slate-400" />
                  {article.likes}次点赞
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-slate-400" />
                  暂无评分
                </div>
                <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[12px] font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                  {article.tag}
                </span>
              </div>
            </div>

            {/* Markdown 正文 */}
            <MarkdownRenderer content={article.content} />

            <LikeAndRating initialLikes={article.likes} label="文章" />
            <CtaBanner />
          </article>
        </main>

        {/* 右侧边栏 */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 sticky top-24">
          {/* 目录 */}
          {headings.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 dark:ring-slate-700/80 p-6 transition-colors">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100/80 dark:border-slate-700/80">
                <ListTree className="w-4 h-4 text-[#009EFF] dark:text-[#33B1FF]" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">
                  文章目录
                </h3>
              </div>
              <nav className="flex flex-col gap-2.5">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`text-[13px] text-slate-500 dark:text-slate-400 hover:text-[#009EFF] dark:hover:text-[#33B1FF] font-medium transition-colors border-l-[3px] border-transparent hover:border-[#009EFF]/50 dark:hover:border-[#33B1FF]/50 ${
                      h.level === 3 ? "pl-5" : "pl-3"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* 上一篇 / 下一篇 */}
          {(prevArticle || nextArticle) && (
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-100/80 dark:ring-slate-700/80 p-6 transition-colors">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100/80 dark:border-slate-700/80">
                <FileText className="w-4 h-4 text-[#009EFF] dark:text-[#33B1FF]" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight">
                  更多阅读
                </h3>
              </div>
              <div className="flex flex-col gap-5">
                {prevArticle && (
                  <Link to={`/article/${prevArticle.id}`} className="group flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" /> 上一篇
                    </span>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors line-clamp-2 leading-snug">
                      {prevArticle.title}
                    </span>
                  </Link>
                )}
                {prevArticle && nextArticle && (
                  <div className="h-px w-full bg-slate-100/80 dark:bg-slate-700/80" />
                )}
                {nextArticle && (
                  <Link
                    to={`/article/${nextArticle.id}`}
                    className="group flex flex-col gap-1.5 text-right"
                  >
                    <span className="text-[12px] font-medium text-slate-400 flex items-center justify-end gap-1">
                      下一篇 <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#009EFF] dark:group-hover:text-[#33B1FF] transition-colors line-clamp-2 leading-snug">
                      {nextArticle.title}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
