import { createClient } from "@/lib/supabase/server";
import type { AssessmentRow } from "@/lib/types";
import { assertDatabaseConfigured, buildAssessmentRecord, type AssessmentSubmission } from "@/lib/logic/submission";

type AssessmentQueryRow = {
  id: string;
  customer_name: string;
  whatsapp_number: string;
  comfort_concern: string | null;
  when_affected: string | null;
  budget_range: string | null;
  suggestion_source: string | null;
  suggestion_confidence: number | string | null;
  review_status: string | null;
  preferred_next_step: string | null;
  fitting_preferred_time: string | null;
  created_at: string;
  parsed_concern: string | null;
  recommendation_copy: string | null;
  lead_score: number | string | null;
  lead_score_reasons: string[] | null;
  suggested_category: { name: string } | { name: string }[] | null;
};

export async function createAssessment(input: AssessmentSubmission): Promise<string> {
  assertDatabaseConfigured(process.env);

  const assessmentId = crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessments")
    .insert(buildAssessmentRecord(input, assessmentId));

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

  return (data ?? []).map((row: AssessmentQueryRow) => {
    const joined = row.suggested_category;
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
