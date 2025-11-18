---
title: "GitHubにpushするだけで公開されるブログのつくりかた"
description: "ブランチへpushされたMarkdownを自動で取得し、サイトに配信するまでの構成とワークフローをまとめました。"
publishedAt: "2025-02-11"
topics:
  - GitHub
  - Deployment
emoji: "🚀"
author: "Tech Dev Team"
heroImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
official: true
---

GitHubをCMSとして扱うと、エンジニアは慣れたワークフローのままコンテンツを届けられます。この記事では `main` ブランチへ push されたMarkdownをアプリがどのように取り込むのか、そしてデプロイを自動化するための最小構成を整理します。

```ts
const pullLatestMarkdown = async () => {
  const response = await fetch("https://api.github.com/repos/your-org/blog/git/trees/main?recursive=1");
  return response.json();
};
```

```link-card
url: https://docs.github.com/ja/actions
title: GitHub Actions ドキュメント
description: CI/CDの設計に迷ったらここをチェック。
site: GitHub Docs
image: https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png
```

## 運用の流れ

1. 記事を書く
2. `git push` する
3. サーバーがGitHub APIから最新ファイルを取得
4. 読者は常に新鮮な記事を読める

このシンプルな仕組みを守ることで、リリース作業に余計な手間がかからなくなります。
