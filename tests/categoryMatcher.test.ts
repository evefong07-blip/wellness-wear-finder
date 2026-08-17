import test from "node:test";
import assert from "node:assert/strict";
import { matchCategory, parseBudget } from "../lib/logic/categoryMatcher.ts";
import { buildWhatsAppUrl, normalizeSingaporeNumber } from "../lib/logic/whatsapp.ts";
import type { ProductCategory } from "../lib/types.ts";

const categories: ProductCategory[] = [
  { id: "support", name: "Everyday Support Wear", description: "Support", match_keywords: ["posture", "back", "all day"], budget_min: 50, budget_max: 120 },
  { id: "sleep", name: "Sleep & Relax Wear", description: "Rest", match_keywords: ["sleep", "night"], budget_min: 45, budget_max: 100 },
];

test("parses common budget ranges", () => {
  assert.deepEqual(parseBudget("$50-$100"), [50, 100]);
  assert.deepEqual(parseBudget("under 80"), [0, 80]);
});

test("ranks the success-scenario category deterministically", () => {
  const result = matchCategory(categories, {
    concern: "Posture / back support",
    timing: "All day at work",
    budget: "$50-$100",
    preferredCategoryId: null,
  });
  assert.equal(result.category.name, "Everyday Support Wear");
  assert.equal(result.score, 6);
  assert.equal(result.reviewStatus, "unreviewed");
});

test("marks weak ties for review", () => {
  const result = matchCategory(categories, { concern: "other", timing: "morning", budget: "$50-$100", preferredCategoryId: null });
  assert.equal(result.confidence, 0.4);
  assert.equal(result.reviewStatus, "needs-review");
});

test("builds the Singapore WhatsApp deep link and summary", () => {
  assert.equal(normalizeSingaporeNumber("8123 4567"), "6581234567");
  const url = buildWhatsAppUrl({ customerName: "Sarah Tan", whatsappNumber: "81234567", comfortConcern: "Posture", whenAffected: "All day", budgetRange: "$50-$100", preferredCategoryId: null }, categories[0]);
  assert.match(url, /^https:\/\/wa\.me\/6581234567\?text=/);
  assert.match(decodeURIComponent(url), /Sarah Tan/);
  assert.match(decodeURIComponent(url), /Everyday Support Wear/);
});
