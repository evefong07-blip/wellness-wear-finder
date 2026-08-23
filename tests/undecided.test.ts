import test from "node:test";
import assert from "node:assert/strict";
import { buildAssessmentRecord, type AssessmentSubmission } from "../lib/logic/submission.ts";
import { buildFittingWhatsAppUrl, buildUndecidedWhatsAppUrl } from "../lib/logic/whatsapp.ts";
import { isFullyUndecidedAssessment, undecidedPresentation, undecidedStructuredAssessment } from "../lib/logic/undecided.ts";
import type { AssessmentInput } from "../lib/types.ts";

const input: AssessmentInput = {
  customerName: "Codex Undecided QA",
  whatsappNumber: "81234567",
  comfortConcern: "Not sure yet",
  whenAffected: "It varies",
  preferredCategoryId: null,
  budgetRange: "Flexible / not sure",
};

test("recognises only the exact fully undecided answer combination", () => {
  assert.equal(isFullyUndecidedAssessment(input), true);
  assert.equal(isFullyUndecidedAssessment({ ...input, comfortConcern: "Knee comfort during walking, standing or stairs" }), false);
  assert.equal(isFullyUndecidedAssessment({ ...input, whenAffected: "During walking or stairs" }), false);
  assert.equal(isFullyUndecidedAssessment({ ...input, preferredCategoryId: "knee" }), false);
  assert.equal(isFullyUndecidedAssessment({ ...input, budgetRange: "Under S$80" }), false);
});

test("shows the neutral consultation result without product or false match claims", () => {
  assert.equal(undecidedPresentation.title, "Let’s narrow it down together");
  assert.equal(undecidedPresentation.primaryAction, "Help me choose on WhatsApp");
  assert.equal(undecidedPresentation.secondaryAction, "Request a private fitting");
  assert.equal(undecidedPresentation.showProduct, false);
  assert.equal(undecidedPresentation.showImage, false);
  assert.equal(undecidedPresentation.showPrice, false);

  const displayedCopy = Object.values(undecidedPresentation).join(" ");
  assert.doesNotMatch(displayedCopy, /Knee Supporter|Wellness Socks|Wellness Eye Mask|S\$|Your likely match/i);
  assert.doesNotMatch(displayedCopy, /comfort need and routine aligned|guided the match|Why this match/i);
});

test("builds both contact actions for the distributor, never the visitor", () => {
  const whatsappUrl = new URL(buildUndecidedWhatsAppUrl(input));
  const helpMessage = whatsappUrl.searchParams.get("text") ?? "";
  assert.equal(whatsappUrl.hostname, "wa.me");
  assert.equal(whatsappUrl.pathname, "/6580208895");
  assert.equal(helpMessage, "Hi, I completed the Wellness Wear Finder assessment, but I’m still unsure which option suits me.\n\nMy answers:\nComfort need: Not sure yet\nRoutine: It varies\nBudget: Flexible / not sure\n\nCould you help me find a suitable starting point?");
  assert.doesNotMatch(helpMessage, /81234567|6581234567|private fitting/i);
  assert.doesNotMatch(helpMessage, /learn more\.Hi/i);

  const fittingUrl = new URL(buildFittingWhatsAppUrl("2026-08-24T15:00"));
  const fittingMessage = fittingUrl.searchParams.get("text") ?? "";
  assert.equal(fittingUrl.pathname, "/6580208895");
  assert.equal(fittingMessage, "Hi, I completed the Wellness Wear Finder assessment and would like to request a private fitting.\n\nPreferred date and time: 24 Aug 2026 at 3:00 PM\n\nPlease let me know if this time is available.");
  assert.doesNotMatch(fittingMessage, /81234567|6581234567|Comfort need:|Routine:|Budget:/i);
  assert.notEqual(fittingMessage, helpMessage);
});

test("persists the undecided assessment without a suggested product", () => {
  const structured = undecidedStructuredAssessment();
  const submission: AssessmentSubmission = {
    ...input,
    suggestedCategory: null,
    suggestionConfidence: 0,
    reviewStatus: "needs-review",
    suggestionSource: "rule",
    ...structured,
    leadScore: 20,
    leadScoreReasons: ["Needs personal guidance"],
  };

  const record = buildAssessmentRecord(submission, "undecided-assessment-id");
  assert.equal(record.suggested_category_id, null);
  assert.equal(record.preferred_category_id, null);
  assert.equal(record.suggestion_confidence, 0);
  assert.equal(record.review_status, "needs-review");
  assert.equal(record.customer_name, "Codex Undecided QA");
  assert.equal(record.whatsapp_number, "81234567");
  assert.equal(record.comfort_concern, "Not sure yet");
  assert.equal(record.when_affected, "It varies");
  assert.equal(record.budget_range, "Flexible / not sure");
  assert.equal(record.recommendation_copy, undecidedPresentation.message);
});
