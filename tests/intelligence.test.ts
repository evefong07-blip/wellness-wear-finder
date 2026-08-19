import test from "node:test";
import assert from "node:assert/strict";
import { scoreLead, structureAssessment } from "../lib/logic/intelligence.ts";
import { buildDashboardStats } from "../lib/logic/dashboard.ts";
import type { AssessmentInput, AssessmentRow, ProductCategory } from "../lib/types.ts";

const input: AssessmentInput = { customerName: "Sarah", whatsappNumber: "81234567", comfortConcern: "Posture and back support", whenAffected: "All day at work", budgetRange: "$50-$100", preferredCategoryId: "support" };
const category: ProductCategory = { id: "support", name: "Everyday Support Wear", description: "Support", match_keywords: ["posture"], budget_min: 50, budget_max: 120 };

test("structures messy assessment answers without AI", () => {
  const result = structureAssessment(input, category);
  assert.equal(result.parsedConcern, "posture_support");
  assert.equal(result.parsedTiming, "all_day");
  assert.deepEqual([result.parsedBudgetMin, result.parsedBudgetMax], [50, 100]);
  assert.match(result.recommendationCopy, /Everyday Support Wear/);
});

test("lead score rewards specific, high-confidence intent", () => {
  const result = scoreLead(input, 0.8);
  assert.equal(result.score, 100);
  assert.ok(result.reasons.includes("Strong category match"));
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
