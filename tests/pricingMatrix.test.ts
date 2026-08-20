import test from "node:test";
import assert from "node:assert/strict";
import { matchCategory } from "../lib/logic/categoryMatcher.ts";
import { getPriceGuidance } from "../lib/logic/pricing.ts";
import type { ProductCategory } from "../lib/types.ts";

const categories: ProductCategory[] = [
  { id: "knee", name: "Knee Supporter", description: "Support", match_keywords: ["knee", "walking", "stairs"], budget_min: 165, budget_max: 165 },
  { id: "socks", name: "Wellness Socks", description: "Foot comfort", match_keywords: ["feet", "standing", "long day"], budget_min: 70, budget_max: 115 },
  { id: "eyes", name: "Wellness Eye Mask", description: "Rest", match_keywords: ["eye", "rest", "bedtime"], budget_min: 65, budget_max: 70 },
];

const budgets = ["S$65-S$70", "S$70-S$115", "About S$165", "I’m flexible / not sure"];
const scenarios = [
  { id: "knee", concern: "Knee comfort during walking, standing or stairs", timing: "During walking or stairs" },
  { id: "socks", concern: "Feet or lower-leg comfort after a long day", timing: "After long hours standing" },
  { id: "eyes", concern: "Resting my eyes or winding down", timing: "At bedtime or while resting" },
];

const expectedFit: Record<string, Array<"within" | "outside" | "partial" | "flexible">> = {
  knee: ["outside", "outside", "within", "flexible"],
  socks: ["partial", "within", "outside", "flexible"],
  eyes: ["within", "partial", "outside", "flexible"],
};

test("checks every direct category × budget combination", () => {
  for (const scenario of scenarios) {
    for (const [budgetIndex, budget] of budgets.entries()) {
      const result = matchCategory(categories, { ...scenario, budget, preferredCategoryId: scenario.id });
      const guidance = getPriceGuidance(result.category, budget);
      assert.equal(result.category.id, scenario.id, `${scenario.id} should remain selected for ${budget}`);
      assert.equal(guidance.fit, expectedFit[scenario.id][budgetIndex]);
      if (guidance.fit === "outside" || guidance.fit === "partial") {
        assert.match(guidance.explanation, /Budget mismatch:.*outside your selected budget/);
      } else {
        assert.doesNotMatch(guidance.explanation, /Budget mismatch/);
      }
    }
  }
});

test("Help me choose stays internally consistent for every concern × budget", () => {
  for (const scenario of scenarios) {
    for (const budget of budgets) {
      const result = matchCategory(categories, { ...scenario, budget, preferredCategoryId: null });
      const guidance = getPriceGuidance(result.category, budget);
      assert.ok(guidance.cataloguePrice.includes("S$"));
      if (guidance.fit === "outside" || guidance.fit === "partial") {
        assert.match(guidance.explanation, /Budget mismatch/);
      }
    }
  }
});

test("Not sure yet + Help me choose uses the exact budget category fallback", () => {
  const expected = ["eyes", "socks", "knee", "knee"];
  for (const [index, budget] of budgets.entries()) {
    const result = matchCategory(categories, { concern: "Not sure yet", timing: "It varies", budget, preferredCategoryId: null });
    const guidance = getPriceGuidance(result.category, budget);
    assert.equal(result.category.id, expected[index]);
    assert.ok(guidance.fit === "within" || guidance.fit === "flexible");
    assert.doesNotMatch(guidance.explanation, /Budget mismatch/);
  }
});

test("catalogue price text is exact for every active category", () => {
  assert.equal(getPriceGuidance(categories[0], budgets[2]).cataloguePrice, "Typical catalogue price: S$165");
  assert.equal(getPriceGuidance(categories[1], budgets[1]).cataloguePrice, "Typical catalogue range: S$70–S$115");
  assert.equal(getPriceGuidance(categories[2], budgets[0]).cataloguePrice, "Typical catalogue range: S$65–S$70");
});
