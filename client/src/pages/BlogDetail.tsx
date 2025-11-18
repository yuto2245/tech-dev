import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { ChevronLeft, Menu, X } from "lucide-react";

const getMarkdownStyles = (blogFont: "openai-sans" | "anthropic-serif" | "source-serif-4") => {
  let fontFamily = "'OpenAI Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  
  if (blogFont === "anthropic-serif") {
    fontFamily = "Georgia, 'Times New Roman', serif";
  } else if (blogFont === "source-serif-4") {
    fontFamily = "'Source Serif 4', Georgia, 'Times New Roman', serif";
  }

  return `
  .markdown {
    font-family: ${fontFamily};
    color: #1f2937;
    max-width: 900px;
  }
  
  .dark .markdown {
    color: #e5e7eb;
  }
  
  .markdown img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 32px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .markdown h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin: 56px 0 32px;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }
  
  .markdown h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 56px 0 28px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;
    line-height: 1.3;
  }
  
  .dark .markdown h2 {
    border-bottom-color: #374151;
  }
  
  .markdown h3 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 44px 0 24px;
    line-height: 1.3;
  }
  
  .markdown h4 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 32px 0 16px;
    line-height: 1.3;
  }
  
  .markdown h5,
  .markdown h6 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 28px 0 12px;
    line-height: 1.3;
  }
  
  .markdown :is(h1, h2, h3, h4, h5, h6) {
    scroll-margin-top: 80px;
  }
  
  .markdown p {
    line-height: 1.8;
    margin: 24px 0;
    font-size: 1.025rem;
    color: #374151;
    letter-spacing: 0.2px;
  }
  
  .dark .markdown p {
    color: #d1d5db;
  }
  
  .markdown p + p {
    margin-top: 16px;
  }
  
  .markdown a {
    color: #2563eb;
    text-decoration: none;
    border-bottom: 1px solid #2563eb;
    transition: all 0.2s ease;
  }
  
  .markdown a:hover {
    color: #1d4ed8;
    background-color: #dbeafe;
  }
  
  .markdown strong {
    font-weight: 700;
    color: #111827;
  }
  
  .dark .markdown strong {
    color: #f3f4f6;
  }
  
  .markdown em {
    font-style: italic;
    color: #374151;
  }
  
  .dark .markdown em {
    color: #d1d5db;
  }
  
  .markdown ul,
  .markdown ol {
    margin: 24px 0;
    padding-left: 32px;
  }
  
  .markdown li {
    margin: 12px 0;
    line-height: 1.8;
    color: #374151;
  }
  
  .dark .markdown li {
    color: #d1d5db;
  }
  
  .markdown li > :first-child {
    margin-top: 0;
  }
  
  .markdown li > :last-child {
    margin-bottom: 0;
  }
  
  .markdown li > ul,
  .markdown li > ol {
    margin: 12px 0 0 0;
  }
  
  .markdown blockquote {
    border-left: 4px solid #2563eb;
    background: #eff6ff;
    padding: 16px 20px;
    margin: 24px 0;
    border-radius: 6px;
    color: #1e40af;
  }
  
  .dark .markdown blockquote {
    background: rgba(37, 99, 235, 0.1);
    color: #60a5fa;
  }
  
  .markdown blockquote > :first-child {
    margin-top: 0;
  }
  
  .markdown blockquote > :last-child {
    margin-bottom: 0;
  }
  
  .markdown blockquote p {
    margin: 0;
    color: #1e40af;
  }
  
  .dark .markdown blockquote p {
    color: #60a5fa;
  }
  
  .markdown pre {
    background: #1f2937;
    color: #f3f4f6;
    padding: 20px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 28px 0;
    line-height: 1.5;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .markdown pre code {
    background: none;
    color: inherit;
    padding: 0;
    border-radius: 0;
    font-size: 0.95rem;
  }
  
  .markdown :not(pre) > code {
    background: #f3f4f6;
    color: #dc2626;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }
  
  .dark .markdown :not(pre) > code {
    background: #374151;
    color: #fca5a5;
  }
  
  .markdown code.hljs {
    padding: 0;
  }
  
  .markdown pre code.hljs {
    display: block;
  }
  
  .markdown table {
    border-collapse: collapse;
    width: 100%;
    margin: 28px 0;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .dark .markdown table {
    border-color: #374151;
  }
  
  .markdown table thead {
    background: #f3f4f6;
  }
  
  .dark .markdown table thead {
    background: #1f2937;
  }
  
  .markdown table th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 700;
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .dark .markdown table th {
    color: #f3f4f6;
    border-bottom-color: #374151;
  }
  
  .markdown table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
  }
  
  .dark .markdown table td {
    border-bottom-color: #374151;
    color: #d1d5db;
  }
  
  .markdown table tbody tr:hover {
    background: #f9fafb;
  }
  
  .dark .markdown table tbody tr:hover {
    background: #111827;
  }
  
  .markdown hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 48px 0;
  }
  
  .dark .markdown hr {
    border-top-color: #374151;
  }
  
  .markdown .link-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    margin: 24px 0;
    transition: all 0.3s ease;
  }
  
  .dark .markdown .link-card {
    background: #111827;
    border-color: #374151;
  }
  
  .markdown .link-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
  }
  
  .markdown .link-card > a {
    display: grid;
    grid-template-columns: 1fr 128px;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    align-items: center;
  }
  @media (max-width: 640px) {
    .markdown .link-card > a {
      grid-template-columns: 1fr;
    }
  }
  .markdown .link-card .lc-body {
    padding: 12px;
  }
  .markdown .link-card .lc-title {
    font-weight: 700;
    margin-bottom: 6px;
    color: #0f172a;
  }
  
  .dark .markdown .link-card .lc-title {
    color: #f3f4f6;
  }
  
  .markdown .link-card .lc-desc {
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.6;
    max-height: 3.2em;
    overflow: hidden;
  }
  
  .dark .markdown .link-card .lc-desc {
    color: #9ca3af;
  }
  
  .markdown .link-card .lc-site {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: #64748b;
  }
  
  .dark .markdown .link-card .lc-site {
    color: #6b7280;
  }
  
  .markdown .link-card .lc-image {
    width: 128px;
    height: 128px;
    object-fit: cover;
  }
  
  .markdown .alert {
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
    padding: 16px 20px;
    margin: 24px 0;
    border-radius: 6px;
    color: #92400e;
  }
  
  .dark .markdown .alert {
    background: rgba(245, 158, 11, 0.1);
    color: #fbbf24;
  }
  
  .markdown .alert > :first-child {
    margin-top: 0;
  }
  
  .markdown .alert > :last-child {
    margin-bottom: 0;
  }
  
  .markdown .alert p {
    margin: 0;
    color: #92400e;
  }
  
  .dark .markdown .alert p {
    color: #fbbf24;
  }
  
  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 32px;
    margin-top: 32px;
  }
  
  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .article-card {
    background: transparent;
    border-radius: 0;
    padding: 0;
    border: none;
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  @media (max-width: 1024px) {
    .sidebar {
      display: none;
    }
  }
  
  .toc-toggle {
    display: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #000;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .dark .toc-toggle {
    background: #fff;
    color: #000;
  }
  
  @media (max-width: 1024px) {
    .toc-toggle {
      display: flex;
    }
  }
  
  .toc-toggle:hover {
    background: #1f2937;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
  
  .dark .toc-toggle:hover {
    background: #e5e7eb;
  }
  
  .toc-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 30;
  }
  
  @media (max-width: 1024px) {
    .toc-overlay.open {
      display: block;
    }
  }
  
  .toc {
    position: sticky;
    top: 80px;
    align-self: start;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    background: #ffffff;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .dark .toc {
    background: #111827;
    border-color: #374151;
  }
  
  @media (max-width: 1024px) {
    .toc {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      max-width: 320px;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
      border: none;
      border-left: 1px solid #e5e7eb;
      z-index: 40;
      transition: right 0.3s ease;
      overflow-y: auto;
      padding: 20px;
    }
    
    .dark .toc {
      border-left-color: #374151;
    }
    
    .toc.open {
      right: 0;
    }
  }
  
  @media (max-width: 640px) {
    .toc {
      max-width: 280px;
      padding: 16px;
    }
    
    .toc-title {
      font-size: 1rem;
      margin-bottom: 12px;
    }
    
    .toc-item a {
      font-size: 0.9rem;
      padding: 6px 0;
    }
  }
  
  .toc-title {
    font-weight: 700;
    font-size: 1.125rem;
    margin: 0 0 16px 0;
    color: #0f172a;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .dark .toc-title {
    color: #f3f4f6;
    border-bottom-color: #374151;
  }
  
  .toc-empty {
    color: #9ca3af;
    font-size: 0.95rem;
    padding: 8px 0;
  }
  
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-item {
    padding: 8px 0;
    margin: 0;
  }
  
  .toc-item a {
    text-decoration: none;
    color: #6b7280;
    display: block;
    font-size: 0.95rem;
    line-height: 1.5;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
    padding-left: 12px;
  }
  
  .dark .toc-item a {
    color: #9ca3af;
  }
  
  .toc-item a:hover {
    color: #1f2937;
    background-color: #f3f4f6;
    border-radius: 4px;
  }
  
  .dark .toc-item a:hover {
    color: #e5e7eb;
    background-color: #374151;
  }
  
  .toc-item.active a {
    color: #1d4ed8;
    font-weight: 600;
    border-left-color: #2563eb;
    background-color: #eff6ff;
  }
  
  .dark .toc-item.active a {
    color: #60a5fa;
    background-color: rgba(37, 99, 235, 0.1);
  }
  
  .toc-item.depth-2 a {
    padding-left: 28px;
  }
  
  .toc-item.depth-3 a {
    padding-left: 44px;
  }
  
  .toc-item.depth-4 a {
    padding-left: 60px;
  }
  
  .toc-item.depth-5 a {
    padding-left: 76px;
  }
  
  .toc-item.depth-6 a {
    padding-left: 92px;
  }
  
  .chatkit-container {
    position: sticky;
    top: 24px;
    align-self: start;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    height: 600px;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .freshness-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #4b5563;
    margin-bottom: 24px;
  }
  
  .dark .freshness-badge {
    background: #1f2937;
    border-color: #374151;
    color: #d1d5db;
  }

  .freshness-badge.loading {
    background: linear-gradient(
      90deg,
      #f8f9fa 0%,
      #f8f9fa 20%,
      #e0e7ff 50%,
      #f8f9fa 80%,
      #f8f9fa 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border: 1px solid #dbeafe;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;
};

type TOCItem = {
  id: string;
  text: string;
  depth: number;
};

export default function BlogDetail() {
  const { user } = useAuth();
  const blogFont = (user?.blogFont as "openai-sans" | "anthropic-serif" | "source-serif-4") || "openai-sans";
  const [match, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  const searchParams = new URLSearchParams(window.location.search);
  const source = (searchParams.get('source') as any) || 'github';
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
        content: post.html,
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
      <style>{getMarkdownStyles(blogFont)}</style>
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
                  <h1 className="text-4xl font-bold mb-6 text-black dark:text-white" style={{ fontFamily: blogFont === "anthropic-serif" ? "Georgia, serif" : blogFont === "source-serif-4" ? "'Source Serif 4', serif" : "inherit" }}>
                    {post.title}
                  </h1>
                  
                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                    <span>by <strong className="text-black dark:text-white">{post.author}</strong></span>
                    {post.isOfficial && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        ✓ Official
                      </span>
                    )}
                  </div>
                  
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
                  
                  <div
                    className="markdown"
                    dangerouslySetInnerHTML={{ __html: post.html }}
                  />
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
