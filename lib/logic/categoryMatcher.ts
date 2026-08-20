import type { ProductCategory } from "@/lib/types";

export type CategoryMatch = {
  category: ProductCategory;
  score: number;
  confidence: number;
  reviewStatus: "unreviewed" | "needs-review";
};

export type BudgetFit = "within" | "partial" | "outside" | "flexible" | "unknown";

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
  const fullyWithin = category.budget_min >= budgetMin && category.budget_max <= budgetMax;
  if (fullyWithin) return "within";

  const overlaps = category.budget_max >= budgetMin && category.budget_min <= budgetMax;
  return overlaps ? "partial" : "outside";
}

export function matchCategory(
  categories: ProductCategory[],
  answers: { concern: string; timing: string; budget: string; preferredCategoryId: string | null },
): CategoryMatch {
  if (!categories.length) throw new Error("No product categories are available.");

  const concern = answers.concern.toLowerCase();
  const timing = answers.timing.toLowerCase();
  const ranked = categories
    .map((category) => {
      const keywords = category.match_keywords ?? [];
      const concernMatch = keywords.some((keyword) => concern.includes(keyword.toLowerCase()));
      const timingMatch = keywords.some((keyword) => timing.includes(keyword.toLowerCase()));
      const budgetFit = getBudgetFit(category, answers.budget);
      const budgetScore = budgetFit === "within" || budgetFit === "flexible" ? 2 : budgetFit === "partial" ? 1 : 0;
      const score =
        (concernMatch ? 3 : 0) +
        (timingMatch ? 1 : 0) +
        budgetScore +
        (answers.preferredCategoryId === category.id ? 2 : 0);
      return { category, score };
    })
    .sort((a, b) => b.score - a.score || a.category.name.localeCompare(b.category.name));

  const top = ranked[0];
  const tied = ranked.length > 1 && ranked[1].score === top.score;
  const needsReview = tied || top.score < 3;
  return {
    ...top,
    confidence: needsReview ? 0.4 : Math.min(1, top.score / 8),
    reviewStatus: needsReview ? "needs-review" : "unreviewed",
  };
}
