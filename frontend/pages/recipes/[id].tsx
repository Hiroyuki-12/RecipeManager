import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api, type Recipe } from "@/lib/api";
import { formatAmount } from "@/lib/constants";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  type State =
    | { status: "loading" }
    | { status: "success"; recipe: Recipe }
    | { status: "notFound" };
  const [state, setState] = useState<State>({ status: "loading" });
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    let cancelled = false;
    api
      .get(id)
      .then((r) => { if (!cancelled) setState({ status: "success", recipe: r }); })
      .catch(() => { if (!cancelled) setState({ status: "notFound" }); });
    return () => { cancelled = true; };
  }, [id]);

  const recipe = state.status === "success" ? state.recipe : null;

  async function handleDelete() {
    if (!recipe) return;
    setDeleting(true);
    try {
      await api.destroy(recipe.id);
      router.push("/recipes");
    } catch {
      setDeleting(false);
      alert("削除に失敗しました");
    }
  }

  if (state.status === "loading") {
    return (
      <>
        <Link href="/recipes" className="back-link">← 一覧へ戻る</Link>
        <div className="empty">読み込み中...</div>
      </>
    );
  }

  if (state.status === "notFound" || !recipe) {
    return (
      <>
        <Link href="/recipes" className="back-link">← 一覧へ戻る</Link>
        <div className="empty">レシピが見つかりません</div>
      </>
    );
  }

  return (
    <>
      <Link href="/recipes" className="back-link">← 一覧へ戻る</Link>

      <div className="detail-header">
        <h2>{recipe.title}</h2>
        <div className="detail-actions">
          <Link href={`/recipes/${recipe.id}/edit`} className="btn">編集</Link>
          <button className="btn btn-danger" onClick={() => setConfirming(true)}>削除</button>
        </div>
      </div>
      <div className="detail-meta">
        <span>カテゴリ: {recipe.category || "未分類"}</span>
        <span>調理時間: {recipe.cooking_time ? `${recipe.cooking_time}分` : "-"}</span>
        <span>何人分: {recipe.servings ? `${recipe.servings}人分` : "-"}</span>
      </div>
      <hr className="divider" />

      <div className="section-title">【材料】</div>
      <ul className="ingredients-list">
        {(recipe.ingredients ?? []).map((i, idx) => (
          <li key={idx}>
            <span className="name">{i.name}</span>
            <span className="amount">{formatAmount(i)}</span>
          </li>
        ))}
      </ul>

      <div className="section-title">【手順】</div>
      <ol className="steps-list">
        {(recipe.steps ?? []).map((s, idx) => (
          <li key={idx}>{s.description}</li>
        ))}
      </ol>

      {recipe.memo && (
        <>
          <div className="section-title">【メモ】</div>
          <div className="memo-box">{recipe.memo}</div>
        </>
      )}

      {confirming && (
        <div className="modal-backdrop open">
          <div className="modal">
            <p>このレシピを削除しますか?</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirming(false)} disabled={deleting}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleDelete} disabled={deleting}>
                {deleting ? "削除中..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
