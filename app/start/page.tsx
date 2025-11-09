import Link from "next/link";

export const metadata = {
  title: "はじめる"
};

const steps = [
  {
    title: "アカウント登録",
    description: "GitHub OAuthまたはメールアドレスでサインアップし、利用規約に同意します。"
  },
  {
    title: "GitHubリポジトリの接続",
    description: "既存の記事リポジトリを選択するか、新しいテンプレートから作成します。"
  },
  {
    title: "AIチェックの実行",
    description: "投稿または同期を行うとSupabaseキュー経由でAIチェックが自動的に実行されます。"
  }
];

export default function StartPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">TechDevをはじめる</h1>
        <p className="text-sm text-slate-600">
          GitHub資産とAI整合性チェックを組み合わせた公開体験をセットアップしましょう。
        </p>
      </header>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">STEP {index + 1}</p>
            <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
            <p className="text-sm text-slate-600">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-800">
        <p className="font-semibold">サンプルリポジトリ</p>
        <p className="mt-2">
          Quick start用に <code className="rounded bg-white px-2 py-1">tech-dev/example-articles</code> テンプレートを提供しています。Forkして接続してください。
        </p>
        <Link href="https://github.com" className="mt-3 inline-flex text-sm font-semibold text-primary-700 hover:underline">
          サンプルを見る →
        </Link>
      </div>
    </div>
  );
}
