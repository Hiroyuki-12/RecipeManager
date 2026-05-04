import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Recipe, RecipeInput } from "@/lib/api";
import { CATEGORIES, COOKING_TIME_OPTIONS, SERVINGS_OPTIONS, UNIT_OPTIONS, toHalfWidthDigits } from "@/lib/constants";

type IngredientRow = { name: string; amount: string; unit: string };
type StepRow = { description: string };

type Props = {
  mode: "new" | "edit";
  initial?: Recipe;
  submitting: boolean;
  onSubmit: (input: RecipeInput) => void;
  onCancel: () => void;
};

type Errors = { title?: string; ingredients?: string; steps?: string };

function initialIngredients(initial?: Recipe): IngredientRow[] {
  if (initial?.ingredients?.length) {
    const rows = initial.ingredients.map((i) => ({
      name: i.name ?? "",
      amount: i.amount ?? "",
      unit: i.unit ?? "",
    }));
    return [...rows, { name: "", amount: "", unit: "" }];
  }
  return [{ name: "", amount: "", unit: "" }];
}

function initialSteps(initial?: Recipe): StepRow[] {
  if (initial?.steps?.length) {
    const rows = initial.steps.map((s) => ({ description: s.description ?? "" }));
    return [...rows, { description: "" }];
  }
  return [{ description: "" }];
}

