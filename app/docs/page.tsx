export const metadata = {
  title: "ドキュメント"
};

const sections = [
  {
    title: "はじめに",
    description: "TechDevのコンセプトとMVPスコープ、AIチェックの位置付けを説明します。",
    items: [
      "TechDevはGitHub資産を尊重するブログプラットフォームです。",
      "AIチェックは投稿後30秒以内に非同期で完了します。",
      "ブラウザ内コード実行など高負荷機能はMVPには含まれません。"
    ]
  },
  {
    title: "アーキテクチャ",
    description: "Next.js + Supabase + OpenAI APIによる構成概要。",
    items: [
      "Next.js App Routerを使ったフロントエンドとAPI統合",
      "Supabase Edge Functionsでジョブキューを実装し、AI処理を非同期化",
      "OpenAI GPT-4o-miniでファクトチェック用JSONを生成"
    ]
  },
  {
    title: "データモデル",
    description: "users, articles, article_versions, ai_reportsテーブルなどの概要。",
    items: [
      "articlesテーブルはcurrent_version_idとtrust_scoreを保持",
      "article_versionsテーブルはMarkdownとHTMLの両方を保存",
      "ai_reportsテーブルでAIプロバイダ、コスト、スコアを追跡"
    ]
  }
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">TechDev ドキュメント</h1>
        <p className="text-sm text-slate-600">
          プラットフォームのコンセプト、アーキテクチャ、データモデル、運用ポリシーをまとめています。
        </p>
      </header>
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
