import Link from "next/link";
import type { ArticleSummary } from "@/types/content";
import { TrustMeter } from "./trust-meter";

interface ArticleCardProps {
  article: ArticleSummary;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{article.status}</p>
          <h3 className="text-xl font-semibold text-slate-900">
            <Link href={`/articles/${article.slug}`} className="hover:text-primary-600">
              {article.title}
            </Link>
          </h3>
        </div>
        <TrustMeter value={article.trustScore} size="sm" />
      </div>
      <p className="text-sm text-slate-600">{article.excerpt}</p>
      <div className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>最終チェック: {new Date(article.currentVersion.createdAt).toLocaleDateString("ja-JP")}</span>
        <span>AI: {article.currentVersion.aiReport.provider}</span>
      </div>
    </article>
  );
}
