import { createClient } from "@/lib/supabase/server";
import type { AssessmentInput, ProductCategory } from "@/lib/types";

type CreateAssessmentArgs = AssessmentInput & {
  suggestedCategory: ProductCategory;
  suggestionConfidence: number;
  reviewStatus: "unreviewed" | "needs-review";
};

export async function createAssessment(input: CreateAssessmentArgs): Promise<string> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("The database environment is not configured yet.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      customer_name: input.customerName.trim(),
      whatsapp_number: input.whatsappNumber,
      comfort_concern: input.comfortConcern,
      when_affected: input.whenAffected,
      preferred_category_id: input.preferredCategoryId,
      budget_range: input.budgetRange,
      suggested_category_id: input.suggestedCategory.id,
      suggestion_source: "rule",
      suggestion_confidence: input.suggestionConfidence,
      review_status: input.reviewStatus,
      preferred_next_step: "whatsapp",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save your assessment: ${error.message}`);
  return data.id;
}
