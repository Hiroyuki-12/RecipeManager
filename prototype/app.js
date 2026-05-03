// プロトタイプ用の簡易データストア (localStorage)
const STORAGE_KEY = "recipemanager.prototype.recipes.v2";

const UNIT_OPTIONS = [
  "個", "g", "kg", "ml", "cc", "L",
  "本", "枚", "杯", "房", "片",
  "大さじ", "小さじ", "カップ",
  "少々", "適量",
];

const SEED_RECIPES = [
  {
    id: 1,
    title: "肉じゃが",
    category: "和食",
    cooking_time: 30,
    servings: 4,
    ingredients: [
      { name: "玉ねぎ", amount: "1", unit: "個" },
      { name: "じゃがいも", amount: "3", unit: "個" },
      { name: "牛肉", amount: "200", unit: "g" },
      { name: "醤油", amount: "2", unit: "大さじ" },
    ],
    steps: [
      { order: 1, description: "材料を一口大に切る" },
      { order: 2, description: "鍋で炒める" },
      { order: 3, description: "調味料を加えて煮込む" },
    ],
    memo: "甘めが好み。砂糖を多めに。",
    created_at: "2026-04-30T10:00:00",
  },
  {
    id: 2,
    title: "カレー",
    category: "洋食",
    cooking_time: 45,
    servings: 5,
    ingredients: [
      { name: "玉ねぎ", amount: "2", unit: "個" },
      { name: "にんじん", amount: "1", unit: "本" },
      { name: "じゃがいも", amount: "2", unit: "個" },
      { name: "豚肉", amount: "300", unit: "g" },
      { name: "カレールー", amount: "1", unit: "個" },
    ],
    steps: [
      { order: 1, description: "野菜と肉を切る" },
      { order: 2, description: "鍋で具材を炒める" },
      { order: 3, description: "水を入れて煮込む" },
      { order: 4, description: "ルーを溶かして仕上げる" },
    ],
    memo: "",
    created_at: "2026-04-28T19:00:00",
  },
  {
    id: 3,
    title: "麻婆豆腐",
    category: "中華",
    cooking_time: 20,
    servings: 3,
    ingredients: [
      { name: "豆腐", amount: "1", unit: "個" },
      { name: "豚ひき肉", amount: "150", unit: "g" },
      { name: "豆板醤", amount: "1", unit: "小さじ" },
    ],
    steps: [
      { order: 1, description: "豆腐をさいの目に切る" },
      { order: 2, description: "ひき肉と豆板醤を炒める" },
      { order: 3, description: "豆腐を加えて煮る" },
    ],
    memo: "辛さは豆板醤の量で調整",
    created_at: "2026-05-01T12:00:00",
  },
];

function loadRecipes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECIPES));
    return [...SEED_RECIPES];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...SEED_RECIPES];
  }
}

function saveRecipes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getRecipe(id) {
  return loadRecipes().find((r) => r.id === Number(id));
}

function nextId(list) {
  return list.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatAmount(ing) {
  const amount = ing.amount ? String(ing.amount) : "";
  const unit = ing.unit || "";
  if (!amount && !unit) return "";
  if (!amount) return unit; // 少々 / 適量 など
  return `${amount}${unit}`;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
