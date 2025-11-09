import { Hero } from "@/components/hero";
import { WorkflowDiagram } from "@/components/workflow-diagram";
import { Checklist } from "@/components/checklist";
import { ArticleCard } from "@/components/article-card";
import { TrustMeter } from "@/components/trust-meter";
import { articles } from "@/lib/sample-data";
import Link from "next/link";

export default function HomePage() {
  const highlightedArticles = articles.slice(0, 2);
  const averageTrust =
    highlightedArticles.reduce((total, article) => total + article.trustScore, 0) / highlightedArticles.length;

  return (
    <div className="space-y-16 pb-20">
      <Hero />
      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">AIが可視化する信頼性スコア</h2>
            <p className="text-sm leading-6 text-slate-600">
              TechDevはAIによるファクトチェック・論理検証・カバレッジのスコアを公開し、読者と作者双方が改善点を把握できます。
            </p>
            <TrustMeter value={averageTrust} />
            <Link href="/dashboard" className="text-sm font-semibold text-primary-600 hover:underline">
              信頼性ダッシュボードを見る →
            </Link>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">最新のAIチェック済み記事</h3>
            <div className="grid gap-4">
              {highlightedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <WorkflowDiagram />
      <Checklist />
      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">TechDevが解決する課題</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">GitHub資産を活かす公開体験</h3>
              <p className="text-sm text-slate-600">
                記事は常にGitHubで管理され、TechDevは最適化されたビューとコミュニティ機能を提供します。
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">AIによる継続的な整合性検証</h3>
              <p className="text-sm text-slate-600">
                編集時やGitHub同期時に自動でAIチェックが走り、古い情報や危険な記述を早期検知します。
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">透明な改善プロセス</h3>
              <p className="text-sm text-slate-600">
                AIレポートはJSON形式で保存され、ダッシュボードとGitHub上の議論で共有できます。
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">安心のガバナンス</h3>
              <p className="text-sm text-slate-600">
                モデレーションと監視アラートを備え、スパムや誤情報の拡散を防止します。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
