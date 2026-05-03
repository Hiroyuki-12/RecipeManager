---
name: server-port-policy
description: RecipeManager プロジェクトでサーバー（Next.js / Rails API / MySQL）を起動するときに必ず適用するポート運用ポリシー。ポート競合時に別ポートへ逃げず、占有プロセスを停止して規定ポートで起動し直すことを強制する。`npm run dev` / `bin/rails s` / `docker compose up` 等のサーバー起動コマンドを実行する直前に必ず参照する。
---

# Server Port Policy (RecipeManager)

## 目的

このリポジトリではフロント / バックエンド / DB のポートが固定されており、Next.js から Rails API (`http://localhost:3001/api`) を叩く前提や README の手順がそれに依存している。
別ポートで一時起動してしまうと、フロントから API が叩けず「動作確認したつもり」状態になってしまうため、**必ず規定ポートで起動する**。

なお、Next.js と Rails はどちらもデフォルトポートが `3000` で衝突するため、Rails 側を `3001` にずらして運用している。

## 規定ポート（変更禁止）

| サービス | ポート | 起動コマンド |
| --- | --- | --- |
| フロントエンド (Next.js dev server) | `3000` | `cd frontend && npm run dev` |
| バックエンド (Rails API) | `3001` | `cd backend && bin/rails s -p 3001` |
| MySQL | `3306` | `docker compose up -d` |

## 起動前チェック手順

サーバー起動コマンドを実行する **前に** 必ず以下を行う:

1. 該当ポートを占有しているプロセスを確認

   ```bash
   lsof -i :3000 -i :3001 -i :3306 -P -n
   docker ps --format '{{.Names}} {{.Ports}}'
   ```

2. 占有プロセスがある場合の対処（**プロセスを止める**。別ポートには逃げない）

   - 一般プロセス: `kill <PID>`（応答しなければ `kill -9 <PID>`）
   - Rails (Puma): `kill <PID>` または `bin/rails restart`
   - Docker コンテナ: `docker stop <container_name>`（例: `docker stop recipemanager-db`）
   - Next.js dev server: バックグラウンドタスクなら `TaskStop`、そうでなければ該当 PID を kill

3. 規定ポートで起動

4. 起動完了確認:
   - backend: `until curl -sf http://localhost:3001/api/recipes >/dev/null; do sleep 2; done`
   - frontend: `until curl -sf http://localhost:3000/ >/dev/null; do sleep 1; done`

## 禁止事項

以下は **ユーザーが明示的に指示しない限り絶対に行わない**:

- `npm run dev -- -p 3002` のように別ポートで起動する
- `bin/rails s -p 3002` のように別ポートで起動する
- `config/puma.rb` や `.env` の `PORT` を一時的に書き換える
- `compose.yaml` のポートマッピングを書き換える
- ポート競合エラーをそのままにして「動作確認できなかった」と報告する
- 既存プロセスを残したまま「すでに動いているようなのでスキップ」する（古いビルドが動いている可能性があるため）

## 例外

ユーザーが明示的に「別ポートで起動して」と指示した場合のみ、その指示に従う。
その場合も Next.js から Rails API への接続先・README 等への影響をユーザーに必ず告知する。

## 参照

このルールは [CLAUDE.md](../../../CLAUDE.md) の「ポート運用ルール」と同期している。片方を更新したら必ずもう片方も更新する。
