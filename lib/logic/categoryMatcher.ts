import type { ProductCategory } from "@/lib/types";
import { getBudgetFit } from "./budget.ts";

export { parseBudget } from "./budget.ts";

export type CategoryMatch = {
  category: ProductCategory;
  score: number;
  confidence: number;
  reviewStatus: "unreviewed" | "needs-review";
};

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
      const budgetScore = budgetFit === "fits" ? 2 : budgetFit === "overlaps" || budgetFit === "flexible" ? 1 : 0;
      const preferenceScore = answers.preferredCategoryId === category.id ? 4 : 0;
      const score =
        (concernMatch ? 16 : 0) +
        (timingMatch ? 8 : 0) +
        budgetScore +
        preferenceScore;
      return { category, score };
    })
    .sort((a, b) => b.score - a.score || a.category.name.localeCompare(b.category.name));

  const top = ranked[0];
  const tied = ranked.length > 1 && ranked[1].score === top.score;
  const needsReview = tied || top.score < 3;
  return {
    ...top,
    confidence: needsReview ? 0.4 : Math.min(1, top.score / 30),
    reviewStatus: needsReview ? "needs-review" : "unreviewed",
  };
}
