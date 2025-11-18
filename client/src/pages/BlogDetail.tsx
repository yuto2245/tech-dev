import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { ChevronLeft, Menu, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { usePreferences, getBlogFontFamily } from "@/contexts/PreferencesContext";

const getMarkdownStyles = () => ``;


type TOCItem = {
  id: string;
  text: string;
  depth: number;
};

export default function BlogDetail() {
  const { blogFont } = usePreferences();
  const fontFamily = useMemo(() => getBlogFontFamily(blogFont), [blogFont]);
  const [match, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  const sourceParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("source") : null;
  const source = (sourceParam as any) || 'github';
  const [activeId, setActiveId] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [freshnessCheck, setFreshnessCheck] = useState<any>(null);
  const [showAIMessage, setShowAIMessage] = useState(false);
  const [isCheckingFreshness, setIsCheckingFreshness] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const chatKitControl = useChatKit({
    api: {
      apiKey: import.meta.env.VITE_FRONTEND_FORGE_API_KEY || "",
    },
  } as any) as any;

  const { data: post, isLoading, error } = trpc.blog.get.useQuery(
    { slug, source },
    { enabled: !!slug }
  );

  // Context7を使用した記事の鮮度チェック
  const checkFreshnessMutation = trpc.blog.checkFreshness.useMutation();

  // 相対時間を計算する関数
const getRelativeTime = (dateString: string) => {
  const now = Date.now();
  const checkTime = new Date(dateString).getTime();
  const diffMs = now - checkTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

  const handleTocToggle = () => {
    setIsTocOpen(!isTocOpen);
  };

  const handleTocItemClick = () => {
    setIsTocOpen(false);
  };

  const handleTocOverlayClick = () => {
    setIsTocOpen(false);
  };

  const handleCheckFreshness = async () => {
    if (!post) return;
    setIsCheckingFreshness(true);
    try {
      const result = await checkFreshnessMutation.mutateAsync({
        slug,
        content: post.content,
      });
      setFreshnessCheck(result);
    } catch (e) {
      console.error('Failed to check freshness:', e);
      setFreshnessCheck({
        success: false,
        error: 'Failed to check freshness',
        aiModel: 'gpt-4o',
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setIsCheckingFreshness(false);
    }
  };

  useEffect(() => {
    if (!post) return;

    const handleScroll = () => {
      const headings = document.querySelectorAll(".markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6");
      let currentId = "";

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement;
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  if (!match) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-black flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            {/* Back Button */}
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors mb-12 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Articles
            </button>

            {error && (
              <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-lg mb-8">
                Failed to load post: {(error as any).message}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
              </div>
            )}

            {!isLoading && post && (
              <div className="layout-grid">
                <div className="article-card">
                  <h1 className="text-4xl font-bold mb-6 text-black dark:text-white" style={{ fontFamily }}>
                    {post.title}
                  </h1>
                  
                  {/* メタ情報 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>by <strong className="text-black dark:text-white">{post.author}</strong></span>
                    {post.isOfficial && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        ✓ Official
                      </span>
                    )}
                  </div>

                  {post.heroImage && (
                    <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
                      <img src={post.heroImage} alt="" className="h-auto w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  
                  {/* チェック中のローディング表示 */}
                  {isCheckingFreshness && (
                    <div className="freshness-badge loading">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">✨</span>
                        <div>Analyzing article with AI...</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 記事の鮮度チェック結果表示 */}
                  {freshnessCheck && !isCheckingFreshness && (
                    <div className="mb-8">
                      <div className="freshness-badge">
                        <span>✓</span>
                        <div>
                          Fact-checked by {freshnessCheck.aiModel || 'gpt-4o'} using Context7 MCP {freshnessCheck.checkedAt ? getRelativeTime(freshnessCheck.checkedAt) : 'just now'}
                        </div>
                      </div>
                      
                      {/* AIメッセージ表示ボタン */}
                      {freshnessCheck.aiMessage && (
                        <button
                          onClick={() => setShowAIMessage(!showAIMessage)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-3 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{showAIMessage ? '▼' : '▶'}</span>
                          <span>{showAIMessage ? 'Hide analysis' : 'View analysis'}</span>
                        </button>
                      )}
                      
                      {/* AIメッセージ表示 */}
                      {showAIMessage && freshnessCheck.aiMessage && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 rounded text-sm text-gray-800 dark:text-gray-200 animate-slideDown">
                          <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Analysis Result</div>
                          <div>{freshnessCheck.aiMessage}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* チェックボタン */}
                  {!freshnessCheck && !isCheckingFreshness && (
                    <button
                      onClick={handleCheckFreshness}
                      className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-8"
                    >
                      Check Article Freshness
                    </button>
                  )}
                  
                  <MarkdownRenderer content={post.content} />
                </div>

                <div className="sidebar">
                  <div className={`toc ${isTocOpen ? 'open' : ''}`}>
                    <div className="toc-title">Table of Contents</div>
                    {post.toc && Array.isArray(post.toc) && post.toc.length > 0 ? (
                      <ul className="toc-list">
                        {(post.toc as TOCItem[]).map((item: TOCItem, index: number) => (
                          <li
                            key={`${source}-${slug}-toc-${index}-${item.id}`}
                            className={`toc-item depth-${item.depth} ${activeId === item.id ? "active" : ""}`}
                          >
                            <a href={`#${item.id}`} onClick={handleTocItemClick}>{item.text}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="toc-empty">No headings found</div>
                    )}
                  </div>

                  {/* ChatKit Container */}
                  {showChat && (
                    <div className="chatkit-container">
                      <ChatKit control={chatKitControl as any} />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* TOC Overlay for mobile */}
            <div className={`toc-overlay ${isTocOpen ? 'open' : ''}`} onClick={handleTocOverlayClick} />
            
            {/* TOC Toggle Button for mobile */}
            <button className="toc-toggle" onClick={handleTocToggle} title="Toggle Table of Contents">
              {isTocOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
