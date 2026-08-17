import { createAssessment } from "@/lib/data/assessments";
import { getCategories } from "@/lib/data/categories";
import { matchCategory } from "@/lib/logic/categoryMatcher";
import { buildWhatsAppUrl } from "@/lib/logic/whatsapp";
import type { AssessmentInput, AssessmentResult } from "@/lib/types";

export async function processAssessment(input: AssessmentInput): Promise<AssessmentResult> {
  const singaporeNumber = input.whatsappNumber.replace(/\D/g, "").replace(/^65/, "");
  if (!input.customerName.trim()) throw new Error("Please enter your name.");
  if (!/^[689]\d{7}$/.test(singaporeNumber)) {
    throw new Error("Enter a valid 8-digit Singapore WhatsApp number.");
  }
  if (!input.comfortConcern || !input.whenAffected || !input.budgetRange) {
    throw new Error("Please complete every question.");
  }

  const categories = await getCategories();
  const match = matchCategory(categories, {
    concern: input.comfortConcern,
    timing: input.whenAffected,
    budget: input.budgetRange,
    preferredCategoryId: input.preferredCategoryId,
  });
  const normalizedInput = { ...input, whatsappNumber: singaporeNumber };
  const assessmentId = await createAssessment({
    ...normalizedInput,
    suggestedCategory: match.category,
    suggestionConfidence: match.confidence,
    reviewStatus: match.reviewStatus,
  });

  return {
    assessmentId,
    category: match.category,
    confidence: match.confidence,
    reviewStatus: match.reviewStatus,
    whatsappUrl: buildWhatsAppUrl(normalizedInput, match.category),
  };
}
