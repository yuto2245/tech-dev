import { ArrowRight, BookOpen, GitBranch, Shield } from "lucide-react";

const steps = [
  {
    title: "GitHubリポジトリ同期",
    description: "記事は作者のGitHubに保持され、TechDevはWebhookで更新を監視します。",
    icon: GitBranch
  },
  {
    title: "AI整合性チェック",
    description: "Supabaseキュー経由でOpenAIにリクエストし、事実・論理・カバレッジをスコア化。",
    icon: Shield
  },
  {
    title: "信頼性ダッシュボード",
    description: "チェック結果と履歴を可視化し、改善提案をそのままPull Requestに反映できます。",
    icon: BookOpen
  }
];

export function WorkflowDiagram() {
  return (
    <section className="mx-auto mt-16 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">TechDevのレビュー・公開フロー</h2>
      <p className="mt-2 text-sm text-slate-600">投稿から公開までの流れは、シンプルかつ自動化されています。</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <step.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">STEP {index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute -right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 md:flex">
                <ArrowRight size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
