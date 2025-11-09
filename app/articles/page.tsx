import { ArticleCard } from "@/components/article-card";
import { articles } from "@/lib/sample-data";

export const metadata = {
  title: "記事一覧"
};

export default function ArticleListPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">AIチェック済みの記事一覧</h1>
        <p className="text-sm text-slate-600">
          GitHubで管理された記事をAIがスコアリングし、信頼性指標とともに公開しています。
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
