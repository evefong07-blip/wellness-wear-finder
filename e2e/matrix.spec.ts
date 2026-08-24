import { expect, test } from "@playwright/test";
import { describeBudgetFit, formatEstimatedPrice } from "../lib/logic/budget.ts";
import { matchCategory } from "../lib/logic/categoryMatcher.ts";
import { advance, budgets, categories, categoryChoices, categoryId, chooseButton, concerns, timings } from "./fixtures.ts";

test("every answer combination produces one internally consistent preview", async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`));

  await page.route(/\/api\/events$/, async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tracked: true }) }));
  await page.goto("/");

  let combinations = 0;
  for (const concern of concerns) {
    await chooseButton(page, concern);
    await advance(page);
    for (const timing of timings) {
      await chooseButton(page, timing);
      await advance(page);
      for (const categoryChoice of categoryChoices) {
        await chooseButton(page, categoryChoice);
        await advance(page);
        for (const budget of budgets) {
          combinations += 1;
          await chooseButton(page, budget);
          await advance(page);

          const fullyUndecided = concern === "Not sure yet" && timing === "It varies" && categoryChoice === "Help me choose" && budget === "Flexible / not sure";
          if (fullyUndecided) {
            await expect(page.getByRole("heading", { name: "Let’s narrow it down together" })).toBeVisible();
            await expect(page.getByText(/Your likely match/i)).toHaveCount(0);
            await expect(page.getByText(/Knee Supporter|Wellness Socks|Wellness Eye Mask/)).toHaveCount(0);
            await expect(page.locator(".match-teaser, .budget-guidance")).toHaveCount(0);
          } else {
            const expected = matchCategory(categories, { concern, timing, budget, preferredCategoryId: categoryId(categoryChoice) });
            await expect(page.locator(".match-teaser strong")).toHaveText(expected.category.name);
            await expect(page.locator(".match-teaser small")).toHaveText(formatEstimatedPrice(expected.category));
            await expect(page.locator(".budget-guidance")).toHaveText(describeBudgetFit(expected.category, budget, expected.category.name === categoryChoice));
            await expect(page.locator(".match-teaser img")).toHaveCount(1);
          }

          await page.getByRole("button", { name: "Back", exact: true }).click();
        }
        await page.getByRole("button", { name: "Back", exact: true }).click();
      }
      await page.getByRole("button", { name: "Back", exact: true }).click();
    }
    await page.getByRole("button", { name: "Back", exact: true }).click();
  }

  expect(combinations).toBe(400);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
