# TechDev Platform

TechDevは、GitHubでコンテンツを管理するエンジニア向けに設計されたAIファクトチェック付きのパブリッシング・プラットフォームです。ZennのGitHub連携、Grokipediaの整合性検証、Dev.toのコミュニティ性を統合し、記事の信頼性を透明に提示します。

## コンセプト
- **GitHub資産の尊重**: 記事は常にユーザーのGitHubリポジトリに保存され、TechDevは最適なビューとAI検証を提供します。
- **AIによる整合性チェック**: GPT-4o-miniを利用したファクトチェック/ロジック検証/カバレッジ評価をJSON形式で保存し、読者に公開します。
- **透明な信頼性スコア**: 信頼性ダッシュボードと記事ページにAIスコアと改善提案を表示し、改善サイクルを明確化します。
- **低コスト・高速開発**: Next.js + Vercel + Supabaseの構成で、非同期キューによりコストとレイテンシを最適化します。

## リポジトリ構成
```
app/                 # Next.js App Router ベースのUIとAPI
components/          # UIコンポーネント群 (Hero, Trust Meter, AIレポートなど)
lib/                 # AIチェックやGitHub連携、Supabaseクライアントのユーティリティ
supabase/migrations/ # PostgreSQLテーブル定義
types/               # 記事・AIレポートに関する型定義
```

## 主な機能
- ホームページ: プラットフォームの価値提案、ワークフロー図、MVPチェックリストを掲載
- 記事一覧/詳細: AIスコアと改善提案を含む記事の閲覧
- AIチェックAPI: `/api/ai/check` に記事を送信すると信頼性スコアを返却
- 信頼性ダッシュボード: Fact/Logic/Coverageの平均値と履歴テーブルを表示
- GitHub同期のプレイブック: ドキュメントとスタートガイドでセットアップを解説

## 開発環境のセットアップ
```bash
npm install
npm run dev
```

`.env.local` に以下の環境変数を設定してください。
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
```

> `OPENAI_API_KEY` が未設定の場合、AIチェックAPIはスタブデータを返します。

## Supabase スキーマ
`supabase/migrations/0001_initial_schema.sql` に、users / articles / article_versions / ai_reports / human_input_scores / interactions / audit_logs のテーブル構成を定義しています。`supabase db push` でデータベースに適用できます。

## ロードマップ
1. **Phase 0 (MVP)**: 認証、投稿、AI整合性チェック、信頼性スコア表示
2. **Phase 1**: コメント・いいね、GitHub同期、ダッシュボード拡張
3. **Phase 2**: AI生成疑惑スコア、通知、コラボレーション機能

## ライセンス
このプロジェクトはMITライセンスで提供予定です。
