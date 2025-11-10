import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import path from 'path';
import { URL } from 'url';

export type Frontmatter = {
  title?: string;
  emoji?: string;
  type?: 'tech' | 'idea';
  topics?: string[];
  published?: boolean;
  [key: string]: any;
};

export type GetPostResult = {
  slug: string;
  md: string;
  html: string;
  frontmatter: Frontmatter;
  path: string;
  sha?: string;
  fetchedAt: string;
  toc: TocItem[];
};

export type TocItem = { id: string; text: string; depth: number };

export class NotFoundError extends Error {
  status = 404 as const;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

const OWNER = process.env.GITHUB_OWNER || 'yuto2245';
const REPO = process.env.GITHUB_REPO || 'zenn-docs';
const DIR = process.env.GITHUB_CONTENT_DIR || 'articles';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_API || '';

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (TOKEN) {
    h.Authorization = `Bearer ${TOKEN}`;
    h['X-GitHub-Api-Version'] = '2022-11-28';
  }
  return h;
}

async function fetchContent(path: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (res.status === 404) return { status: 404 as const, data: null as any };
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status}: ${text || url}`);
  }
  const data = await res.json();
  return { status: 200 as const, data };
}

export async function getPost(slug: string): Promise<GetPostResult> {
  const candidates = [`.md`, `.mdx`].map((ext) => `${DIR}/${encodeURIComponent(slug)}${ext}`);

  let json: any | null = null;
  let foundPath = '';

  for (const p of candidates) {
    const { status, data } = await fetchContent(p);
    if (status === 404) continue;
    json = data;
    foundPath = p;
    break;
  }

  if (!json) {
    throw new NotFoundError(`Post not found: ${slug}`);
  }

  if (json.encoding !== 'base64' || typeof json.content !== 'string') {
    throw new Error(`Unexpected content format from GitHub for ${foundPath}`);
  }

  const md = Buffer.from(json.content, 'base64').toString('utf8');

  const { data: fm, content } = matter(md);

  const toc: TocItem[] = [];
  // Derive default branch from the blob download_url if possible
  const downloadUrl: string | undefined = (json as any)?.download_url;
  const branchMatch = downloadUrl?.match(
    /https:\/\/raw\.githubusercontent\.com\/[\w-]+\/[\w.-]+\/([^/]+)\//
  );
  const defaultBranch = branchMatch?.[1] || 'master';
  const rawBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${defaultBranch}`;
  const mdDir = path.posix.dirname(foundPath);
  // Collect headings after slugging so IDs exist on nodes.
  const collectToc = () => (tree: any) => {
    visit(tree, 'heading', (node: any) => {
      const depth: number = node.depth || 0;
      if (depth < 1 || depth > 6) return;
      const text = toString(node).trim();
      if (!text) return;
      const id =
        (node.data && (node.data.hProperties?.id || node.data.id)) ||
        text
          .toLowerCase()
          .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      toc.push({ id, text, depth });
    });
  };

  // Rewrite relative image URLs to raw.githubusercontent.com
  const rewriteImages = () => (tree: any) => {
    visit(tree, 'image', (node: any) => {
      const url: string = node.url || '';
      if (!url) return;
      if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return;

      if (url.startsWith('/')) {
        const target = url.replace(/^\//, '');
        node.url = `${rawBase}/${target}`;
      } else {
        const joined = path.posix.normalize(path.posix.join(mdDir, url));
        node.url = `${rawBase}/${joined}`;
      }
    });
  };

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkSlug)
    .use(collectToc)
    .use(rewriteImages)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight, { ignoreMissing: true })
    .use(rehypeLinkCard)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  const html = processed.toString();

  return {
    slug,
    md,
    html,
    frontmatter: fm as Frontmatter,
    path: foundPath,
    sha: json.sha,
    fetchedAt: new Date().toISOString(),
    toc,
  };
}

// Rehype plugin: transform standalone URLs (paragraph that contains only a link)
// into a simple link-preview card using OpenGraph metadata.
// Limits: up to 5 cards per page; falls back gracefully on failure.
function rehypeLinkCard() {
  return async (tree: any) => {
    const candidates: any[] = [];
    visit(tree, 'element', (node: any, index: number | null, parent: any) => {
      if (!parent || node.tagName !== 'p') return;
      const only = node.children && node.children.length === 1 ? node.children[0] : null;
      if (!only || only.type !== 'element' || only.tagName !== 'a') return;
      const href = (only.properties && only.properties.href) || '';
      const text = (only.children && only.children[0] && only.children[0].value) || '';
      if (!href || !text || typeof href !== 'string' || typeof text !== 'string') return;
      if (href !== text) return; // Only pure URL text
      if (href.startsWith('#')) return; // skip anchors
      try {
        const u = new URL(href);
        if (!/^https?:$/.test(u.protocol)) return;
      } catch {
        return;
      }
      candidates.push({ node, parent, index, href });
    });

    const max = 5;
    for (const item of candidates.slice(0, max)) {
      try {
        const meta = await fetchOpenGraph(item.href);
        const card = buildLinkCard(item.href, meta);
        // Replace paragraph node with card div
        if (item.index != null) {
          item.parent.children[item.index] = card;
        }
      } catch {
        // ignore failures (leave original paragraph)
      }
    }
  };
}

async function fetchOpenGraph(urlStr: string) {
  const res = await fetch(urlStr, { redirect: 'follow' as any });
  const html = await res.text();
  const pick = (regex: RegExp) => (html.match(regex)?.[1] || '').trim();
  const title =
    pick(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    pick(/<title[^>]*>([^<]+)<\/title>/i);
  const description =
    pick(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    pick(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const image = pick(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const siteName = pick(/<meta[^>]+property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return { title, description, image, siteName };
}

function buildLinkCard(href: string, meta: { title?: string; description?: string; image?: string; siteName?: string }) {
  let domain = '';
  try {
    domain = new URL(href).hostname.replace(/^www\./, '');
  } catch {}
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['link-card'] },
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: { href, target: '_blank', rel: 'noopener noreferrer' },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['lc-body'] },
            children: [
              meta.title
                ? { type: 'element', tagName: 'div', properties: { className: ['lc-title'] }, children: [{ type: 'text', value: meta.title }] }
                : null,
              meta.description
                ? { type: 'element', tagName: 'div', properties: { className: ['lc-desc'] }, children: [{ type: 'text', value: meta.description }] }
                : null,
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['lc-site'] },
                children: [
                  favicon
                    ? { type: 'element', tagName: 'img', properties: { className: ['lc-favicon'], src: favicon, alt: '' }, children: [] }
                    : null,
                  { type: 'text', value: meta.siteName || domain || href },
                ].filter(Boolean) as any,
              },
            ].filter(Boolean) as any,
          },
          meta.image
            ? { type: 'element', tagName: 'div', properties: { className: ['lc-thumb'] }, children: [
                { type: 'element', tagName: 'img', properties: { src: meta.image, alt: '' }, children: [] },
              ] }
            : { type: 'element', tagName: 'div', properties: { className: ['lc-thumb', 'lc-thumb--empty'] }, children: [] },
        ],
      },
    ],
  };
}
