export type ArticleStatus = "draft" | "pending" | "published";

export interface AiReport {
  id: string;
  articleVersionId: string;
  provider: string;
  generatedAt: string;
  factConsistency: number;
  logicalFlow: number;
  coverage: number;
  riskSummary: string;
  recommendations: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    title: string;
    detail: string;
  }>;
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  createdAt: string;
  contentMd: string;
  contentHtml: string;
  aiReport: AiReport;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  currentVersion: ArticleVersion;
  trustScore: number;
  excerpt: string;
}
