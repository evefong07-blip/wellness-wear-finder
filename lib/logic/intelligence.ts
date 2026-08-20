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
  const parsedConcern = concern.includes("knee") ? "knee_comfort"
    : concern.includes("foot") || concern.includes("feet") || concern.includes("leg") ? "foot_leg_comfort"
      : concern.includes("eye") || concern.includes("rest") || concern.includes("sleep") ? "eye_rest"
        : "general_comfort";
  const parsedTiming = timing.includes("walking") || timing.includes("stairs") ? "during_movement"
    : timing.includes("standing") ? "after_standing"
      : timing.includes("bedtime") || timing.includes("rest") ? "rest_time"
        : timing.includes("long day") ? "after_day" : "variable";
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
  if (/knee|feet|foot|leg|eye|rest|sleep/i.test(input.comfortConcern)) { score += 15; reasons.push("Specific comfort need"); }
  return { score: Math.min(100, score), reasons };
}
