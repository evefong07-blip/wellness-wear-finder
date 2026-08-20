export type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  match_keywords: string[];
  budget_min: number | null;
  budget_max: number | null;
};

export type AssessmentInput = {
  customerName: string;
  whatsappNumber: string;
  comfortConcern: string;
  whenAffected: string;
  budgetRange: string;
  preferredCategoryId: string | null;
};

export type AssessmentResult = {
  assessmentId: string;
  category: ProductCategory;
  confidence: number;
  reviewStatus: "unreviewed" | "needs-review";
  whatsappUrl: string;
  recommendationCopy: string;
  suggestionSource: "rule" | "ai";
};

export type AssessmentRow = {
  id: string;
  customerName: string;
  whatsappNumber: string;
  comfortConcern: string;
  whenAffected: string;
  budgetRange: string;
  suggestedCategory: string;
  confidence: number;
  reviewStatus: string;
  preferredNextStep: string | null;
  fittingPreferredTime: string | null;
  createdAt: string;
  parsedConcern: string | null;
  recommendationCopy: string | null;
  suggestionSource: string;
  leadScore: number;
  leadScoreReasons: string[];
};
