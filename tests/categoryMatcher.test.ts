import test from "node:test";
import assert from "node:assert/strict";
import { matchCategory, parseBudget } from "../lib/logic/categoryMatcher.ts";
import { buildWhatsAppUrl, normalizeSingaporeNumber } from "../lib/logic/whatsapp.ts";
import type { ProductCategory } from "../lib/types.ts";

const categories: ProductCategory[] = [
  { id: "knee", name: "Knee Supporter", description: "Support", match_keywords: ["knee", "walking", "stairs"], budget_min: 165, budget_max: 165 },
  { id: "socks", name: "Wellness Socks", description: "Foot comfort", match_keywords: ["feet", "standing", "long day"], budget_min: 70, budget_max: 115 },
  { id: "eyes", name: "Wellness Eye Mask", description: "Rest", match_keywords: ["eye", "rest", "bedtime"], budget_min: 65, budget_max: 70 },
];

test("parses common budget ranges", () => {
  assert.deepEqual(parseBudget("$50-$100"), [50, 100]);
  assert.deepEqual(parseBudget("under 80"), [0, 80]);
  assert.deepEqual(parseBudget("About S$165"), [165, 165]);
});

test("ranks the success-scenario category deterministically", () => {
  const result = matchCategory(categories, {
    concern: "Knee comfort during walking, standing or stairs",
    timing: "During walking or stairs",
    budget: "About S$165",
    preferredCategoryId: null,
  });
  assert.equal(result.category.name, "Knee Supporter");
  assert.equal(result.score, 6);
  assert.equal(result.reviewStatus, "unreviewed");
});

test("marks weak ties for review", () => {
  const result = matchCategory(categories, { concern: "other", timing: "varies", budget: "I’m flexible / not sure", preferredCategoryId: null });
  assert.equal(result.confidence, 0.4);
  assert.equal(result.reviewStatus, "needs-review");
});

test("builds a Singapore WhatsApp deep link and summary", () => {
  assert.equal(normalizeSingaporeNumber("8123 4567"), "6581234567");
  const url = buildWhatsAppUrl({ customerName: "Sarah Tan", whatsappNumber: "81234567", comfortConcern: "Knee comfort", whenAffected: "Walking", budgetRange: "About S$165", preferredCategoryId: null }, categories[0]);
  assert.match(decodeURIComponent(url), /Sarah Tan/);
  assert.match(decodeURIComponent(url), /Knee Supporter/);
});

test("routes enquiries to the distributor instead of the visitor", () => {
  const url = buildWhatsAppUrl({ customerName: "Sarah Tan", whatsappNumber: "81234567", comfortConcern: "Knee comfort", whenAffected: "Walking", budgetRange: "About S$165", preferredCategoryId: null }, categories[0]);
  assert.match(url, /^https:\/\/wa\.me\/6580208895\?text=/);
  assert.doesNotMatch(url, /^https:\/\/wa\.me\/6581234567\?text=/);
  assert.match(decodeURIComponent(url), /6581234567/);
});

test("matches the concrete products to their catalogue price ranges", () => {
  const socks = matchCategory(categories, { concern: "Feet or lower-leg comfort", timing: "After long hours standing", budget: "S$70-S$115", preferredCategoryId: null });
  const eyes = matchCategory(categories, { concern: "Resting my eyes", timing: "At bedtime or while resting", budget: "S$65-S$70", preferredCategoryId: null });
  assert.equal(socks.category.name, "Wellness Socks");
  assert.equal(eyes.category.name, "Wellness Eye Mask");
});
