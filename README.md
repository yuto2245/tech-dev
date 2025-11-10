# TechDev Platform

TechDevは、GitHubでコンテンツを管理するエンジニア向けに設計されたAIファクトチェック付きのパブリッシング・プラットフォームです。ZennのGitHub連携、Grokipediaの整合性検証、Dev.toのコミュニティ性を統合し、記事の信頼性を透明に提示します。

## コンセプト
- **GitHub資産の尊重**: 記事は常にユーザーのGitHubリポジトリに保存され、TechDevは最適なビューとAI検証を提供します。
- **AIによる整合性チェック**: GPT-4o-miniを利用したファクトチェック/ロジック検証/カバレッジ評価をJSON形式で保存し、読者に公開します。
- **透明な信頼性スコア**: 信頼性ダッシュボードと記事ページにAIスコアと改善提案を表示し、改善サイクルを明確化します。
- **低コスト・高速開発**: Next.js + Vercel + Supabaseの構成で、非同期キューによりコストとレイテンシを最適化します。

## 必要環境
- Node.js 18以降 (Next.js 14の最小要件)
- npm 9以降
- Supabase CLI 1.180以降 (ローカル開発でDBを管理する場合)
- GitHubアカウント (OAuth連携と記事リポジトリのホスティング)

## セットアップの流れ
1. **リポジトリを取得**
   ```bash
   git clone https://github.com/your-org/tech-dev
   cd tech-dev
   ```
2. **依存パッケージをインストール**
   ```bash
   npm install
   ```
3. **Supabase プロジェクトの作成**
   - Supabaseダッシュボードで新規プロジェクトを作成し、`Project URL` と `anon key`、`service role key` を控えます。
   - ローカル環境でSupabase CLIを利用する場合は `supabase login` 後に `supabase db start` を実行し、`.supabase` ディレクトリから自動生成されるURL/キーを参照してください。
4. **データベーススキーマを適用**
   ```bash
   supabase db push
   ```
   - `supabase/migrations/0001_initial_schema.sql` に定義された `users`, `articles`, `article_versions`, `ai_reports`, `human_input_scores`, `interactions`, `audit_logs` テーブルが作成されます。
5. **環境変数を設定**
   - `.env.local` を作成し、以下の値を埋めます。
     ```env
     NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
     SUPABASE_SERVICE_KEY=<Supabase service role key>
     GITHUB_CLIENT_ID=<GitHub OAuth App Client ID>
     GITHUB_CLIENT_SECRET=<GitHub OAuth App Client Secret>
     OPENAI_API_KEY=<OpenAI API key>
     ```
   - `OPENAI_API_KEY` を設定すると `/api/ai/check` から実際のAI整合性チェックが実行されます。未設定の場合はスタブレスポンスが返ります。

## Next.js と Supabase の連携
- フロントエンド (ブラウザ) からの読み取りは `lib/supabase/client.ts` の `getSupabaseBrowserClient` を通じて行い、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が必須です。セッションは自動更新され、OAuthリダイレクトもサポートします。
- サーバーコンポーネントやRoute Handlerからの操作は `lib/supabase/server.ts` の `getSupabaseServerClient` を利用します。`SUPABASE_SERVICE_KEY` を使うことでバックエンド専用の権限でデータを操作できます。
- Supabaseのスキーマは `articles` テーブルを記事のメタ情報、`article_versions` をMarkdown本文、`ai_reports` をAIスコア保存用として分割しており、`articles.current_version_id` と `article_versions.ai_report_id` で最新状態を追跡します。

## アプリケーションの起動
```bash
npm run dev
```
- デフォルトで `http://localhost:3000` が開きます。
- `app/articles` ページでAIチェック済みの記事リスト、`/articles/[slug]` で詳細を確認できます。
- APIの動作確認は以下のように行えます。
  ```bash
  curl -X POST http://localhost:3000/api/ai/check \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Next.jsとSupabaseのセットアップ",
      "markdown": "# 手順\nSupabase CLIでDBを起動し、Next.jsから接続します。"
    }'
  ```
  - OpenAIキーが設定されていれば、`fact_consistency`, `logical_flow`, `coverage` などのスコアと推奨事項が返ります。

## 記事投稿ワークフロー
1. **GitHubリポジトリでMarkdownを管理**
   - `main` ブランチに `/articles/<slug>.md` のような構成で記事を保存します。
   - 執筆完了後にPull Request → Review → Mergeのフローを想定しています。
2. **Supabaseに記事メタ情報を登録**
   - Supabase SQLエディタまたはCLIで以下のように挿入します。
     ```sql
     insert into articles (author_id, title, slug, status)
     values ('<user-uuid>', 'Next.jsとSupabase連携ガイド', 'nextjs-supabase-guide', 'pending')
     returning id;
     ```
   - `author_id` には `users` テーブルのUUIDを指定します。GitHub OAuthでサインインすると`users`に自動で行が作成されるように実装してください。
3. **本文とAIレポートの保存**
   - マージされたMarkdownをCIなどから取得し、`article_versions` に保存します。
     ```sql
     insert into article_versions (article_id, content_md, content_html)
     values ('<article-uuid>', '<Markdown本文>', '<HTMLに変換した本文>')
     returning id;
     ```
   - Next.jsのAPI `/api/ai/check` に本文を送信し、返却されたスコアを `ai_reports` に登録します。
     ```sql
     insert into ai_reports (
       article_version_id,
       ai_provider,
       result_json,
       score_fact,
       score_logic,
       score_coverage
     ) values (
       '<article-version-uuid>',
       'openai-gpt-4o-mini',
       '<APIレスポンスJSON>',
       0.92,
       0.88,
       0.86
     ) returning id;
     ```
   - `article_versions.ai_report_id` を更新し、`articles.current_version_id` と `articles.trust_score` を最新スコアで更新します。
     ```sql
     update article_versions
       set ai_report_id = '<ai-report-uuid>'
     where id = '<article-version-uuid>';

     update articles
       set current_version_id = '<article-version-uuid>',
           trust_score = 0.89,
           status = 'published',
           updated_at = now()
     where id = '<article-uuid>';
     ```
4. **公開と監視**
   - `/articles/<slug>` ページでAIレポート・タグ・信頼性スコアが自動的に表示されます。
   - 追加の人手レビューやフィードバックは `human_input_scores` や `interactions` テーブルに保存できます (将来拡張予定)。

## ディレクトリ構成
```text
app/                 # Next.js App Router ベースのUIとAPI
components/          # UIコンポーネント群 (Hero, Trust Meter, AIレポートなど)
lib/                 # AIチェックやGitHub連携、Supabaseクライアントのユーティリティ
supabase/migrations/ # PostgreSQLテーブル定義
types/               # 記事・AIレポートに関する型定義
```

## ロードマップ
1. **Phase 0 (MVP)**: 認証、投稿、AI整合性チェック、信頼性スコア表示
2. **Phase 1**: コメント・いいね、GitHub同期、ダッシュボード拡張
3. **Phase 2**: AI生成疑惑スコア、通知、コラボレーション機能

## ライセンス
このプロジェクトはMITライセンスで提供予定です。