export default function RecipeForm({ mode, initial, submitting, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [cookingTime, setCookingTime] = useState(initial?.cooking_time?.toString() ?? "");
  const [servings, setServings] = useState(initial?.servings?.toString() ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() => initialIngredients(initial));
  const [steps, setSteps] = useState<StepRow[]>(() => initialSteps(initial));
  const [errors, setErrors] = useState<Errors>({});

  const titleRef = useRef<HTMLInputElement>(null);
  const ingredientsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  function clearError(key: keyof Errors) {
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function updateIngredient(idx: number, patch: Partial<IngredientRow>) {
    setIngredients((rows) => {
      const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
      // 追従型 UX: 最終行に値が入ったら自動で空行を追加
      const last = next[next.length - 1];
      if (idx === next.length - 1 && last.name.trim() !== "") {
        return [...next, { name: "", amount: "", unit: "" }];
      }
      return next;
    });
    clearError("ingredients");
  }
  function updateStep(idx: number, description: string) {
    setSteps((rows) => {
      const next = rows.map((r, i) => (i === idx ? { description } : r));
      const last = next[next.length - 1];
      if (idx === next.length - 1 && last.description.trim() !== "") {
        return [...next, { description: "" }];
      }
      return next;
    });
    clearError("steps");
  }

  function handleIngredientKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter" && idx === ingredients.length - 1) {
      e.preventDefault();
      if (ingredients[idx].name.trim() !== "") {
        setIngredients((rows) => [...rows, { name: "", amount: "", unit: "" }]);
      }
    }
  }
  function handleStepKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter" && idx === steps.length - 1) {
      e.preventDefault();
      if (steps[idx].description.trim() !== "") {
        setSteps((rows) => [...rows, { description: "" }]);
      }
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanIngs = ingredients
      .map((i) => ({ name: i.name.trim(), amount: i.amount.trim(), unit: i.unit }))
      .filter((i) => i.name);
    const cleanSteps = steps
      .map((s, idx) => ({ order: idx + 1, description: s.description.trim() }))
      .filter((s) => s.description);

    const newErrors: Errors = {};
    if (!title.trim()) newErrors.title = "レシピ名を入力してください";
    if (cleanIngs.length === 0) newErrors.ingredients = "材料を 1 件以上入力してください";
    if (cleanSteps.length === 0) newErrors.steps = "手順を 1 件以上入力してください";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const target = newErrors.title
        ? titleRef.current
        : newErrors.ingredients
          ? ingredientsRef.current
          : stepsRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus?.();
      return;
    }

    onSubmit({
      title: title.trim(),
      category: category || null,
      cooking_time: cookingTime ? Number(cookingTime) : null,
      servings: servings ? Number(servings) : null,
      ingredients: cleanIngs,
      steps: cleanSteps,
      memo: memo.trim() || null,
    });
  }

  return (
    <form className="form-page" onSubmit={handleSubmit} noValidate>
      <h2>{mode === "new" ? "新規レシピ登録" : "レシピ編集"}</h2>
      <hr className="divider" />

      <div className={`form-group${errors.title ? " has-error" : ""}`}>
        <label htmlFor="title" className="required">レシピ名</label>
        <input
          ref={titleRef}
          id="title"
          type="text"
          maxLength={100}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
        />
        {errors.title && <div className="error-msg">{errors.title}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">カテゴリ</label>
          <select id="category" value={category ?? ""} onChange={(e) => setCategory(e.target.value)}>
            <option value="">未選択</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group numeric">
          <label htmlFor="cooking_time">調理時間 (分)</label>
          <input
            id="cooking_time"
            type="text"
            inputMode="numeric"
            list="cooking-time-options"
            placeholder="選択 / 入力"
            value={cookingTime}
            onChange={(e) => setCookingTime(toHalfWidthDigits(e.target.value))}
          />
          <datalist id="cooking-time-options">
            {COOKING_TIME_OPTIONS.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>
        <div className="form-group numeric">
          <label htmlFor="servings">何人分</label>
          <input
            id="servings"
            type="text"
            inputMode="numeric"
            list="servings-options"
            placeholder="選択 / 入力"
            value={servings}
            onChange={(e) => setServings(toHalfWidthDigits(e.target.value))}
          />
          <datalist id="servings-options">
            {SERVINGS_OPTIONS.map((v) => <option key={v} value={v} />)}
          </datalist>
        </div>
      </div>

      <div className={`form-group${errors.ingredients ? " has-error" : ""}`} ref={ingredientsRef} tabIndex={-1}>
        <label className="required">材料</label>
        <div>
          {ingredients.map((row, idx) => (
            <div key={idx} className="dynamic-row">
              <input
                type="text"
                placeholder="材料名"
                value={row.name}
                onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                onKeyDown={(e) => handleIngredientKeyDown(e, idx)}
              />
              <input
                type="text"
                inputMode="decimal"
                className="amount-num"
                placeholder="数量"
                value={row.amount}
                onChange={(e) => updateIngredient(idx, { amount: toHalfWidthDigits(e.target.value) })}
              />
              <input
                type="text"
                className="unit-select"
                list="unit-options"
                placeholder="単位"
                value={row.unit}
                onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
              />
              <button
                type="button"
                className="btn-link"
                onClick={() => setIngredients((rows) => (rows.length === 1 ? [{ name: "", amount: "", unit: "" }] : rows.filter((_, i) => i !== idx)))}
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={() => setIngredients((rows) => [...rows, { name: "", amount: "", unit: "" }])}
        >
          + 材料を追加
        </button>
        {errors.ingredients && <div className="error-msg">{errors.ingredients}</div>}
        <datalist id="unit-options">
          {UNIT_OPTIONS.map((u) => <option key={u} value={u} />)}
        </datalist>
      </div>

      <div className={`form-group${errors.steps ? " has-error" : ""}`} ref={stepsRef} tabIndex={-1}>
        <label className="required">手順</label>
        <div>
          {steps.map((row, idx) => (
            <div key={idx} className="dynamic-row">
              <span className="order">{idx + 1}.</span>
              <input
                type="text"
                placeholder="手順"
                value={row.description}
                onChange={(e) => updateStep(idx, e.target.value)}
                onKeyDown={(e) => handleStepKeyDown(e, idx)}
              />
              <button
                type="button"
                className="btn-link"
                onClick={() => setSteps((rows) => (rows.length === 1 ? [{ description: "" }] : rows.filter((_, i) => i !== idx)))}
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={() => setSteps((rows) => [...rows, { description: "" }])}
        >
          + 手順を追加
        </button>
        {errors.steps && <div className="error-msg">{errors.steps}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="memo">メモ</label>
        <textarea id="memo" value={memo ?? ""} onChange={(e) => setMemo(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "保存中..." : mode === "new" ? "登録" : "更新"}
        </button>
      </div>
    </form>
  );
}
