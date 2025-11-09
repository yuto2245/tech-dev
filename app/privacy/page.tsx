export const metadata = {
  title: "プライバシーポリシー"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">プライバシーポリシー</h1>
        <p className="text-sm text-slate-600">TechDevでのデータの取り扱いとユーザー保護に関する方針を定義します。</p>
      </header>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">データ取得</h2>
        <p className="text-sm text-slate-600">
          投稿記事、AIチェック結果、ユーザーアクティビティはSupabaseで暗号化された状態で管理します。MVPではキーストローク等のセンシティブな行動データは取得しません。
        </p>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">サードパーティ連携</h2>
        <p className="text-sm text-slate-600">
          GitHub OAuthは必要最低限の権限のみを要求し、OpenAI APIキーはVercelの暗号化シークレットストアで管理します。
        </p>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">ユーザーの権利</h2>
        <p className="text-sm text-slate-600">
          AIチェックの結果に異議申し立てがある場合は、再チェックや手動レビューをリクエストできます。データ削除は設定からいつでも申請可能です。
        </p>
      </section>
    </div>
  );
}
