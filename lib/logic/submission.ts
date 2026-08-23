import type { AssessmentInput, ProductCategory } from "../types.ts";

export type AssessmentSubmission = AssessmentInput & {
  suggestedCategory: ProductCategory | null;
  suggestionConfidence: number;
  reviewStatus: "unreviewed" | "needs-review";
  suggestionSource: "rule" | "ai";
  parsedConcern: string;
  parsedTiming: string;
  parsedBudgetMin: number;
  parsedBudgetMax: number;
  recommendationCopy: string;
  leadScore: number;
  leadScoreReasons: string[];
};

export function assertDatabaseConfigured(environment: Record<string, string | undefined>): void {
  if (!environment.NEXT_PUBLIC_SUPABASE_URL || !environment.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("The database environment is not configured yet. Please try again later.");
  }
}

export function buildAssessmentRecord(input: AssessmentSubmission, assessmentId: string) {
  return {
    id: assessmentId,
    customer_name: input.customerName.trim(),
    whatsapp_number: input.whatsappNumber,
    comfort_concern: input.comfortConcern,
    when_affected: input.whenAffected,
    preferred_category_id: input.preferredCategoryId,
    budget_range: input.budgetRange,
    suggested_category_id: input.suggestedCategory?.id ?? null,
    suggestion_source: input.suggestionSource,
    suggestion_confidence: input.suggestionConfidence,
    review_status: input.reviewStatus,
    preferred_next_step: "whatsapp",
    parsed_concern: input.parsedConcern,
    parsed_timing: input.parsedTiming,
    parsed_budget_min: input.parsedBudgetMin,
    parsed_budget_max: input.parsedBudgetMax,
    recommendation_copy: input.recommendationCopy,
    lead_score: input.leadScore,
    lead_score_reasons: input.leadScoreReasons,
  };
}
