# RecipeManager Backend

RecipeManager のバックエンド（Ruby on Rails 8.1.3 / API mode / MySQL 8.0）。プロジェクト全体については [../README.md](../README.md) を参照。

## スタック

- Ruby 3.4.9（`.ruby-version` で固定 / rbenv 管理）
- Rails 8.1.3 (**API mode** — view レイヤなし、JSON のみ返す)
- MySQL 8.0
- CORS: `rack-cors` で `http://localhost:3000` を許可

## ディレクトリ構成

```
backend/
├── app/
│   ├── controllers/api/      # Api::RecipesController（index/show/create/update/destroy）
│   └── models/recipe.rb      # title 必須・100 字、category inclusion
├── config/
│   ├── routes.rb             # namespace :api { resources :recipes }
│   ├── database.yml          # 接続先（環境変数経由）
│   └── initializers/cors.rb  # CORS 設定
├── db/
│   ├── migrate/              # recipes テーブル
│   ├── schema.rb
│   └── seeds.rb
├── Dockerfile.dev            # 開発用（docker-compose で利用）
└── .env.example              # DB_USERNAME / DB_PASSWORD / DB_HOST
```

## API エンドポイント

ベース URL: `/api`

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET`    | `/api/recipes` | 一覧（クエリ: `keyword` 部分一致 / `category` 完全一致 / `sort=created_desc\|name_asc`） |
| `GET`    | `/api/recipes/:id` | 詳細 |
| `POST`   | `/api/recipes` | 新規作成（`{ "recipe": {...} }` でラップ） |
| `PATCH`  | `/api/recipes/:id` | 更新（部分更新可） |
| `DELETE` | `/api/recipes/:id` | 削除（204 No Content） |

エラーは 422（バリデーション）/ 404（未存在）を JSON で返す。仕様の詳細は [../docs/機能仕様書.md](../docs/機能仕様書.md) を参照。

## セットアップ

```bash
bundle install
cp .env.example .env             # DB_USERNAME / DB_PASSWORD / DB_HOST を設定
bin/rails db:create db:migrate
```

主な環境変数:

| 変数 | 用途 |
| --- | --- |
| `DB_USERNAME` | MySQL ユーザ名 |
| `DB_PASSWORD` | MySQL パスワード |
| `DB_HOST` | MySQL ホスト（ローカル: `127.0.0.1` / docker compose: `db`） |

## 起動

```bash
bin/rails s -p 3001
```

ポートは **3001 固定**（Next.js が 3000 を使うため）。占有時は別ポートに逃げず、占有プロセスを停止して規定ポートで起動し直す（[../CLAUDE.md](../CLAUDE.md) のポート運用ルール）。

### Docker Compose で起動する場合

ルートで:

```bash
docker compose up -d
docker compose exec backend bin/rails db:create db:migrate   # 初回のみ
```

## 主要コマンド

| コマンド | 内容 |
| --- | --- |
| `bin/rails s -p 3001` | API サーバ起動 |
| `bin/rails c` | Rails コンソール |
| `bin/rails db:migrate` | マイグレーション適用 |
| `bin/rails db:rollback` | 直前のマイグレーションを戻す |
| `bin/rails routes \| grep recipes` | ルーティング確認 |

## 動作確認

```bash
curl http://localhost:3001/api/recipes
curl http://localhost:3001/api/recipes/1
curl -X POST http://localhost:3001/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"recipe":{"title":"テスト","category":"和食","ingredients":[{"name":"米","amount":"2","unit":"合"}],"steps":[{"order":1,"description":"研ぐ"}]}}'
```
