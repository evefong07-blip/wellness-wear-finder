import type { ProductCategory } from "../types.ts";

export type BudgetFit = "fits" | "overlaps" | "outside" | "flexible" | "unknown";

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
  if (category.budget_min >= budgetMin && category.budget_max <= budgetMax) return "fits";
  if (budgetMax >= category.budget_min && budgetMin <= category.budget_max) return "overlaps";
  return "outside";
}

export function formatEstimatedPrice(category: ProductCategory): string {
  if (category.budget_min === null) return "Estimated price confirmed during your private chat";
  if (category.budget_max === null || category.budget_max === category.budget_min) return `Estimated price: S$${category.budget_min}`;
  return `Estimated price range: S$${category.budget_min}–S$${category.budget_max}`;
}

export function formatPriceAmount(category: ProductCategory): string {
  if (category.budget_min === null) return "a price confirmed with Evelyn";
  if (category.budget_max === null || category.budget_max === category.budget_min) return `S$${category.budget_min}`;
  return `S$${category.budget_min}–S$${category.budget_max}`;
}

export function describeBudgetFit(category: ProductCategory, range: string, deliberatelySelected = false): string {
  const fit = getBudgetFit(category, range);
  if (fit === "flexible") return "You selected a flexible budget, so your comfort needs and routine guided this match.";
  if (fit === "fits") return `The estimated price fits within your selected range (${range}).`;
  if (fit === "overlaps") return `The estimated price overlaps your selected range (${range}).`;
  if (fit === "outside") {
    const [budgetMin, budgetMax] = parseBudget(range);
    const direction = category.budget_min !== null && category.budget_min > budgetMax ? "above" : category.budget_max !== null && category.budget_max < budgetMin ? "below" : "outside";
    const subject = deliberatelySelected ? "Your selected product" : `This ${category.name} recommendation`;
    return `${subject} is typically ${formatPriceAmount(category)}, which is ${direction} your preferred budget. Evelyn can discuss alternatives or help you decide whether it is suitable.`;
  }
  return "Ask the distributor to confirm the price before deciding.";
}
