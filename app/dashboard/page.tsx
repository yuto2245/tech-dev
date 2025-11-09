import { ReliabilityBreakdown } from "@/components/reliability-breakdown";
import { articles } from "@/lib/sample-data";

export const metadata = {
  title: "信頼性ダッシュボード"
};

const safeAverage = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export default function DashboardPage() {
  const publishedArticles = articles.filter((article) => article.status === "published");
  const factAverage = safeAverage(publishedArticles.map((article) => article.currentVersion.aiReport.factConsistency));
  const humanAverage = safeAverage(publishedArticles.map((article) => article.trustScore));
  const coverageAverage = safeAverage(publishedArticles.map((article) => article.currentVersion.aiReport.coverage));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">信頼性ダッシュボード</h1>
        <p className="text-sm text-slate-600">
          AIレポートと人間のレビュー状況を統合した透明なダッシュボードで、改善の優先度がひと目でわかります。
        </p>
      </header>
      <ReliabilityBreakdown
        factRate={factAverage}
        humanInputScore={humanAverage}
        coverageScore={coverageAverage}
        backlogCount={articles.filter((article) => article.status !== "published").length}
      />
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">AIチェック履歴</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">記事</th>
                <th className="px-4 py-3">Fact</th>
                <th className="px-4 py-3">Logic</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3">最終チェック</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{article.title}</td>
                  <td className="px-4 py-3 text-slate-700">{article.currentVersion.aiReport.factConsistency.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-700">{article.currentVersion.aiReport.logicalFlow.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-700">{article.currentVersion.aiReport.coverage.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(article.currentVersion.aiReport.generatedAt).toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
