import { createAssessment } from "@/lib/data/assessments";
import { getCategories } from "@/lib/data/categories";
import { matchCategory } from "@/lib/logic/categoryMatcher";
import { buildUndecidedWhatsAppUrl, buildWhatsAppUrl } from "@/lib/logic/whatsapp";
import { getAiSuggestion } from "@/lib/ai/suggestion";
import { scoreLead, structureAssessment } from "@/lib/logic/intelligence";
import { trackEvent } from "@/lib/data/events";
import type { AssessmentInput, AssessmentResult } from "@/lib/types";
import { isFullyUndecidedAssessment, undecidedStructuredAssessment } from "@/lib/logic/undecided";

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
  const normalizedInput = { ...input, whatsappNumber: singaporeNumber };

  if (isFullyUndecidedAssessment(input)) {
    const structured = undecidedStructuredAssessment();
    const lead = scoreLead(input, 0);
    const assessmentId = await createAssessment({
      ...normalizedInput,
      suggestedCategory: null,
      suggestionConfidence: 0,
      reviewStatus: "needs-review",
      suggestionSource: "rule",
      ...structured,
      leadScore: lead.score,
      leadScoreReasons: [...lead.reasons, "Needs personal guidance"],
    });
    await trackEvent("assessment_completed", assessmentId, { source: "consultation" }).catch(() => undefined);

    return {
      assessmentId,
      outcome: "consultation",
      category: null,
      confidence: 0,
      reviewStatus: "needs-review",
      whatsappUrl: buildUndecidedWhatsAppUrl(normalizedInput),
      recommendationCopy: structured.recommendationCopy,
      suggestionSource: "rule",
      budgetRange: input.budgetRange,
      preferredCategoryId: null,
    };
  }

  const match = matchCategory(categories, {
    concern: input.comfortConcern,
    timing: input.whenAffected,
    budget: input.budgetRange,
    preferredCategoryId: input.preferredCategoryId,
  });
  const aiSuggestion = await getAiSuggestion(input, categories);
  const approvedAiSuggestion = aiSuggestion?.suggestedCategoryId === match.category.id ? aiSuggestion : null;
  const suggestedCategory = match.category;
  const confidence = approvedAiSuggestion?.confidence ?? match.confidence;
  const structured = approvedAiSuggestion ?? structureAssessment(input, suggestedCategory);
  const lead = scoreLead(input, confidence);
  const assessmentId = await createAssessment({
    ...normalizedInput,
    suggestedCategory,
    suggestionConfidence: confidence,
    reviewStatus: confidence < 0.5 ? "needs-review" : match.reviewStatus,
    suggestionSource: approvedAiSuggestion ? "ai" : "rule",
    ...structured,
    leadScore: lead.score,
    leadScoreReasons: lead.reasons,
  });
  await Promise.allSettled([
    trackEvent("assessment_completed", assessmentId, { source: approvedAiSuggestion ? "ai" : "rule" }),
    trackEvent("suggestion_shown", assessmentId, { categoryId: suggestedCategory.id }),
  ]);

  return {
    assessmentId,
    outcome: "product",
    category: suggestedCategory,
    confidence,
    reviewStatus: confidence < 0.5 ? "needs-review" : match.reviewStatus,
    whatsappUrl: buildWhatsAppUrl(normalizedInput, suggestedCategory),
    recommendationCopy: structured.recommendationCopy,
    suggestionSource: approvedAiSuggestion ? "ai" : "rule",
    budgetRange: input.budgetRange,
    preferredCategoryId: input.preferredCategoryId,
  };
}
