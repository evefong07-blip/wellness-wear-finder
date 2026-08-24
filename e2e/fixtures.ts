import type { Page, Route } from "@playwright/test";
import { matchCategory } from "../lib/logic/categoryMatcher.ts";
import { buildUndecidedWhatsAppUrl, buildWhatsAppUrl } from "../lib/logic/whatsapp.ts";
import { isFullyUndecidedAssessment, undecidedPresentation } from "../lib/logic/undecided.ts";
import type { AssessmentInput, AssessmentResult, ProductCategory } from "../lib/types.ts";

export const concerns = [
  "Knee comfort during walking, standing or stairs",
  "Feet or lower-leg comfort after a long day",
  "Resting my eyes or winding down",
  "Not sure yet",
];

export const timings = ["During walking or stairs", "After long hours standing", "After a long day", "At bedtime or while resting", "It varies"];
export const budgets = ["Under S$80", "S$80–S$120", "S$120–S$180", "S$180–S$230", "Flexible / not sure"];
export const categoryChoices = ["Knee Supporter", "Wellness Socks", "Wellness Eye Mask", "Help me choose"];

export const categories: ProductCategory[] = [
  { id: "knee", name: "Knee Supporter", description: "Everyday knee comfort for walking, standing and stairs.", match_keywords: ["knee", "knees", "walking", "stairs", "joint", "support"], budget_min: 200, budget_max: 220 },
  { id: "socks", name: "Wellness Socks", description: "Everyday foot and lower-leg comfort after a long day.", match_keywords: ["feet", "foot", "legs", "lower-leg", "standing", "socks", "long day"], budget_min: 95, budget_max: 120 },
  { id: "eyes", name: "Wellness Eye Mask", description: "Quiet eye rest for travel, bedtime and winding down.", match_keywords: ["eye", "eyes", "sleep", "night", "rest", "bedtime", "winding down"], budget_min: 70, budget_max: 80 },
];

export function categoryId(choice: string): string | null {
  return categories.find((category) => category.name === choice)?.id ?? null;
}

export function mockAssessmentResult(input: AssessmentInput): AssessmentResult {
  const normalized = { ...input, customerName: input.customerName.trim(), whatsappNumber: input.whatsappNumber.replace(/\D/g, "").replace(/^65/, "") };
  if (isFullyUndecidedAssessment(input)) {
    return {
      assessmentId: "e2e-undecided",
      customerName: normalized.customerName,
      whatsappNumber: normalized.whatsappNumber,
      outcome: "consultation",
      category: null,
      confidence: 0,
      reviewStatus: "needs-review",
      whatsappUrl: buildUndecidedWhatsAppUrl(normalized),
      recommendationCopy: undecidedPresentation.message,
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
  return {
    assessmentId: `e2e-${match.category.id}`,
    customerName: normalized.customerName,
    whatsappNumber: normalized.whatsappNumber,
    outcome: "product",
    category: match.category,
    confidence: match.confidence,
    reviewStatus: match.reviewStatus,
    whatsappUrl: buildWhatsAppUrl(normalized, match.category),
    recommendationCopy: `${match.category.name} is a practical place to start based on your main comfort need and routine.`,
    suggestionSource: "rule",
    budgetRange: input.budgetRange,
    preferredCategoryId: input.preferredCategoryId,
  };
}

export async function installControlledApi(page: Page, options: { assessmentFailures?: number; assessmentDelayMs?: number; fittingFailures?: number; fittingDelayMs?: number } = {}) {
  let assessmentFailures = options.assessmentFailures ?? 0;
  let fittingFailures = options.fittingFailures ?? 0;
  let assessmentRequests = 0;
  let fittingRequests = 0;
  const assessmentBodies: AssessmentInput[] = [];
  const fittingBodies: Array<{ preferredTime: string }> = [];

  await page.route(/\/api\/events$/, async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tracked: true }) }));
  await page.route(/\/api\/assessments\/[^/]+\/fitting$/, async (route: Route) => {
    fittingRequests += 1;
    const body = route.request().postDataJSON() as { preferredTime: string };
    fittingBodies.push(body);
    if (options.fittingDelayMs) await new Promise((resolve) => setTimeout(resolve, options.fittingDelayMs));
    if (fittingFailures > 0) {
      fittingFailures -= 1;
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Controlled fitting failure." }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ saved: true }) });
  });
  await page.route(/\/api\/assessments$/, async (route: Route) => {
    assessmentRequests += 1;
    const body = route.request().postDataJSON() as AssessmentInput;
    assessmentBodies.push(body);
    if (options.assessmentDelayMs) await new Promise((resolve) => setTimeout(resolve, options.assessmentDelayMs));
    if (assessmentFailures > 0) {
      assessmentFailures -= 1;
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Controlled assessment failure." }) });
      return;
    }
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(mockAssessmentResult(body)) });
  });

  return {
    assessmentBodies,
    fittingBodies,
    assessmentRequestCount: () => assessmentRequests,
    fittingRequestCount: () => fittingRequests,
  };
}

export async function chooseButton(page: Page, label: string) {
  const exact = page.getByRole("button", { name: label, exact: true });
  if (await exact.count()) return exact.click();
  return page.getByRole("button").filter({ hasText: label }).click();
}

export async function advance(page: Page) {
  await page.getByRole("button", { name: /Continue/ }).click();
}

export async function reachContactStep(page: Page, answers: { concern: string; timing: string; category: string; budget: string }) {
  await chooseButton(page, answers.concern);
  await advance(page);
  await chooseButton(page, answers.timing);
  await advance(page);
  await chooseButton(page, answers.category);
  await advance(page);
  await chooseButton(page, answers.budget);
  await advance(page);
}

export async function submitCustomer(page: Page, name: string, number: string) {
  await page.getByRole("textbox", { name: "Your name" }).fill(name);
  await page.getByRole("textbox", { name: "WhatsApp number" }).fill(number);
  await page.getByRole("button", { name: /Get My Custom Match/ }).click();
}
