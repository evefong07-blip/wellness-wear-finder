import test from "node:test";
import assert from "node:assert/strict";
import { matchCategory, parseBudget } from "../lib/logic/categoryMatcher.ts";
import { describeBudgetFit, formatEstimatedPrice, getBudgetFit } from "../lib/logic/budget.ts";
import { buildFittingWhatsAppUrl, buildWhatsAppUrl, normalizeSingaporeNumber } from "../lib/logic/whatsapp.ts";
import type { ProductCategory } from "../lib/types.ts";

const categories: ProductCategory[] = [
  { id: "knee", name: "Knee Supporter", description: "Support", match_keywords: ["knee", "walking", "stairs"], budget_min: 200, budget_max: 220 },
  { id: "socks", name: "Wellness Socks", description: "Foot comfort", match_keywords: ["feet", "foot", "lower-leg", "standing", "long day"], budget_min: 95, budget_max: 120 },
  { id: "eyes", name: "Wellness Eye Mask", description: "Rest", match_keywords: ["eye", "rest", "bedtime"], budget_min: 70, budget_max: 80 },
];

test("parses every offered budget band", () => {
  assert.deepEqual(parseBudget("Under S$80"), [0, 80]);
  assert.deepEqual(parseBudget("S$80–S$120"), [80, 120]);
  assert.deepEqual(parseBudget("S$120–S$180"), [120, 180]);
  assert.deepEqual(parseBudget("S$180–S$230"), [180, 230]);
  assert.deepEqual(parseBudget("Flexible / not sure"), [0, Number.POSITIVE_INFINITY]);
});

test("main need and routine keep a knee recommendation above a low budget", () => {
  const result = matchCategory(categories, { concern: "Knee comfort during walking, standing or stairs", timing: "During walking or stairs", budget: "S$80–S$120", preferredCategoryId: null });
  assert.equal(result.category.name, "Knee Supporter");
  assert.equal(result.score, 24);
  assert.equal(result.reviewStatus, "unreviewed");
});

test("main need outranks a conflicting product preference and budget", () => {
  const knee = matchCategory(categories, { concern: "Knee comfort during walking, standing or stairs", timing: "During walking or stairs", budget: "S$80–S$120", preferredCategoryId: "socks" });
  const eyes = matchCategory(categories, { concern: "Resting my eyes or winding down", timing: "During walking or stairs", budget: "S$180–S$230", preferredCategoryId: "knee" });
  assert.equal(knee.category.name, "Knee Supporter");
  assert.equal(eyes.category.name, "Wellness Eye Mask");
});

test("routine outranks preference when the visitor is not sure about the need", () => {
  const result = matchCategory(categories, { concern: "Not sure yet", timing: "At bedtime or while resting", budget: "S$80–S$120", preferredCategoryId: "socks" });
  assert.equal(result.category.name, "Wellness Eye Mask");
});

test("explicit preference guides a genuinely ambiguous answer", () => {
  const result = matchCategory(categories, { concern: "Not sure yet", timing: "It varies", budget: "Under S$80", preferredCategoryId: "knee" });
  assert.equal(result.category.name, "Knee Supporter");
});

test("Help me choose uses budget only as a final fallback", () => {
  const result = matchCategory(categories, { concern: "Not sure yet", timing: "It varies", budget: "Under S$80", preferredCategoryId: null });
  assert.equal(result.category.name, "Wellness Eye Mask");
});

test("flexible and fully ambiguous answers are marked for review", () => {
  const result = matchCategory(categories, { concern: "Not sure yet", timing: "It varies", budget: "Flexible / not sure", preferredCategoryId: null });
  assert.equal(result.confidence, 0.4);
  assert.equal(result.reviewStatus, "needs-review");
});

