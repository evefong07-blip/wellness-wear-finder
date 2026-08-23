import type { ProductCategory } from "../types.ts";

export type BudgetFit = "overlaps" | "outside" | "flexible" | "unknown";

export function parseBudget(range: string): [number, number] {
  const values = range.match(/\d+/g)?.map(Number) ?? [];
  if (!values.length) return [0, Number.POSITIVE_INFINITY];
  if (values.length === 1) {
    if (/under|below|up to/i.test(range)) return [0, values[0]];
    if (/\+|above|over|from/i.test(range)) return [values[0], Number.POSITIVE_INFINITY];
    return [values[0], values[0]];
  }
  return [Math.min(values[0], values[1]), Math.max(values[0], values[1])];
}

export function getBudgetFit(category: ProductCategory, range: string): BudgetFit {
  if (!range.match(/\d/)) return "flexible";
  if (category.budget_min === null || category.budget_max === null) return "unknown";
  const [budgetMin, budgetMax] = parseBudget(range);
  return budgetMax >= category.budget_min && budgetMin <= category.budget_max ? "overlaps" : "outside";
}

export function formatEstimatedPrice(category: ProductCategory): string {
  if (category.budget_min === null) return "Estimated price confirmed during your private chat";
  if (category.budget_max === null || category.budget_max === category.budget_min) return `Estimated price: S$${category.budget_min}`;
  return `Estimated price range: S$${category.budget_min}–S$${category.budget_max}`;
}

export function describeBudgetFit(category: ProductCategory, range: string): string {
  const fit = getBudgetFit(category, range);
  if (fit === "flexible") return "You selected a flexible budget, so your comfort needs and routine guided this match.";
  if (fit === "overlaps") return `The estimated price overlaps your selected range (${range}).`;
  if (fit === "outside") return `The estimated price is outside your selected range (${range}). Your comfort needs were the stronger match, so check the price with the distributor before deciding.`;
  return "Ask the distributor to confirm the price before deciding.";
}
