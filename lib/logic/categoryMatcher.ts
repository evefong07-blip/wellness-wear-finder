import type { ProductCategory } from "@/lib/types";

export type CategoryMatch = {
  category: ProductCategory;
  score: number;
  confidence: number;
  reviewStatus: "unreviewed" | "needs-review";
};

export function parseBudget(range: string): [number, number] {
  const values = range.match(/\d+/g)?.map(Number) ?? [];
  if (!values.length) return [0, Number.POSITIVE_INFINITY];
  if (values.length === 1) return [0, values[0]];
  return [Math.min(values[0], values[1]), Math.max(values[0], values[1])];
}

export function matchCategory(
  categories: ProductCategory[],
  answers: { concern: string; timing: string; budget: string; preferredCategoryId: string | null },
): CategoryMatch {
  if (!categories.length) throw new Error("No product categories are available.");

  const concern = answers.concern.toLowerCase();
  const timing = answers.timing.toLowerCase();
  const [budgetMin, budgetMax] = parseBudget(answers.budget);
  const ranked = categories
    .map((category) => {
      const keywords = category.match_keywords ?? [];
      const concernMatch = keywords.some((keyword) => concern.includes(keyword.toLowerCase()));
      const timingMatch = keywords.some((keyword) => timing.includes(keyword.toLowerCase()));
      const categoryMin = category.budget_min ?? 0;
      const categoryMax = category.budget_max ?? Number.POSITIVE_INFINITY;
      const budgetMatches = budgetMax >= categoryMin && budgetMin <= categoryMax;
      const score =
        (concernMatch ? 3 : 0) +
        (timingMatch ? 1 : 0) +
        (budgetMatches ? 2 : 0) +
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
