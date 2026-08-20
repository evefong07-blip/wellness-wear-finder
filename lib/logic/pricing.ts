import { getBudgetFit, type BudgetFit } from "./categoryMatcher.ts";
import type { ProductCategory } from "../types.ts";

export type PriceGuidance = {
  cataloguePrice: string;
  fit: BudgetFit;
  explanation: string;
};

export function formatCataloguePrice(category: ProductCategory): string {
  if (category.budget_min === null) return "Price confirmed during your private chat";
  if (category.budget_max === null || category.budget_max === category.budget_min) {
    return `Typical catalogue price: S$${category.budget_min}`;
  }
  return `Typical catalogue range: S$${category.budget_min}–S$${category.budget_max}`;
}

export function getPriceGuidance(category: ProductCategory, selectedBudget: string): PriceGuidance {
  const cataloguePrice = formatCataloguePrice(category);
  const fit = getBudgetFit(category, selectedBudget);

  if (fit === "within") {
    return { cataloguePrice, fit, explanation: `This catalogue price is within your selected budget (${selectedBudget}).` };
  }
  if (fit === "flexible") {
    return { cataloguePrice, fit, explanation: "You selected a flexible budget, so we used your comfort needs and routine to find the closest match." };
  }
  if (fit === "unknown") {
    return { cataloguePrice, fit, explanation: "The final price needs to be confirmed with the distributor before you decide." };
  }
  return {
    cataloguePrice,
    fit,
    explanation: `Budget mismatch: this category’s catalogue price is outside your selected budget (${selectedBudget}). We’re showing it because your comfort needs or category preference were the stronger match; the distributor can help you compare alternatives before you decide.`,
  };
}
