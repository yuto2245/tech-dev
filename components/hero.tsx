import Link from "next/link";

export function Hero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-primary-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            AI Fact Checked • GitHub Native • Privacy Conscious
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            信頼できる技術知識を、AIと人の協働で届ける
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            TechDevは、GitHubで管理された記事をAIが常時モニタリングし、古い情報や誤った記述を検知する次世代の技術ブログプラットフォームです。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/articles"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
            >
              記事を探す
            </Link>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-600"
            >
              GitHub連携をセットアップ
            </Link>
          </div>
          <dl className="grid max-w-3xl gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">AIレビュー完了記事</dt>
              <dd className="text-2xl font-semibold text-slate-900">326</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">平均信頼性スコア</dt>
              <dd className="text-2xl font-semibold text-slate-900">0.87</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">GitHub同期リポジトリ</dt>
              <dd className="text-2xl font-semibold text-slate-900">142</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-sm font-semibold text-slate-700">AIチェックレポート（例）</h2>
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Risk Summary</p>
            <p className="text-sm text-slate-700">
              Next.jsのApp Routerに関するリリースノートへの参照が不足しています。公式ブログ記事を引用してください。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Fact", "Logic", "Coverage"].map((label, index) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{[0.92, 0.88, 0.86][index]}</p>
                <p className="text-xs text-slate-500">AI double-check</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-xl border border-primary-200 bg-primary-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">提案された改善</p>
            <ul className="space-y-2 text-sm text-primary-900">
              <li>・ App Routerの安定化に関する公式リンクを追加</li>
              <li>・ Supabase Authのレート制限ポリシーを補足</li>
              <li>・ 2025年の料金表を引用</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
