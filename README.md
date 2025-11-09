# 概要
tech-devは、技術者のためのブログプラットフォームです。GitHubで記事を管理しながら、AIによる情報の鮮度と正確性チェックを備えた、信頼性の高い技術知識共有を実現します。
# コンセプト
GitHub資産としての記事管理: ユーザーは自分の技術記事をGitHubリポジトリとして所有・管理できます
AIによる情報品質保証: プラットフォーム上のAIが記事内容を監視し、古い情報や誤った技術情報を自動検出します
最適化された閲覧体験: 各記事はプラットフォーム上で最適な表示形式で共有されます
着想源: ZennのGitHub連携とGrokipediaのAIによるファクトチェック機能を融合させました
# 主な機能
## ユーザー向け機能
GitHub連携投稿: GitHubリポジトリと連携した記事管理
マークダウン編集: 技術記事に最適化されたエディタ
AIによる信頼性チェック:
事実整合性の検証
論理的一貫性の確認
古い情報の検出と警告
信頼性ダッシュボード: 記事の信頼性スコアを可視化
## コミュニティ機能: コメント、いいね、フォロー機能
技術的特徴
Next.js + Vercelによるフロントエンド
SupabaseによるバックエンドとDB管理
OpenAI APIを活用した情報検証
GitHub OAuth連携
# MVPロードマップ
## フェーズ1 (現在)
基本的な記事投稿・閲覧機能
GitHub連携
AIによる基本的な情報チェック
## フェーズ2 (予定)
高度な信頼性ダッシュボード
コミュニティ機能の強化
AIチェック機能の拡張
# デモ・使い方
GitHubアカウントでサインアップ
リポジトリを連携または記事を直接作成
マークダウンで記事を書く
投稿時にAIが自動的に内容を検証
信頼性スコアと共に記事が公開される
インストール方法 (開発者向け)
```bash
# リポジトリのクローン
git clone https://github.com/yourusername/tech-dev.git
cd tech-dev

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

# 環境設定
.env.localファイルを作成し、以下の環境変数を設定:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
```
# コントリビューション
コントリビューションは大歓迎です！以下の手順で参加できます:
このリポジトリをフォーク
新しいブランチを作成 (git checkout -b feature/amazing-feature)
変更をコミット (git commit -m 'Add amazing feature')
ブランチにプッシュ (git push origin feature/amazing-feature)
プルリクエストを作成
