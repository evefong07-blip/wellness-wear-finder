import test from "node:test";
import assert from "node:assert/strict";
import { assertDatabaseConfigured, buildAssessmentRecord, type AssessmentSubmission } from "../lib/logic/submission.ts";

const submission: AssessmentSubmission = {
  customerName: "  Sarah Tan  ", whatsappNumber: "81234567", comfortConcern: "Knee comfort during walking, standing or stairs", whenAffected: "During walking or stairs", budgetRange: "S$80–S$120", preferredCategoryId: null,
  suggestedCategory: { id: "knee", name: "Knee Supporter", description: "Support", match_keywords: ["knee"], budget_min: 200, budget_max: 220 },
  suggestionConfidence: 0.8, reviewStatus: "unreviewed", suggestionSource: "rule", parsedConcern: "knee_comfort", parsedTiming: "during_movement", parsedBudgetMin: 80, parsedBudgetMax: 120,
  recommendationCopy: "Knee Supporter is a practical starting point.", leadScore: 85, leadScoreReasons: ["Strong category match"],
};

test("builds the complete Supabase assessment insert payload", () => {
  const record = buildAssessmentRecord(submission, "assessment-id");
  assert.equal(record.id, "assessment-id");
  assert.equal(record.customer_name, "Sarah Tan");
  assert.equal(record.whatsapp_number, "81234567");
  assert.equal(record.suggested_category_id, "knee");
  assert.equal(record.budget_range, "S$80–S$120");
  assert.equal(record.preferred_next_step, "whatsapp");
  assert.deepEqual(record.lead_score_reasons, ["Strong category match"]);
});

test("fails clearly when database environment variables are missing", () => {
  assert.throws(() => assertDatabaseConfigured({}), /database environment is not configured/i);
  assert.doesNotThrow(() => assertDatabaseConfigured({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" }));
});
