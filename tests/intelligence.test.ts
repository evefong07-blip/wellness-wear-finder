import test from "node:test";
import assert from "node:assert/strict";
import { scoreLead, structureAssessment } from "../lib/logic/intelligence.ts";
import { buildDashboardStats } from "../lib/logic/dashboard.ts";
import type { AssessmentInput, AssessmentRow, ProductCategory } from "../lib/types.ts";

const input: AssessmentInput = { customerName: "Sarah", whatsappNumber: "81234567", comfortConcern: "Knee comfort during walking", whenAffected: "During walking or stairs", budgetRange: "S$120–S$180", preferredCategoryId: "knee" };
const category: ProductCategory = { id: "knee", name: "Knee Supporter", description: "Support", match_keywords: ["knee"], budget_min: 200, budget_max: 220 };

test("structures messy assessment answers without AI", () => {
  const result = structureAssessment(input, category);
  assert.equal(result.parsedConcern, "knee_comfort");
  assert.equal(result.parsedTiming, "during_movement");
  assert.deepEqual([result.parsedBudgetMin, result.parsedBudgetMax], [120, 180]);
  assert.match(result.recommendationCopy, /Knee Supporter/);
});

test("lead score rewards specific, high-confidence intent", () => {
  const result = scoreLead(input, 0.8);
  assert.equal(result.score, 100);
  assert.ok(result.reasons.includes("Strong category match"));
  assert.ok(result.reasons.includes("Preferred budget shared"));
});

test("dashboard aggregates ranked assessment data", () => {
  const rows = [
    { suggestedCategory: "Support", preferredNextStep: "fitting", leadScore: 90, createdAt: "2026-08-18T01:00:00Z" },
    { suggestedCategory: "Support", preferredNextStep: "whatsapp", leadScore: 50, createdAt: "2026-08-17T01:00:00Z" },
  ] as AssessmentRow[];
  const stats = buildDashboardStats(rows, new Date("2026-08-18T12:00:00Z"));
  assert.equal(stats.total, 2);
  assert.equal(stats.fittingRequests, 1);
  assert.equal(stats.highIntent, 1);
  assert.equal(stats.averageScore, 70);
  assert.deepEqual(stats.categories[0], { label: "Support", value: 2 });
});
