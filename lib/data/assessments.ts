import { createClient } from "@/lib/supabase/server";
import type { AssessmentInput, AssessmentRow, ProductCategory } from "@/lib/types";

type CreateAssessmentArgs = AssessmentInput & {
  suggestedCategory: ProductCategory;
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

export async function createAssessment(input: CreateAssessmentArgs): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("The database environment is not configured yet.");
  }

  const assessmentId = crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessments")
    .insert({
      id: assessmentId,
      customer_name: input.customerName.trim(),
      whatsapp_number: input.whatsappNumber,
      comfort_concern: input.comfortConcern,
      when_affected: input.whenAffected,
      preferred_category_id: input.preferredCategoryId,
      budget_range: input.budgetRange,
      suggested_category_id: input.suggestedCategory.id,
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
    });

  if (error) throw new Error(`Could not save your assessment: ${error.message}`);
  return assessmentId;
}

export async function requestFitting(assessmentId: string, preferredTime: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .rpc("request_assessment_fitting", { assessment_id: assessmentId, preferred_time: preferredTime });
  if (error) throw new Error(`Could not save your fitting request: ${error.message}`);
}

export async function getAssessments(): Promise<AssessmentRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id,customer_name,whatsapp_number,comfort_concern,when_affected,budget_range,suggestion_source,suggestion_confidence,review_status,preferred_next_step,fitting_preferred_time,created_at,parsed_concern,recommendation_copy,lead_score,lead_score_reasons,suggested_category:product_categories!suggested_category_id(name)")
    .order("lead_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load assessments: ${error.message}`);

  return (data ?? []).map((row) => {
    const joined = row.suggested_category as unknown as { name: string } | { name: string }[] | null;
    const category = Array.isArray(joined) ? joined[0]?.name : joined?.name;
    return {
      id: row.id,
      customerName: row.customer_name,
      whatsappNumber: row.whatsapp_number,
      comfortConcern: row.comfort_concern ?? "—",
      whenAffected: row.when_affected ?? "—",
      budgetRange: row.budget_range ?? "—",
      suggestedCategory: category ?? "Needs review",
      confidence: Number(row.suggestion_confidence ?? 0),
      reviewStatus: row.review_status ?? "unreviewed",
      preferredNextStep: row.preferred_next_step,
      fittingPreferredTime: row.fitting_preferred_time,
      createdAt: row.created_at,
      parsedConcern: row.parsed_concern,
      recommendationCopy: row.recommendation_copy,
      suggestionSource: row.suggestion_source ?? "rule",
      leadScore: Number(row.lead_score ?? 0),
      leadScoreReasons: row.lead_score_reasons ?? [],
    };
  });
}

export async function markAssessmentContacted(assessmentId: string, actorId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("assessments").update({ review_status: "contacted" }).eq("id", assessmentId);
  if (error) throw new Error(`Could not update assessment: ${error.message}`);
  const { error: auditError } = await supabase.from("audit_logs").insert({ action: "assessment_marked_contacted", actor: actorId, target_id: assessmentId });
  if (auditError) throw new Error(`Assessment updated but audit log failed: ${auditError.message}`);
}
