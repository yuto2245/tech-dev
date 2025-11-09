import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { ArticleSummary } from "@/types/content";

interface AiReportSummaryProps {
  article: ArticleSummary;
}

const severityStyles: Record<string, string> = {
  low: "bg-emerald-50 border-emerald-200 text-emerald-700",
  medium: "bg-amber-50 border-amber-200 text-amber-800",
  high: "bg-rose-50 border-rose-200 text-rose-700"
};

export function AiReportSummary({ article }: AiReportSummaryProps) {
  const report = article.currentVersion.aiReport;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AIチェック結果</h2>
          <p className="text-sm text-slate-500">{new Date(report.generatedAt).toLocaleString("ja-JP")}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-xs font-semibold text-primary-700">
          <ShieldCheck size={16} />
          {report.provider}
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Fact Consistency", value: report.factConsistency },
          { label: "Logical Flow", value: report.logicalFlow },
          { label: "Coverage", value: report.coverage }
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value.toFixed(2)}</p>
            <p className="text-xs text-slate-500">AI評価値</p>
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">リスクサマリー</p>
        <p className="text-sm text-slate-700">{report.riskSummary}</p>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">修正提案</h3>
        <ul className="space-y-2">
          {report.recommendations.map((recommendation) => (
            <li
              key={recommendation.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${severityStyles[recommendation.severity]}`}
            >
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{recommendation.title}</p>
                <p className="text-sm">{recommendation.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
