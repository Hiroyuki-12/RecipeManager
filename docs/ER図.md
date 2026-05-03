# レシピ管理アプリ ER図

## ER図(Mermaid)

```mermaid
erDiagram
    RECIPES {
        BIGINT id PK "主キー(自動採番)"
        VARCHAR title "レシピ名(必須、最大100文字)"
        VARCHAR category "カテゴリ(和食/洋食/中華/その他)"
        JSON ingredients "材料(JSON配列)"
        JSON steps "手順(JSON配列)"
        INT servings "何人分"
        INT cooking_time "調理時間(分)"
        TEXT memo "メモ"
        DATETIME created_at "作成日時"
        DATETIME updated_at "更新日時"
    }
```

## 補足

本アプリは個人利用前提の最小構成のため、テーブルは `recipes` 1 つのみ。
材料(ingredients)・手順(steps)は別テーブルではなく、JSON カラムとして格納する。

### JSON 構造

#### ingredients
「材料名 / 数量 / 単位」の 3 要素を持つオブジェクトの配列。
`amount` は文字列(数値文字列を想定)、`unit` は単位文字列。
「少々」「適量」のように数量を伴わない場合は `amount` を空文字列とする。

```json
[
  { "name": "玉ねぎ", "amount": "1",   "unit": "個" },
  { "name": "豚肉",   "amount": "200", "unit": "g" },
  { "name": "塩",     "amount": "",    "unit": "少々" }
]
```

#### steps
```json
[
  { "order": 1, "description": "玉ねぎを切る" },
  { "order": 2, "description": "炒める" }
]
```
