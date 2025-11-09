import type { ArticleSummary } from "@/types/content";

export const articles: ArticleSummary[] = [
  {
    id: "1",
    title: "2025年版 Next.js 14 + Supabase 入門",
    slug: "nextjs-supabase-guide-2025",
    status: "published",
    tags: ["Next.js", "Supabase", "TypeScript"],
    author: {
      id: "author_1",
      name: "Yuki Tanaka",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4"
    },
    currentVersion: {
      id: "version_1",
      articleId: "1",
      createdAt: "2025-01-15T10:00:00.000Z",
      contentMd: `# Next.js 14 + Supabase 入門\n\n最新のApp RouterとSupabase Authを利用して高速にMVPを構築する方法を紹介します。`,
      contentHtml:
        "<h1>Next.js 14 + Supabase 入門</h1><p>最新のApp RouterとSupabase Authを利用して高速にMVPを構築する方法を紹介します。</p>",
      aiReport: {
        id: "report_1",
        articleVersionId: "version_1",
        provider: "openai-gpt-4o-mini",
        generatedAt: "2025-01-15T10:00:12.000Z",
        factConsistency: 0.92,
        logicalFlow: 0.88,
        coverage: 0.86,
        riskSummary: "Next.js 14のApp Router API仕様の参照リンクを補足するとより正確です。",
        recommendations: [
          {
            id: "rec_1",
            severity: "medium",
            title: "App Routerの安定化情報を引用",
            detail: "App Routerの安定化バージョンに関する公式ブログ記事のリンクを追加してください。"
          }
        ]
      }
    },
    trustScore: 0.91,
    excerpt: "App RouterとSupabase Authを組み合わせた最新のアーキテクチャガイド。"
  },
  {
    id: "2",
    title: "GitHub Actionsで行うOpenAIコスト最適化",
    slug: "optimize-openai-costs-github-actions",
    status: "published",
    tags: ["GitHub Actions", "OpenAI", "Cost"],
    author: {
      id: "author_2",
      name: "Mai Suzuki"
    },
    currentVersion: {
      id: "version_2",
      articleId: "2",
      createdAt: "2025-01-12T09:00:00.000Z",
      contentMd: `# OpenAI APIコスト最適化\n\nGitHub Actionsからバッチ処理を行う際のコスト監視テンプレートを紹介します。`,
      contentHtml:
        "<h1>OpenAI APIコスト最適化</h1><p>GitHub Actionsからバッチ処理を行う際のコスト監視テンプレートを紹介します。</p>",
      aiReport: {
        id: "report_2",
        articleVersionId: "version_2",
        provider: "openai-gpt-4o-mini",
        generatedAt: "2025-01-12T09:00:10.000Z",
        factConsistency: 0.85,
        logicalFlow: 0.9,
        coverage: 0.8,
        riskSummary: "コスト最適化指標の最新料金表（2025年1月時点）を引用する必要があります。",
        recommendations: [
          {
            id: "rec_2",
            severity: "high",
            title: "料金表の更新",
            detail: "OpenAI APIの2025年1月料金表へのリンクを追加してください。"
          },
          {
            id: "rec_3",
            severity: "low",
            title: "CIの再試行ポリシー",
            detail: "GitHub Actionsの再試行ポリシー設定例を追加すると読者が実装しやすくなります。"
          }
        ]
      }
    },
    trustScore: 0.86,
    excerpt: "GitHub ActionsでOpenAI APIを安全かつ安価に運用するためのベストプラクティス。"
  },
  {
    id: "3",
    title: "AIチェックを前提とした技術記事テンプレート",
    slug: "ai-review-ready-article-template",
    status: "pending",
    tags: ["AI", "Writing"],
    author: {
      id: "author_3",
      name: "Kohei Nakamura"
    },
    currentVersion: {
      id: "version_3",
      articleId: "3",
      createdAt: "2025-01-10T11:30:00.000Z",
      contentMd: `# AIチェック前提テンプレート\n\n信頼性ダッシュボードに最適化された章立てとメタデータ設計を紹介します。`,
      contentHtml:
        "<h1>AIチェック前提テンプレート</h1><p>信頼性ダッシュボードに最適化された章立てとメタデータ設計を紹介します。</p>",
      aiReport: {
        id: "report_3",
        articleVersionId: "version_3",
        provider: "openai-gpt-4o-mini",
        generatedAt: "2025-01-10T11:30:22.000Z",
        factConsistency: 0.78,
        logicalFlow: 0.82,
        coverage: 0.74,
        riskSummary: "メタデータのバリデーション例が不足しています。",
        recommendations: [
          {
            id: "rec_4",
            severity: "medium",
            title: "メタデータのJSON Schema追加",
            detail: "AIチェックに必要なJSON Schemaの例を追記してください。"
          }
        ]
      }
    },
    trustScore: 0.8,
    excerpt: "AIによるファクトチェックを想定した技術記事テンプレートの作り方。"
  }
];

export const getArticleBySlug = (slug: string) => articles.find((article) => article.slug === slug);
