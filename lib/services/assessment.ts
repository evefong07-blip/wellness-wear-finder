import { createAssessment } from "@/lib/data/assessments";
import { getCategories } from "@/lib/data/categories";
import { matchCategory } from "@/lib/logic/categoryMatcher";
import { buildWhatsAppUrl } from "@/lib/logic/whatsapp";
import { getAiSuggestion } from "@/lib/ai/suggestion";
import { scoreLead, structureAssessment } from "@/lib/logic/intelligence";
import { trackEvent } from "@/lib/data/events";
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
  const aiSuggestion = await getAiSuggestion(input, categories);
  const suggestedCategory = aiSuggestion ? categories.find((category) => category.id === aiSuggestion.suggestedCategoryId) ?? match.category : match.category;
  const confidence = aiSuggestion?.confidence ?? match.confidence;
  const structured = aiSuggestion ?? structureAssessment(input, suggestedCategory);
  const lead = scoreLead(input, confidence);
  const normalizedInput = { ...input, whatsappNumber: singaporeNumber };
  const assessmentId = await createAssessment({
    ...normalizedInput,
    suggestedCategory,
    suggestionConfidence: confidence,
    reviewStatus: confidence < 0.5 ? "needs-review" : match.reviewStatus,
    suggestionSource: aiSuggestion ? "ai" : "rule",
    ...structured,
    leadScore: lead.score,
    leadScoreReasons: lead.reasons,
  });
  await Promise.allSettled([
    trackEvent("assessment_completed", assessmentId, { source: aiSuggestion ? "ai" : "rule" }),
    trackEvent("suggestion_shown", assessmentId, { categoryId: suggestedCategory.id }),
  ]);

  return {
    assessmentId,
    category: suggestedCategory,
    confidence,
    reviewStatus: confidence < 0.5 ? "needs-review" : match.reviewStatus,
    whatsappUrl: buildWhatsAppUrl(normalizedInput, suggestedCategory),
    recommendationCopy: structured.recommendationCopy,
    suggestionSource: aiSuggestion ? "ai" : "rule",
  };
}
