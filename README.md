# AgentApp Sandbox Demo

AgentApp Sandbox Demo は、チャットUI上から仮想Linux環境を閲覧・操作できる OSS デモアプリです。FastAPI ベースのバックエンドと React + Vite ベースのフロントエンドから構成され、Docker もしくはホスト上の Xvfb + x11vnc + noVNC を用いて仮想デスクトップをポップアップ表示できます。

## 主な機能

- チャット UI によるシンプルな対話体験
- `bash:` プレフィックスで始まる入力を仮想Linux環境で実行し、その結果をチャットに表示
- noVNC を iframe で埋め込み、チャット画面からポップアップで仮想Linux デスクトップを閲覧
- サンドボックスコンテナ（またはネイティブ環境）の CPU / メモリ制限やネットワーク分離設定

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

- Node.js 18+
- Python 3.11+
- サンドボックス実行環境のいずれか
  - Docker 24+（backend から `docker` コマンドを利用可能であること）
  - もしくは Docker が使えない環境では、`xfce4`・`x11vnc`・`xvfb`・`websockify`・`novnc`・`firefox` 等がホストにインストールされていること

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/tech-dev.git
cd tech-dev
```

### 2. サンドボックス環境を準備

まず、リポジトリのルートで `scripts/check_sandbox_env.py` を実行し、必要なコマンドが揃っているかを確認することを推奨します。

```bash
./scripts/check_sandbox_env.py --details
# Docker を使わずネイティブ実行を想定している場合
./scripts/check_sandbox_env.py --native --details
```

#### Docker を利用する場合（推奨）

1. `docker` デーモンを起動します。CI やコンテナ内で権限が制限されている場合は、以下のように `vfs` ストレージドライバとホストネットワークを組み合わせると iptables や overlayfs の制限を回避できます。

   ```bash
   dockerd --storage-driver=vfs --iptables=false --userland-proxy=false --host=unix:///var/run/docker.sock --bridge=none &
   export SANDBOX_NETWORK_MODE=host
   ```

2. 仮想Linux用の Docker イメージをビルドします。

   ```bash
   docker build -f Dockerfile.sandbox -t agent-sandbox:latest .
   ```

   `SANDBOX_DOCKER_ARGS` に追加の `docker run` フラグ（例: `--gpus all`）を指定することもできます。

#### Docker が使えない場合（ネイティブサンドボックス）

1. 必要なパッケージをホストにインストールします。

   ```bash
   sudo apt-get update
   sudo apt-get install -y xfce4 xfce4-goodies x11vnc xvfb xdotool websockify novnc firefox
   ```

2. バックエンドからネイティブランタイムを利用できるように、環境変数でランタイムを切り替えます。

   ```bash
   export SANDBOX_RUNTIME=native
   # 必要に応じてポートや画面サイズを調整
   export SANDBOX_PORT=6080
   export SANDBOX_NATIVE_WIDTH=1366
   export SANDBOX_NATIVE_HEIGHT=768
   ```

### 3. Python 依存関係をセットアップしバックエンドを起動

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
SANDBOX_PASSWORD=secret uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Docker 実行時は `SANDBOX_IMAGE` や `SANDBOX_NETWORK_MODE` を環境変数で上書きできます。
- ネイティブランタイムの場合も同じコマンドで起動できます（`SANDBOX_RUNTIME=native` を指定したまま）。

### 4. フロントエンドを起動

```bash
cd ../frontend
npm install
npm run dev
```

### 5. ブラウザでアクセス

`http://localhost:5173` を開くと、チャット UI と「仮想環境を表示」ボタンが利用できます。ボタンを押すとモーダルが開き、noVNC 経由で仮想 Linux デスクトップを操作できます。

## 使い方

1. チャット入力欄に `bash: ls` のように入力すると、サンドボックス内でコマンドが実行され結果がチャットに表示されます。
2. 「仮想環境を表示」ボタンを押すとモーダルが開き、noVNC 経由で仮想 Linux デスクトップを閲覧できます。
3. `SANDBOX_TTL` で指定した時間が過ぎるとサンドボックスは自動的に再生成されます。

## 環境変数

バックエンドは以下の環境変数で挙動を調整できます（デフォルト値あり）。

| 変数名 | 説明 | 既定値 |
| --- | --- | --- |
| `SANDBOX_RUNTIME` | `docker` または `native` を選択 | `docker` |
| `SANDBOX_IMAGE` | 起動する Docker イメージ名（Docker runtimeのみ） | `agent-sandbox:latest` |
| `SANDBOX_PASSWORD` | noVNC 接続パスワード | `secret` |
| `SANDBOX_PORT` | noVNC を公開するホスト側ポート | `6080` |
| `SANDBOX_TTL` | サンドボックスの寿命 (分) | `30` |
| `SANDBOX_CPUS` | Docker runtime の `--cpus` 値 | `1` |
| `SANDBOX_MEMORY` | Docker runtime の `--memory` 値 | `512m` |
| `SANDBOX_NETWORK_MODE` | Docker runtime のネットワークモード（`host` にするとポート公開不要） | `none` |
| `SANDBOX_DOCKER_ARGS` | Docker runtime に追加で渡すオプション（空白区切り） | `""` |
| `SANDBOX_NATIVE_DISPLAY` | ネイティブ runtime で利用する DISPLAY | `:99` |
| `SANDBOX_NATIVE_WIDTH` | ネイティブ runtime の仮想スクリーン幅 | `1280` |
| `SANDBOX_NATIVE_HEIGHT` | ネイティブ runtime の仮想スクリーン高さ | `800` |
| `SANDBOX_NATIVE_VNC_PORT` | ネイティブ runtime で x11vnc が待受けるポート | `5901` |

## トラブルシューティング

- Docker のポート公開が失敗する場合は `SANDBOX_NETWORK_MODE=host` を指定すると iptables 設定不要で動作します。
- ネイティブランタイムで画面が表示されない場合は `backend/app/docker_manager.py` が生成する `*.log` ファイル（`/tmp` 配下）を確認してください。
- `bash:` コマンドの出力が `[error]` で始まる場合は、サンドボックス内でコマンド実行が失敗しています。該当コマンドを直接 bash で実行し原因を調査してください。

## スクリーンショット取得ガイド

README に従ってアプリケーションを起動したあとで成果物としてスクリーンショットを取得する場合は、`docs/SCREENSHOT_CHECKLIST.md` を参照してください。noVNC ログイン画面から vim で作成したテキストファイルの保存まで、5 枚の画像で状態を証明する手順をまとめています。

## ライセンス

MIT License

---

従来の技術記事プラットフォーム構想に加えて、仮想環境を安全に試せるチャット体験を提供するデモとして活用してください。
