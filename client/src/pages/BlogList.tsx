import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { usePreferences, getBlogFontFamily } from "@/contexts/PreferencesContext";

export default function BlogList() {
  const { data: allArticles, isLoading, error } = trpc.blog.listAll.useQuery({
    page: 1,
    limit: 100,
    source: 'github'
  });
  const [, navigate] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { blogFont } = usePreferences();
  const fontFamily = getBlogFontFamily(blogFont);

  const articles = allArticles?.articles ?? [];

  // フィルタリングされた記事を計算
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => {
      const topics = article.topics || [];
      const matchesTopic = selectedTopic === null || topics.includes(selectedTopic);
      return matchesTopic;
    });
  }, [articles, selectedTopic]);

  // すべてのトピックを取得
  const allTopics = useMemo(() => {
    if (!articles) return [];
    const topicsSet = new Set<string>();
    articles.forEach(article => {
      const topics = article.topics || [];
      topics.forEach((topic: string) => topicsSet.add(topic));
    });
    return Array.from(topicsSet).sort();
  }, [allArticles?.articles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* タイトル */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6 text-black dark:text-white" style={{ fontFamily }}>
              My Articles
            </h1>
            <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
          </div>

          {/* トピックフィルター */}
          {allTopics.length > 0 && (
            <div className="mb-12 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTopic(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTopic === null
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                All
              </button>
              {allTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTopic === topic
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg mb-8">
              Failed to load articles: {(error as any).message}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
              </div>
            </div>
          )}

          {!isLoading && filteredArticles && filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTopic
                  ? 'No articles match your selection.'
                  : 'No articles found.'}
              </p>
            </div>
          )}

          {!isLoading && filteredArticles && filteredArticles.length > 0 && (
            <div className="space-y-8">
              {filteredArticles.map(article => {
                return (
                  <div
                    key={`${article.sourceType}-${article.sourceId}`}
                    className="group cursor-pointer"
                    onClick={() => {
                      navigate(`/blog/${encodeURIComponent(article.sourceId)}?source=${article.sourceType}`);
                    }}
                  >
                    {/* 記事アイテム */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-gray-600 md:flex-row md:items-center">
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-2xl">{article.emoji || '📝'}</span>
                          <span>{formatDate(article.publishedAt)}</span>
                          <span>by {article.author}</span>
                          <span>・ {article.readingTimeMinutes} min read</span>
                        </div>
                        <h2
                          className="text-2xl font-semibold text-black transition-colors group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-200"
                          style={{ fontFamily }}
                        >
                          {article.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                          {article.summary}
                        </p>
                        {article.topics && article.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.topics.slice(0, 3).map(topic => (
                              <span
                                key={topic}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {article.heroImage && (
                        <div className="h-32 w-full overflow-hidden rounded-xl md:w-48">
                          <img
                            src={article.heroImage}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
