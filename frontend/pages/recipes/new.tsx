import { useState } from "react";
import { useRouter } from "next/router";
import RecipeForm from "@/components/RecipeForm";
import { api, ApiError, type RecipeInput } from "@/lib/api";

export default function NewRecipePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: RecipeInput) {
    setSubmitting(true);
    try {
      const created = await api.create(input);
      router.push(`/recipes/${created.id}`);
    } catch (e) {
      setSubmitting(false);
      const msg = e instanceof ApiError ? `登録に失敗しました (${e.status})` : "登録に失敗しました";
      alert(msg);
    }
  }

  return (
    <RecipeForm
      mode="new"
      submitting={submitting}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/recipes")}
    />
  );
}
