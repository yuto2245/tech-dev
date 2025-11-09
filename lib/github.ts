export interface GithubRepositoryReference {
  owner: string;
  name: string;
  branch?: string;
  path?: string;
}

export function buildGithubUrl(reference: GithubRepositoryReference) {
  const branch = reference.branch ?? "main";
  const path = reference.path ? `/${reference.path}` : "";
  return `https://github.com/${reference.owner}/${reference.name}/tree/${branch}${path}`;
}

export async function fetchRepositoryMarkdown(reference: GithubRepositoryReference) {
  const branch = reference.branch ?? "main";
  const path = reference.path ?? "README.md";
  const rawUrl = `https://raw.githubusercontent.com/${reference.owner}/${reference.name}/${branch}/${path}`;

  const response = await fetch(rawUrl, {
    headers: {
      Accept: "text/plain"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHubリポジトリからコンテンツを取得できませんでした: ${response.status}`);
  }

  return await response.text();
}
