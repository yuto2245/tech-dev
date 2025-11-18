import path from "node:path";
import fs from "node:fs/promises";
import matter from "gray-matter";
import { ENV } from "./env";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Root } from "mdast";

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export type ArticleSummary = {
  slug: string;
  sourceId: string;
  sourceType: "github";
  title: string;
  summary: string;
  publishedAt: string;
  topics: string[];
  emoji: string;
  author: string;
  heroImage?: string;
  readingTimeMinutes: number;
  repoPath: string;
};

export type ArticleDetail = ArticleSummary & {
  content: string;
  toc: TocItem[];
  isOfficial: boolean;
  htmlUrl: string;
  sha?: string;
};

const LIST_CACHE_MS = 1000 * 60 * 5;
const DETAIL_CACHE_MS = 1000 * 60 * 5;
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const SAMPLE_DIR = path.resolve(import.meta.dirname, "../sample-content/articles");

let listCache: { updatedAt: number; items: ArticleSummary[] } | null = null;
const detailCache = new Map<string, { updatedAt: number; data: ArticleDetail }>();

type GithubFileResponse = {
  path: string;
  content: string;
  sha?: string;
  html_url?: string;
};

type GithubTreeResponse = {
  tree?: Array<{ path: string; type: string }>;
};

const headers: Record<string, string> = {
  "User-Agent": "tech-dev-blog",
  Accept: "application/vnd.github+json",
};
if (ENV.githubToken) {
  headers.Authorization = `Bearer ${ENV.githubToken}`;
}

function isGithubConfigured() {
  return Boolean(ENV.githubOwner && ENV.githubRepo);
}

