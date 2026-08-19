import { parseBudget } from "./categoryMatcher.ts";
import type { AssessmentInput, ProductCategory } from "../types.ts";

export type StructuredAssessment = {
  parsedConcern: string;
  parsedTiming: string;
  parsedBudgetMin: number;
  parsedBudgetMax: number;
  recommendationCopy: string;
};

export type LeadScore = { score: number; reasons: string[] };

export function structureAssessment(input: AssessmentInput, category: ProductCategory): StructuredAssessment {
  const concern = input.comfortConcern.toLowerCase();
  const timing = input.whenAffected.toLowerCase();
  const [budgetMin, rawBudgetMax] = parseBudget(input.budgetRange);
  const parsedConcern = concern.includes("posture") || concern.includes("back") ? "posture_support"
    : concern.includes("leg") || concern.includes("lower") ? "lower_body_comfort"
      : concern.includes("sleep") || concern.includes("relax") ? "sleep_relaxation"
        : concern.includes("muscle") || concern.includes("recover") ? "active_recovery" : "general_comfort";
  const parsedTiming = timing.includes("all day") || timing.includes("work") ? "all_day"
    : timing.includes("night") ? "night"
      : timing.includes("exercise") ? "after_exercise"
        : timing.includes("morning") ? "morning" : "variable";
  const budgetMax = Number.isFinite(rawBudgetMax) ? rawBudgetMax : Math.max(budgetMin, 200);

  return {
    parsedConcern,
    parsedTiming,
    parsedBudgetMin: budgetMin,
    parsedBudgetMax: budgetMax,
    recommendationCopy: `${category.name} is a practical place to start based on when you notice discomfort and the budget you selected. A private chat can help narrow down the most comfortable fit for your routine.`,
  };
}

export function scoreLead(input: AssessmentInput, confidence: number): LeadScore {
  const [, budgetMax] = parseBudget(input.budgetRange);
  const reasons: string[] = [];
  let score = 20;
  if (confidence >= 0.7) { score += 25; reasons.push("Strong category match"); }
  else if (confidence >= 0.5) { score += 15; reasons.push("Moderate category match"); }
  if (budgetMax >= 100) { score += 25; reasons.push("Budget fits core ranges"); }
  else if (budgetMax >= 50) { score += 15; reasons.push("Active purchase budget"); }
  if (input.preferredCategoryId) { score += 15; reasons.push("Expressed category preference"); }
  if (/posture|back|sleep|leg|muscle|recover/i.test(input.comfortConcern)) { score += 15; reasons.push("Specific comfort need"); }
  return { score: Math.min(100, score), reasons };
}
