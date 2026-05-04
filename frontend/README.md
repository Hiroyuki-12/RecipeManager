# RecipeManager Frontend

RecipeManager のフロントエンド（Next.js 16 / Pages Router / TypeScript）。プロジェクト全体については [../README.md](../README.md) を参照。

## スタック

- Next.js 16 (**Pages Router** — App Router ではない)
- React 19 / TypeScript 5
- ESLint (`eslint-config-next`)
- Volta によるツールチェイン固定（Node 22 / npm 11）

## ディレクトリ構成

```
frontend/
├── components/   # Header / Layout / Breadcrumb / RecipeForm
├── lib/          # api.ts (API クライアント) / constants.ts (カテゴリ・単位 enum 等)
├── pages/        # _app.tsx / _document.tsx / index.tsx / recipes/
├── styles/       # globals.css / Home.module.css
└── public/       # 静的アセット
```

## 主要ファイル

| ファイル | 役割 |
| --- | --- |
| [`lib/api.ts`](lib/api.ts) | API 呼び出しの中央集約。`api.list / get / create / update / destroy` を提供。`NEXT_PUBLIC_API_BASE` を読む。更新は `PATCH` |
| [`lib/constants.ts`](lib/constants.ts) | カテゴリ enum (`和食/洋食/中華/その他`)、単位候補、調理時間候補、何人分候補、半角化ヘルパ |
| [`components/RecipeForm.tsx`](components/RecipeForm.tsx) | 登録/編集の共通フォーム。バリデーション・動的行追加（Enter / 自動空行）・エラー赤枠・`scrollIntoView` を実装 |
| [`components/Header.tsx`](components/Header.tsx) | ヘッダー。右側に「+ 新規登録」ボタンを常設（`/recipes/new` 表示時は非表示） |
| [`components/Breadcrumb.tsx`](components/Breadcrumb.tsx) | 戻る導線。詳細→一覧 / 編集→詳細を文脈に応じて切り替え |
| [`pages/index.tsx`](pages/index.tsx) | `/` から `/recipes` へリダイレクト |
| [`pages/recipes/index.tsx`](pages/recipes/index.tsx) | 一覧（CSS Grid / 検索 300ms デバウンス / カテゴリ絞り込み / 並び順） |

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_BASE を確認
```

主な環境変数:

| 変数 | 既定値 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:3001/api` | Rails API のベース URL |

## 起動

```bash
npm run dev      # http://localhost:3000
```

ポートは **3000 固定**。占有時は別ポートに逃げず、占有プロセスを停止して規定ポートで起動し直す（[../CLAUDE.md](../CLAUDE.md) のポート運用ルール）。

バックエンド (Rails API) を `http://localhost:3001` で起動しておく必要がある。手順は [../backend/README.md](../backend/README.md) を参照。

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバ起動（ホットリロード） |
| `npm run build` | プロダクションビルド |
| `npm run start` | ビルド成果物の起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## エージェント向けドキュメント

- [AGENTS.md](AGENTS.md) — Next.js 16 はバージョンアップで破壊的変更があるため、コードを書く前に `node_modules/next/dist/docs/` 配下のガイドを参照する旨の注意
- [CLAUDE.md](CLAUDE.md) — `AGENTS.md` への薄いリダイレクト
