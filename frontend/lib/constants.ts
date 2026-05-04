export const CATEGORIES = ["和食", "洋食", "中華", "その他"] as const;

export const UNIT_OPTIONS = [
  "個", "g", "kg", "ml", "cc", "L",
  "本", "枚", "杯", "房", "片",
  "大さじ", "小さじ", "カップ",
  "少々", "適量",
];

export const COOKING_TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
export const SERVINGS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function toHalfWidthDigits(input: string): string {
  return input.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/．/g, ".");
}

export function formatAmount(ing: { amount?: string | null; unit?: string | null }): string {
  const amount = ing.amount ? String(ing.amount) : "";
  const unit = ing.unit || "";
  if (!amount && !unit) return "";
  if (!amount) return unit;
  return `${amount}${unit}`;
}
