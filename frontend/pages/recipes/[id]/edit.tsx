import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RecipeForm from "@/components/RecipeForm";
import { api, ApiError, type Recipe, type RecipeInput } from "@/lib/api";

export default function EditRecipePage() {
  const router = useRouter();
  const { id } = router.query;
  type State =
    | { status: "loading" }
    | { status: "success"; recipe: Recipe }
    | { status: "notFound" };
  const [state, setState] = useState<State>({ status: "loading" });
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(input: RecipeInput) {
    if (!recipe) return;
    setSubmitting(true);
    try {
      await api.update(recipe.id, input);
      router.push(`/recipes/${recipe.id}`);
    } catch (e) {
      setSubmitting(false);
      const msg = e instanceof ApiError ? `更新に失敗しました (${e.status})` : "更新に失敗しました";
      alert(msg);
    }
  }

  if (state.status === "loading") return <div className="empty">読み込み中...</div>;
  if (state.status === "notFound" || !recipe) {
    return (
      <>
        <Link href="/recipes" className="back-link">← 一覧へ戻る</Link>
        <div className="empty">レシピが見つかりません</div>
      </>
    );
  }

  return (
    <RecipeForm
      mode="edit"
      initial={recipe}
      submitting={submitting}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/recipes/${recipe.id}`)}
    />
  );
}
