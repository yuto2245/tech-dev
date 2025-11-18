import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { trpc as trpcClient } from "@/lib/trpc";

type SourceType = 'all' | 'github' | 'zenn' | 'qiita';

export default function BlogList() {
  const { data: allArticles, isLoading, error } = trpc.blog.listAll.useQuery({ 
    page: 1, 
    limit: 100,
    source: 'github'
  });
  const { data: userSettings } = trpcClient.user.getSettings.useQuery();
  const [, navigate] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceType>('github');
  const [blogFont, setBlogFont] = useState<"openai-sans" | "anthropic-serif" | "source-serif-4">("openai-sans");

  useEffect(() => {
    if (userSettings?.blogFont) {
      setBlogFont(userSettings.blogFont as "openai-sans" | "anthropic-serif" | "source-serif-4");
    }
  }, [userSettings]);

  const getFontFamily = () => {
    switch (blogFont) {
      case "anthropic-serif":
        return "Georgia, 'Times New Roman', serif";
      case "source-serif-4":
        return "'Source Serif 4', Georgia, 'Times New Roman', serif";
      default:
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  };

  // フィルタリングされた記事を計算
  const filteredArticles = useMemo(() => {
    if (!allArticles?.articles) return [];
    
    return allArticles.articles.filter((article) => {
      const topics = article.topics || [];
      const source = article.sourceType;
      
      // トピックでフィルタリング
      const matchesTopic = selectedTopic === null || 
        topics.includes(selectedTopic);
      
      // 出典でフィルタリング（GitHub のみ）
      const matchesSource = source === 'github';
      
      return matchesTopic && matchesSource;
    });
  }, [allArticles?.articles, selectedTopic, selectedSource]);

  // すべてのトピックを取得
  const allTopics = useMemo(() => {
    if (!allArticles?.articles) return [];
    const topicsSet = new Set<string>();
    allArticles.articles.forEach((article) => {
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
            <h1 className="text-5xl font-bold mb-6 text-black dark:text-white" style={{ fontFamily: getFontFamily() }}>
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
              {filteredArticles.map((article, index) => {
                return (
                  <div
                    key={`${article.sourceType}-${article.sourceId}`}
                    className="group cursor-pointer"
                    onClick={() => {
                      navigate(`/blog/${encodeURIComponent(article.sourceId)}?source=${article.sourceType}`);
                    }}
                  >
                    {/* 記事アイテム */}
                    <div className="flex gap-6 pb-8 border-b border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-200">
                      {/* 絵文字 */}
                      <div className="flex-shrink-0 pt-1">
                        <span className="text-4xl block">
                          {article.emoji || '📝'}
                        </span>
                      </div>

                      {/* 記事情報 */}
                      <div className="flex-1 min-w-0">
                        {/* タイトル */}
                        <h2 
                          className="text-xl font-semibold text-black dark:text-white mb-3 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 line-clamp-2"
                          style={{ fontFamily: getFontFamily() }}
                        >
                          {article.title}
                        </h2>

                        {/* メタ情報 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDate(article.publishedAt)}</span>
                          <span>by {article.author}</span>
                          
                          {/* トピック */}
                          {article.topics && article.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.topics.slice(0, 2).map((topic: string) => (
                                <span 
                                  key={topic}
                                  className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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
