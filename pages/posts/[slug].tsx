import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { getPost, NotFoundError } from '../../lib/getPost';

type TocItem = { id: string; text: string; depth: number };

type Props = {
  html: string;
  title?: string;
  slug: string;
  toc: TocItem[];
};

const PostPage: NextPage<Props> = ({ html, title, slug, toc }) => {
  const pageTitle = title || slug;
  const [activeId, setActiveId] = useState<string>('');

  // Observe headings to highlight current section in ToC
  useEffect(() => {
    const container = document.querySelector('.markdown');
    if (!container) return;
    const headings = Array.from(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLElement[];
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first visible heading closest to the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.id) setActiveId(top.id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [html]);

  // Smooth anchor scroll behavior
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName !== 'A') return;
      const href = (target as HTMLAnchorElement).getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const el = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 72; // offset for header
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', href);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
  return (
    <main style={{ maxWidth: 1160, margin: '40px auto', padding: '0 16px' }}>
      <Head>
        <title>{pageTitle}</title>
        {/* highlight.js dark GitHub theme for rehype-highlight */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
      </Head>
      <div className="layout-grid">
        <div className="article-card">
          <h1 style={{ marginBottom: 16 }}>{pageTitle}</h1>
          <article className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <aside
          className="toc-card"
        >
          <div className="toc-title">目次</div>
          {toc && toc.length > 0 ? (
            <ul className="toc-list">
              {toc.map((h) => (
                <li key={h.id} className={`toc-item depth-${h.depth} ${activeId === h.id ? 'active' : ''}`}>
                  <a href={`#${encodeURIComponent(h.id)}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="toc-empty">見出しがありません</div>
          )}
        </aside>
      </div>
      <style jsx global>{`
        body { background: #f1f5f9; }

        .layout-grid { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 28px; }
        @media (max-width: 1024px) { .layout-grid { grid-template-columns: minmax(0,1fr); } }

        .article-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }

        .toc-card { position: sticky; top: 24px; align-self: start; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: #ffffff; }
        .toc-title { font-weight: 700; margin: 4px 8px 8px; color: #0f172a; }
        .toc-empty { color: #6b7280; }
        .toc-list { list-style: none; padding: 4px 8px 8px; margin: 0; }
        .toc-item { padding: 6px 0; }
        .toc-item a { text-decoration: none; color: #0f172a; display: inline-flex; align-items: center; gap: 8px; }
        .toc-item::before { content: ''; width: 6px; height: 6px; border-radius: 9999px; background: #cbd5e1; display: inline-block; }
        .toc-item.active::before { background: #2563eb; }
        .toc-item.active a { color: #1d4ed8; font-weight: 600; }
        .toc-item.depth-2 a { padding-left: 8px; }
        .toc-item.depth-3 a { padding-left: 16px; }
        .toc-item.depth-4 a { padding-left: 24px; }
        .toc-item.depth-5 a { padding-left: 32px; }
        .toc-item.depth-6 a { padding-left: 40px; }

        .markdown img { max-width: 100%; height: auto; border-radius: 8px; }
        .markdown pre { background: #0b1020; color: #e5e7eb; border: 1px solid #0f172a; border-radius: 10px; padding: 14px 16px; overflow: auto; }
        .markdown pre code { background: transparent !important; padding: 0; font-size: 0.95rem; line-height: 1.65; color: inherit; }
        .markdown :not(pre) > code { background: rgba(2,6,23,0.06); color: #0f172a; padding: 2px 6px; border-radius: 4px; }
        .markdown code.hljs { padding: 0; }
        .markdown pre code.hljs { display: block; }
        .markdown :is(h1,h2,h3,h4,h5,h6) { scroll-margin-top: 80px; }
        .markdown h2 { margin-top: 32px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
        .markdown h3 { margin-top: 24px; }
        .markdown p { line-height: 1.9; color: #0f172a; }
        .markdown a { color: #1d4ed8; }

        /* Link preview card */
        .markdown .link-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; margin: 16px 0; }
        .markdown .link-card > a { display: grid; grid-template-columns: 1fr 128px; gap: 12px; text-decoration: none; color: inherit; align-items: center; }
        @media (max-width: 640px) { .markdown .link-card > a { grid-template-columns: 1fr; } }
        .markdown .link-card .lc-body { padding: 12px; }
        .markdown .link-card .lc-title { font-weight: 700; margin-bottom: 6px; color: #0f172a; }
        .markdown .link-card .lc-desc { color: #475569; font-size: 0.95rem; line-height: 1.6; max-height: 3.2em; overflow: hidden; }
        .markdown .link-card .lc-site { margin-top: 8px; display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.9rem; }
        .markdown .link-card .lc-favicon { width: 16px; height: 16px; border-radius: 4px; }
        .markdown .link-card .lc-thumb { width: 128px; height: 96px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
        .markdown .link-card .lc-thumb--empty { background: #f8fafc; }
        .markdown .link-card .lc-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      `}</style>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || '');
  if (!slug) return { notFound: true } as const;
  try {
    const post = await getPost(slug);
    return {
      props: {
        html: post.html,
        title: (post.frontmatter as any)?.title || slug,
        slug,
        toc: post.toc || [],
      },
    };
  } catch (e: any) {
    if (e instanceof NotFoundError || e?.status === 404) return { notFound: true } as const;
    throw e;
  }
};

export default PostPage;
