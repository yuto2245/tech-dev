## tech-dev

GitHub の `zenn-docs/articles` 配下の Markdown 記事を取得し、Next.js で表示する最小ブログです。記事一覧と記事詳細（目次・コードハイライト・画像解決・リンクプレビュー）までを SSR で実装しています。

### 特長
- GitHub API（Contents API）から記事を取得（SSR）
- Frontmatter 抽出（`gray-matter`）＋ Markdown → HTML（`remark`）
- GFM 対応（テーブル・タスクリスト等）
- 見出しから自動目次生成（スクロールに合わせてハイライト）
- 相対画像パスを `raw.githubusercontent.com` へ自動変換
- コードブロックのシンタックスハイライト（`rehype-highlight`）
- 単独の URL 行をリンクカード化（OGP 取得、失敗時はフォールバック）

### 動作環境
- Node.js `>= 18.18.0`

### セットアップ
1) 依存関係をインストール
```
npm install
```

2) 環境変数を設定（`.env`）
```
# 既定は yuto2245/zenn-docs/articles を参照（必要に応じて上書き）
GITHUB_OWNER=yuto2245
GITHUB_REPO=zenn-docs
GITHUB_CONTENT_DIR=articles

# レート制限回避やプライベートリポ対応で使用（任意）
# どちらの名前でも可（両方あれば GITHUB_TOKEN を優先）
GITHUB_TOKEN=ghp_xxx
# GITHUB_API=ghp_xxx
```

3) 開発サーバーを起動
```
npm run dev
```

- 一覧: `http://localhost:3000/`
- 記事詳細: `http://localhost:3000/posts/<slug>`
  - 例: `c288ae9268678c`, `d84565ca8ff8b4`

### ディレクトリ構成（抜粋）
```
tech-dev/
├── lib/
│   └── getPost.ts          # GitHub 取得 + Markdown 変換 + TOC + 画像/リンク処理
├── pages/
│   ├── index.tsx           # 記事一覧（GitHub 上の /articles 直下を列挙）
│   └── posts/
│       └── [slug].tsx      # 記事詳細（目次サイドバー＋コードハイライト）
├── next.config.js
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

### 実装の要点
- 取得先: `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}`
- `lib/getPost.ts`
  - `gray-matter` で frontmatter と本文を分離
  - `remark` + `remark-gfm` + `remark-slug` → `remark-rehype`
  - `rehype-raw`（Markdown 中の HTML を有効化）
  - `rehype-highlight`（シンタックスハイライト）
  - `rehype-stringify` で HTML へ変換
  - 画像 URL 書き換え: `![](/images/foo.png)` → `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/images/foo.png`
  - 目次: 見出し（h1〜h6）を AST 走査して `{ id, text, depth }[]` を生成
  - リンクカード: 段落が「URLのみ」の場合に OGP 取得してカード化（最大5件）
- `pages/posts/[slug].tsx`
  - サイドに目次（Sticky）
  - IntersectionObserver でアクティブ見出しをハイライト
  - アンカーはスムーススクロール
  - ハイライトテーマは `github-dark`（CDN 読み込み）

### 環境変数
- `GITHUB_OWNER`（既定: `yuto2245`）
- `GITHUB_REPO`（既定: `zenn-docs`）
- `GITHUB_CONTENT_DIR`（既定: `articles`）
- `GITHUB_TOKEN` または `GITHUB_API`（任意、指定で認証ヘッダ付与）
  - 公開リポでもレート制限回避のため設定推奨

### 注意事項 / 制限
- `rehype-raw` により Markdown 内の HTML をそのまま描画します。信頼できるソースのコンテンツを使用してください（XSS 対応が必要な場合はサニタイズ導入を検討）。
- リンクカードの OGP 取得は先方サイトに依存します。SSR で取得しますが、ブロックされる場合は通常リンク表示にフォールバックします。
- デフォルトブランチは GitHub の `download_url` から推定し、取得できない場合は `master` を使用します。

### スクリプト
- `npm run dev` 開発サーバー起動
- `npm run build` 本番ビルド
- `npm run start` 本番起動

### よくあるエラー
- `GitHub API error: 404`
  - `GITHUB_OWNER/GITHUB_REPO/GITHUB_CONTENT_DIR` が実在しない、または間違っている可能性があります。
- `Rate limit exceeded`
  - `.env` に `GITHUB_TOKEN` を設定してください。

### ライセンス
このリポジトリのコードはあなたのプロジェクト用サンプルです。必要に応じて自由に変更してください。

