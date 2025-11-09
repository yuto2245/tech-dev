import { notFound } from "next/navigation";
import Link from "next/link";
import { AiReportSummary } from "@/components/ai-report-summary";
import { TrustMeter } from "@/components/trust-meter";
import { getArticleBySlug } from "@/lib/sample-data";

interface ArticleDetailPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: ArticleDetailPageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "記事が見つかりません"
    };
  }

  return {
    title: article.title,
    description: article.excerpt
  };
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const report = article.currentVersion.aiReport;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-3 py-1">{article.status.toUpperCase()}</span>
          <span>最終更新 {new Date(article.currentVersion.createdAt).toLocaleString("ja-JP")}</span>
          <span>AI Provider {report.provider}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900">{article.title}</h1>
        <p className="text-sm text-slate-600">{article.excerpt}</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Author</span>
            <span>{article.author.name}</span>
          </div>
          <TrustMeter value={article.trustScore} />
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <AiReportSummary article={article} />
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Markdownコンテンツ（要約）</h2>
        <div
          className="prose max-w-none prose-slate"
          dangerouslySetInnerHTML={{ __html: article.currentVersion.contentHtml }}
        />
        <Link
          href={`/api/articles/${article.slug}/raw`}
          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline"
        >
          Markdownを取得する →
        </Link>
      </section>
    </div>
  );
}
