import type { AssessmentInput } from "../types.ts";

export const undecidedPresentation = {
  title: "Let’s narrow it down together",
  message: "Your preferences are still open, so a short personal chat will help us suggest the most suitable starting point for your routine and budget.",
  primaryAction: "Help me choose on WhatsApp",
  secondaryAction: "Request a private fitting",
  supportingText: "We’ll help you explore the most relevant everyday comfort option—without pressure to purchase.",
  showProduct: false,
  showImage: false,
  showPrice: false,
} as const;

export function isFullyUndecidedAssessment(input: AssessmentInput): boolean {
  return input.comfortConcern === "Not sure yet"
    && input.whenAffected === "It varies"
    && input.preferredCategoryId === null
    && input.budgetRange === "Flexible / not sure";
}

export function undecidedStructuredAssessment() {
  return {
    parsedConcern: "general_comfort",
    parsedTiming: "variable",
    parsedBudgetMin: 0,
    parsedBudgetMax: 0,
    recommendationCopy: undecidedPresentation.message,
  };
}
