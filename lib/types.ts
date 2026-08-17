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
};
