import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Recipe } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

type Sort = "created_desc" | "name_asc";

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default function RecipeListPage() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<Sort>("created_desc");
  type State =
    | { status: "loading" }
    | { status: "success"; recipes: Recipe[] }
    | { status: "error"; message: string };
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    let cancelled = false;
    api
      .list({ keyword: debouncedKeyword || undefined, category: category || undefined, sort })
      .then((list) => {
        if (!cancelled) setState({ status: "success", recipes: list });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof ApiError ? `読み込みに失敗しました (${e.status})` : "読み込みに失敗しました";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword, category, sort]);

  const filtered = !debouncedKeyword && !category;
  const emptyMessage = filtered ? "レシピがありません" : "該当するレシピがありません";

  return (
    <>
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 レシピ名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="toolbar">
        <span className="label-inline">カテゴリ:</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">全て</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="label-inline">並び順:</span>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="created_desc">新しい順</option>
          <option value="name_asc">名前順</option>
        </select>
      </div>

      <hr className="divider" />

      {state.status === "loading" ? (
        <div className="empty">読み込み中...</div>
      ) : state.status === "error" ? (
        <div className="empty">{state.message}</div>
      ) : state.recipes.length === 0 ? (
        <div className="empty">{emptyMessage}</div>
      ) : (
        <div className="recipe-list">
          {state.recipes.map((r) => {
            const ingCount = r.ingredients?.length ?? 0;
            return (
              <Link key={r.id} href={`/recipes/${r.id}`} className="recipe-card">
                <span className="category-tag">{r.category || "未分類"}</span>
                <div className="title">{r.title}</div>
                <div className="meta">
                  <span className="meta-item">🍴 {r.servings ? `${r.servings}人分` : "-"}</span>
                  <span className="meta-item">⏱ {r.cooking_time ? `${r.cooking_time}分` : "-"}</span>
                  <span className="meta-item">🥕 {ingCount}品</span>
                </div>
                <div className="updated-at">更新: {formatUpdatedAt(r.updated_at)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
