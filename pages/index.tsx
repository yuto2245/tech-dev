import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';

type PostListItem = {
  slug: string;
  name: string;
  path: string;
};

type Props = {
  posts: PostListItem[];
  error?: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const owner = process.env.GITHUB_OWNER || 'yuto2245';
  const repo = process.env.GITHUB_REPO || 'zenn-docs';
  const dirPath = process.env.GITHUB_CONTENT_DIR || 'articles';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['X-GitHub-Api-Version'] = '2022-11-28';
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return { props: { posts: [], error: `GitHub API error: ${res.status}` } };
    }
    const data: Array<{
      name: string;
      path: string;
      type: string;
    }> = await res.json();

    const posts: PostListItem[] = (data || [])
      .filter((item) => item.type === 'file' && /\.mdx?$/.test(item.name))
      .map((item) => ({
        slug: item.name.replace(/\.(md|mdx)$/i, ''),
        name: item.name,
        path: item.path,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug));

    return { props: { posts } };
  } catch (e: any) {
    return { props: { posts: [], error: e?.message ?? 'Unknown error' } };
  }
};

const HomePage: NextPage<Props> = ({ posts, error }) => {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 16 }}>Articles</h1>
      {error && (
        <p style={{ color: 'crimson' }}>
          Failed to load list: {error}
        </p>
      )}
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map((p) => (
            <li key={p.slug} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <Link href={`/posts/${encodeURIComponent(p.slug)}`}>
                {p.slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default HomePage;
