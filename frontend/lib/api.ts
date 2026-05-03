const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export type Ingredient = { name: string; amount: string; unit?: string | null };
export type Step = { order: number; description: string };

export type Recipe = {
  id: number;
  title: string;
  category: string | null;
  ingredients: Ingredient[] | null;
  steps: Step[] | null;
  servings: number | null;
  cooking_time: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeInput = {
  title: string;
  category?: string | null;
  ingredients?: Ingredient[] | null;
  steps?: Step[] | null;
  servings?: number | null;
  cooking_time?: number | null;
  memo?: string | null;
};

export type ListParams = {
  keyword?: string;
  category?: string;
  sort?: "created_desc" | "name_asc";
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, body, `API ${res.status}: ${path}`);
  }
  return body as T;
}

function buildQuery(params: ListParams): string {
  const sp = new URLSearchParams();
  if (params.keyword) sp.set("keyword", params.keyword);
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const api = {
  list: (params: ListParams = {}) =>
    request<Recipe[]>(`/recipes${buildQuery(params)}`),
  get: (id: number | string) => request<Recipe>(`/recipes/${id}`),
  create: (input: RecipeInput) =>
    request<Recipe>("/recipes", {
      method: "POST",
      body: JSON.stringify({ recipe: input }),
    }),
  update: (id: number | string, input: RecipeInput) =>
    request<Recipe>(`/recipes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ recipe: input }),
    }),
  destroy: (id: number | string) =>
    request<void>(`/recipes/${id}`, { method: "DELETE" }),
};
