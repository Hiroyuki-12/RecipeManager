# RecipeManager

家庭向けのシンプルなレシピ管理アプリ。レシピの登録・閲覧・検索・編集・削除ができる（認証なし・単一テーブル）。

## 技術スタック

| レイヤ | 採用技術 |
| --- | --- |
| フロントエンド | Next.js 16 (Pages Router) + TypeScript |
| バックエンド | Ruby on Rails 8.1 (API mode) |
| データベース | MySQL 8.0 |

詳細は [docs/技術スタック.md](docs/技術スタック.md) を参照。

## ディレクトリ構成

```
RecipeManager/
├── frontend/          # Next.js (Pages Router)
├── backend/           # Rails API
├── docs/              # 要件定義 / 機能仕様 / 画面設計 / ER 図 等
├── prototype/         # 静的 HTML/CSS/JS の UI モック
└── docker-compose.yml # MySQL + backend を起動するコンポーズ
```

## ポート規定

別ポートでの代替起動は禁止（[CLAUDE.md](CLAUDE.md) 参照）。競合時は占有プロセスを停止して規定ポートで起動し直すこと。

| サービス | ポート |
| --- | --- |
| フロントエンド (Next.js) | `3000` |
| バックエンド (Rails API) | `3001` |
| MySQL | `3306` |

## セットアップ

### 1. 前提

- Node.js 22 系 / npm 11 系（`frontend/package.json` の `volta` に固定）
- Ruby 3.4.9（`backend/.ruby-version`）
- MySQL 8.0（ローカルまたは Docker）

### 2. 環境変数

各 `.env.example` をコピーして使う。

```bash
cp .env.example .env                       # ルート（docker compose 用）
cp backend/.env.example backend/.env       # Rails ローカル起動用
cp frontend/.env.local.example frontend/.env.local
```

主な変数:

| ファイル | キー | 説明 |
| --- | --- | --- |
| `backend/.env` | `DB_USERNAME` / `DB_PASSWORD` | MySQL 接続情報 |
| `backend/.env` | `DB_HOST` | ローカル MySQL は `127.0.0.1`、Docker Compose 経由は `db` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE` | API のベース URL（既定: `http://localhost:3001/api`） |

### 3. 依存関係

```bash
cd backend && bundle install && cd ..
cd frontend && npm install && cd ..
```

## 起動手順

以下の順で 3 サービスを起動する。

### A. ローカル起動

1. **MySQL** を 3306 で起動

2. **バックエンド**（Rails API）

   ```bash
   cd backend
   bin/rails db:create db:migrate    # 初回のみ
   bin/rails s -p 3001
   ```

3. **フロントエンド**（Next.js）

   ```bash
   cd frontend
   npm run dev                       # http://localhost:3000
   ```

4. ブラウザで http://localhost:3000 を開く（`/recipes` へリダイレクト）。

### B. Docker Compose（MySQL + backend）

```bash
docker compose up -d
docker compose exec backend bin/rails db:create db:migrate   # 初回のみ
```

フロントエンドは別タブで `cd frontend && npm run dev` を起動する。

## 動作確認シナリオ

ブラウザで 5 機能（CRUD + 検索）を以下の順で一巡する:

1. **登録**: ヘッダー右の「+ 新規登録」→ タイトル / カテゴリ / 材料 / 手順 / 人数 / 調理時間 / メモを入力 → 登録
2. **一覧**: `/recipes` でカードグリッド表示を確認
3. **検索 / 絞り込み / 並べ替え**: キーワード（300ms デバウンス）/ カテゴリ / 並び順
4. **詳細**: カード → 詳細画面で材料・作り方を確認
5. **編集**: 「編集」ボタン → 値を変更して更新
6. **削除**: 詳細から削除 → 確認モーダルで「削除する」→ 一覧へ戻る

API 単体は `curl` でも確認できる:

```bash
curl http://localhost:3001/api/recipes
curl http://localhost:3001/api/recipes/1
```

## よく使うコマンド

| コマンド | 用途 |
| --- | --- |
| `cd frontend && npm run dev` | フロント開発サーバ |
| `cd frontend && npm run lint` | ESLint |
| `cd frontend && npm run typecheck` | 型チェック |
| `cd frontend && npm run build` | プロダクションビルド |
| `cd backend && bin/rails s -p 3001` | Rails API |
| `cd backend && bin/rails db:migrate` | マイグレーション |
| `cd backend && bin/rails c` | Rails コンソール |

## ドキュメント

- [要件定義書](docs/要件定義書.md)
- [機能仕様書](docs/機能仕様書.md)
- [画面設計書](docs/画面設計書.md) / [画面遷移図](docs/画面遷移図.md)
- [ER 図](docs/ER図.md)
- [開発計画書](docs/開発計画書.md)
- [運用ルール（ブランチ / PR / ポート）](CLAUDE.md)

## スコープ外

認証、画像アップロード、タグ機能は本リポジトリのスコープ外。