function buildSlug(filePath: string) {
  const base = filePath.replace(/\\/g, "/");
  const parts = base.split("/");
  const last = parts[parts.length - 1] ?? base;
  return last.replace(/\.(md|mdx)$/i, "");
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(entry => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map(entry => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function calcReadingTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function buildSummary(markdown: string, maxLength = 220) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[#>*_]/g, "")
    .trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function buildToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  visit(tree, "heading", node => {
    if (!("depth" in node) || typeof node.depth !== "number") return;
    if (node.depth < 2 || node.depth > 4) return;
    const text = toString(node).trim();
    if (!text) return;
    items.push({ id: slugger.slug(text), text, depth: node.depth });
  });

  return items;
}

function createArticleDetail(
  repoPath: string,
  markdown: string,
  overrides: Partial<ArticleDetail> = {}
): ArticleDetail {
  const { data, content } = matter(markdown);
  const slug = overrides.slug ?? buildSlug(repoPath);
  const publishedAt = data.publishedAt || data.date || new Date().toISOString();
  const topics = toArray(data.topics ?? data.tags);
  const summary = data.description || data.summary || buildSummary(content);
  const author = data.author || ENV.defaultAuthor;
  const emoji = data.emoji || "📝";
  const heroImage = data.heroImage || data.coverImage;
  const htmlUrl = overrides.htmlUrl ||
    (isGithubConfigured()
      ? `https://github.com/${ENV.githubOwner}/${ENV.githubRepo}/blob/${ENV.githubBranch}/${repoPath}`
      : repoPath);
  const readingTimeMinutes = overrides.readingTimeMinutes ?? calcReadingTime(content);
  const base: ArticleDetail = {
    slug,
    sourceId: slug,
    sourceType: "github",
    title: data.title || slug,
    summary,
    publishedAt,
    topics,
    emoji,
    author,
    heroImage,
    readingTimeMinutes,
    repoPath,
    content,
    toc: overrides.toc ?? buildToc(content),
    isOfficial: Boolean(data.official || data.isOfficial),
    htmlUrl,
    sha: overrides.sha,
  };

  return { ...base, ...overrides };
}

async function fetchGithubJson<T>(url: string) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function fetchGithubFile(repoPath: string): Promise<ArticleDetail> {
  const base = `https://api.github.com/repos/${ENV.githubOwner}/${ENV.githubRepo}/contents/${repoPath}`;
  const data = await fetchGithubJson<GithubFileResponse>(base);
  const markdown = Buffer.from(data.content, "base64").toString("utf-8");
  return createArticleDetail(repoPath, markdown, {
    sha: data.sha,
    htmlUrl: data.html_url,
  });
}

async function fetchGithubArticleList(): Promise<ArticleSummary[]> {
  if (!isGithubConfigured()) return [];
  const treeUrl = `https://api.github.com/repos/${ENV.githubOwner}/${ENV.githubRepo}/git/trees/${ENV.githubBranch}?recursive=1`;
  const tree = await fetchGithubJson<GithubTreeResponse>(treeUrl);
  const baseDir = ENV.githubContentDir.replace(/\\/g, "/").replace(/(^\/|\/$)/g, "");
  const entries = tree.tree ?? [];
  const articleEntries = entries.filter(item => {
    if (!item.path || item.type !== "blob") return false;
    if (baseDir && !item.path.startsWith(`${baseDir}/`)) return false;
    const ext = path.extname(item.path).toLowerCase();
    return MARKDOWN_EXTENSIONS.has(ext);
  });

  const summaries: ArticleSummary[] = [];
  for (const entry of articleEntries) {
    try {
      const detail = await fetchGithubFile(entry.path);
      summaries.push(detail);
      detailCache.set(detail.slug, { updatedAt: Date.now(), data: detail });
    } catch (error) {
      console.warn(`[blog] Failed to fetch ${entry.path}:`, error);
    }
  }

  return summaries;
}

async function readSampleFiles(): Promise<ArticleSummary[]> {
  const summaries: ArticleSummary[] = [];
  try {
    const files = await fs.readdir(SAMPLE_DIR);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!MARKDOWN_EXTENSIONS.has(ext)) continue;
      const fullPath = path.join(SAMPLE_DIR, file);
      const markdown = await fs.readFile(fullPath, "utf-8");
      const repoPath = path.relative(path.resolve(import.meta.dirname, ".."), fullPath);
      const detail = createArticleDetail(repoPath, markdown);
      summaries.push(detail);
      detailCache.set(detail.slug, { updatedAt: Date.now(), data: detail });
    }
  } catch (error) {
    console.error("[blog] Failed to load sample articles", error);
  }
  return summaries;
}

async function refreshList(): Promise<ArticleSummary[]> {
  const articles = isGithubConfigured()
    ? await fetchGithubArticleList().catch(error => {
        console.error("[blog] Falling back to sample content", error);
        return readSampleFiles();
      })
    : await readSampleFiles();

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  listCache = { updatedAt: Date.now(), items: articles };
  return articles;
}

export async function fetchGithubArticles(): Promise<ArticleSummary[]> {
  if (listCache && Date.now() - listCache.updatedAt < LIST_CACHE_MS) {
    return listCache.items;
  }
  return refreshList();
}

export async function fetchGithubArticle(slug: string): Promise<ArticleDetail | null> {
  const cached = detailCache.get(slug);
  if (cached && Date.now() - cached.updatedAt < DETAIL_CACHE_MS) {
    return cached.data;
  }

  const articles = await fetchGithubArticles();
  const match = articles.find(article => article.slug === slug || article.sourceId === slug);
  if (!match) return null;

  try {
    if (match.repoPath.startsWith("sample-content")) {
      const samplePath = path.resolve(import.meta.dirname, "..", match.repoPath);
      const markdown = await fs.readFile(samplePath, "utf-8");
      const detail = createArticleDetail(match.repoPath, markdown, { slug: match.slug });
      detailCache.set(slug, { updatedAt: Date.now(), data: detail });
      return detail;
    }

    if (isGithubConfigured()) {
      const detail = await fetchGithubFile(match.repoPath);
      detailCache.set(slug, { updatedAt: Date.now(), data: detail });
      return detail;
    }
  } catch (error) {
    console.error(`[blog] Failed to load article ${match.repoPath}`, error);
  }

  return null;
}
