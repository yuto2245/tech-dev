export const metadata = {
  title: "利用規約"
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">利用規約</h1>
        <p className="text-sm text-slate-600">TechDevの利用に関するルールと遵守事項です。</p>
      </header>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">コンテンツの所有権</h2>
        <p className="text-sm text-slate-600">
          記事は常にユーザーが所有します。TechDevは閲覧とAIチェックのための使用権のみを保持します。
        </p>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">禁止事項</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>虚偽情報や誤解を招くコンテンツの意図的な投稿</li>
          <li>AIチェックの結果を改ざんする行為</li>
          <li>第三者の知的財産権を侵害する投稿</li>
        </ul>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">責任範囲</h2>
        <p className="text-sm text-slate-600">
          TechDevはAIチェック結果の完全性を保証しませんが、誤判定時の異議申し立てと再チェック機能を提供します。
        </p>
      </section>
    </div>
  );
}