test("matches the feet and eye-rest journeys to the correct products", () => {
  const socks = matchCategory(categories, { concern: "Feet or lower-leg comfort", timing: "After long hours standing", budget: "S$80–S$120", preferredCategoryId: null });
  const eyes = matchCategory(categories, { concern: "Resting my eyes", timing: "At bedtime or while resting", budget: "Under S$80", preferredCategoryId: null });
  assert.equal(socks.category.name, "Wellness Socks");
  assert.equal(eyes.category.name, "Wellness Eye Mask");
});

test("uses the correct catalogue prices and precise budget comparisons", () => {
  assert.equal(formatEstimatedPrice(categories[0]), "Estimated price range: S$200–S$220");
  assert.equal(formatEstimatedPrice(categories[1]), "Estimated price range: S$95–S$120");
  assert.equal(formatEstimatedPrice(categories[2]), "Estimated price range: S$70–S$80");
  assert.equal(getBudgetFit(categories[0], "S$180–S$230"), "fits");
  assert.equal(getBudgetFit(categories[1], "S$80–S$120"), "fits");
  assert.equal(getBudgetFit(categories[1], "S$120–S$180"), "overlaps");
  assert.equal(getBudgetFit(categories[2], "Under S$80"), "fits");
  assert.equal(getBudgetFit(categories[0], "S$80–S$120"), "outside");
});

test("explains above, below, overlap and fit without false alignment language", () => {
  const above = describeBudgetFit(categories[0], "S$80–S$120");
  const below = describeBudgetFit(categories[2], "S$180–S$230", true);
  assert.equal(above, "This Knee Supporter recommendation is typically S$200–S$220, which is above your preferred budget. Evelyn can discuss alternatives or help you decide whether it is suitable.");
  assert.equal(below, "Your selected product is typically S$70–S$80, which is below your preferred budget. Evelyn can discuss alternatives or help you decide whether it is suitable.");
  assert.match(describeBudgetFit(categories[1], "S$120–S$180"), /overlaps/);
  assert.match(describeBudgetFit(categories[1], "S$80–S$120"), /fits within/);
  for (const message of [above, below]) assert.doesNotMatch(message, /aligned/i);
});

test("routes a natural product-result message to the distributor without the visitor number", () => {
  assert.equal(normalizeSingaporeNumber("8123 4567"), "6581234567");
  const url = buildWhatsAppUrl({ customerName: "Sarah Tan", whatsappNumber: "81234567", comfortConcern: "Knee comfort", whenAffected: "Walking", budgetRange: "S$80–S$120", preferredCategoryId: null }, categories[0]);
  const parsed = new URL(url);
  const message = parsed.searchParams.get("text") ?? "";
  assert.match(url, /^https:\/\/wa\.me\/6580208895\?text=/);
  assert.doesNotMatch(url, /^https:\/\/wa\.me\/6581234567\?text=/);
  assert.match(message, /Comfort need: Knee comfort/);
  assert.match(message, /Routine: Walking/);
  assert.match(message, /Budget: S\$80–S\$120/);
  assert.match(message, /Suggested option: Knee Supporter/);
  assert.match(message, /S\$200–S\$220/);
  assert.doesNotMatch(message, /Sarah Tan|81234567|6581234567|private fitting|learn more\.Hi/i);
});

test("builds a separate fitting-only message after a time is selected", () => {
  const parsed = new URL(buildFittingWhatsAppUrl("Sarah Tan", "81234567", "2026-08-24T14:00"));
  const message = parsed.searchParams.get("text") ?? "";
  assert.equal(message, "Hi, I completed the Wellness Wear Finder assessment and would like to request a private fitting.\n\nName: Sarah Tan\nWhatsApp: +65 81234567\nPreferred date and time: 24 Aug 2026 at 2:00 PM\n\nPlease let me know if this time is available.");
  assert.equal(parsed.pathname, "/6580208895");
  assert.doesNotMatch(message, /Comfort need:|Routine:|Budget:|Suggested option:/i);
  assert.match(new URL(buildFittingWhatsAppUrl("Sarah Tan", "+65 8123 4567", "2026-08-24T14:00")).searchParams.get("text") ?? "", /WhatsApp: \+65 81234567/);
});
