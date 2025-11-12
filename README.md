# AgentApp Sandbox Demo

AgentApp Sandbox Demo は、チャットUI上から仮想Linux環境を閲覧・操作できる OSS デモアプリです。FastAPI ベースのバックエンドと React + Vite ベースのフロントエンドから構成され、Docker で起動する noVNC サーバーをポップアップウィンドウとして表示できます。

## 主な機能

- チャット UI によるシンプルな対話体験
- `bash:` プレフィックスで始まる入力を仮想Linux環境で実行し、その結果をチャットに表示
- noVNC を iframe で埋め込み、チャット画面からポップアップで仮想Linux デスクトップを閲覧
- サンドボックスコンテナの CPU / メモリ制限やネットワーク分離設定

## リポジトリ構成

```
.
├── backend/               # FastAPI アプリケーション
│   ├── app/
│   │   ├── docker_manager.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/              # Vite + React フロントエンド
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       └── vite-env.d.ts
├── Dockerfile.sandbox     # 仮想Linux環境用 Dockerfile
├── README.md
└── .gitignore
```

## 動作要件

- Docker 24+（backend から `docker` コマンドを使用できること）
- Node.js 18+
- Python 3.11+

## セットアップ手順

1. リポジトリをクローン

   ```bash
   git clone https://github.com/yourusername/tech-dev.git
   cd tech-dev
   ```

2. 仮想Linux用の Docker イメージをビルド

   ```bash
   docker build -f Dockerfile.sandbox -t agent-sandbox:latest .
   ```

3. Python 依存関係をセットアップしバックエンドを起動

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   > Docker デーモンソケット (`/var/run/docker.sock`) にアクセスできるユーザーで実行してください。FastAPI アプリがサンドボックスコンテナを動的に起動します。

4. 別ターミナルでフロントエンドを起動

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. ブラウザで `http://localhost:5173` を開くと、チャット UI と「仮想環境を表示」ボタンが利用できます。

## 使い方

1. チャット入力欄に `bash: ls` のように入力すると、コンテナ内でコマンドが実行され結果がチャットに表示されます。
2. 「仮想環境を表示」ボタンを押すとモーダルが開き、noVNC 経由で仮想 Linux デスクトップを操作できます。
3. コマンド実行は `docker_manager.py` で CPU・メモリ制限、ネットワーク分離を行っているため、既存チャットフローを壊さず安全に利用できます。

## 環境変数

バックエンドは以下の環境変数で挙動を調整できます（デフォルト値あり）。

| 変数名 | 説明 | 既定値 |
| --- | --- | --- |
| `SANDBOX_IMAGE` | 起動する Docker イメージ名 | `agent-sandbox:latest` |
| `SANDBOX_PASSWORD` | noVNC 接続パスワード | `secret` |
| `SANDBOX_PORT` | noVNC を公開するホスト側ポート | `6080` |
| `SANDBOX_TTL` | サンドボックスコンテナの寿命 (分) | `30` |
| `SANDBOX_CPUS` | 割り当て CPU 数 (docker run `--cpus`) | `1` |
| `SANDBOX_MEMORY` | 割り当てメモリ (docker run `--memory`) | `512m` |

## ライセンス

MIT License

---

従来の技術記事プラットフォーム構想に加えて、仮想環境を安全に試せるチャット体験を提供するデモとして活用してください。
