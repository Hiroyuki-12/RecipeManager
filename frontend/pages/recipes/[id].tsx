import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Breadcrumb from "@/components/Breadcrumb";
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
        <Breadcrumb href="/recipes" />
        <div className="empty">読み込み中...</div>
      </>
    );
  }

  if (state.status === "notFound" || !recipe) {
    return (
      <>
        <Breadcrumb href="/recipes" />
        <div className="empty">レシピが見つかりません</div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb href="/recipes" />

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

      <h3 className="section-title">材料</h3>
      <ul className="ingredients-list">
        {(recipe.ingredients ?? []).map((i, idx) => (
          <li key={idx}>
            <span className="name">{i.name}</span>
            <span className="amount">{formatAmount(i)}</span>
          </li>
        ))}
      </ul>

      <h3 className="section-title">作り方</h3>
      <ol className="steps-list">
        {(recipe.steps ?? []).map((s, idx) => (
          <li key={idx}>{s.description}</li>
        ))}
      </ol>

      {recipe.memo && (
        <>
          <h3 className="section-title">メモ</h3>
          <div className="memo-box">{recipe.memo}</div>
        </>
      )}

      {confirming && (
        <div className="modal-backdrop open">
          <div className="modal">
            <p>このレシピを削除しますか?</p>
            <div className="modal-actions">
              <button className="btn btn-strong" onClick={() => setConfirming(false)} disabled={deleting}>
                キャンセル
              </button>
              <button className="btn btn-danger-solid" onClick={handleDelete} disabled={deleting}>
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
