import { expect, test } from "@playwright/test";
import { formatEstimatedPrice } from "../lib/logic/budget.ts";
import { categories, installControlledApi, reachContactStep, submitCustomer } from "./fixtures.ts";

const productJourneys = [
  { category: categories[0], concern: "Knee comfort during walking, standing or stairs", timing: "During walking or stairs", choice: "Knee Supporter", budget: "S$180–S$230" },
  { category: categories[1], concern: "Feet or lower-leg comfort after a long day", timing: "After long hours standing", choice: "Wellness Socks", budget: "S$80–S$120" },
  { category: categories[2], concern: "Resting my eyes or winding down", timing: "At bedtime or while resting", choice: "Wellness Eye Mask", budget: "Under S$80" },
];

function decodedWhatsApp(url: string) {
  const parsed = new URL(url);
  const recipient = parsed.hostname === "wa.me" ? parsed.pathname.replace(/^\//, "") : parsed.searchParams.get("phone");
  return { recipient, message: parsed.searchParams.get("text") ?? "" };
}

test("navigation, validation, images and responsive layout are sound", async ({ page }) => {
  const api = await installControlledApi(page);
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(request.url()));

  await page.goto("/");
  await expect(page.getByRole("button", { name: /Continue/ })).toBeDisabled();
  await page.getByRole("button", { name: "Knee comfort during walking, standing or stairs", exact: true }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator(".choice.selected")).toContainText("Knee comfort during walking, standing or stairs");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "During walking or stairs", exact: true }).click();
  await page.getByRole("button", { name: /Continue/ }).click();

  const productImages = page.locator(".category-choice img");
  await expect(productImages).toHaveCount(3);
  await expect.poll(() => productImages.evaluateAll((images) => images.map((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toEqual([true, true, true]);
  expect(await productImages.evaluateAll((images) => images.map((image) => ({ complete: (image as HTMLImageElement).complete, width: (image as HTMLImageElement).naturalWidth, alt: image.getAttribute("alt") })))).toEqual([
    expect.objectContaining({ complete: true, width: expect.any(Number), alt: "Black knee supporter worn on the lower leg" }),
    expect.objectContaining({ complete: true, width: expect.any(Number), alt: "Black wellness socks worn by a seated model" }),
    expect.objectContaining({ complete: true, width: expect.any(Number), alt: "Beige wellness eye mask" }),
  ]);
  for (const image of await productImages.evaluateAll((images) => images.map((item) => (item as HTMLImageElement).naturalWidth))) expect(image).toBeGreaterThan(0);

  await page.getByRole("button").filter({ hasText: "Help me choose" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Under S$80", exact: true }).click();
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByRole("textbox", { name: "Your name" }).fill("Validation QA");
  await page.getByRole("textbox", { name: "WhatsApp number" }).fill("123");
  await expect(page.getByText(/Use an 8-digit Singapore mobile number/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Get My Custom Match/ })).toBeDisabled();
  await page.getByRole("textbox", { name: "WhatsApp number" }).fill("81234567");
  await expect(page.getByRole("button", { name: /Get My Custom Match/ })).toBeEnabled();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("textbox", { name: "Your name" })).toHaveValue("Validation QA");
  await expect(page.getByRole("textbox", { name: "WhatsApp number" })).toHaveValue("81234567");

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(api.assessmentRequestCount()).toBe(0);
  expect(api.fittingRequestCount()).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

for (const journey of productJourneys) {
  test(`${journey.category.name} completes, cancels fitting, then saves and auto-opens once`, async ({ page, context }) => {
    const api = await installControlledApi(page, { fittingDelayMs: 350 });
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    await page.goto("/");
    await reachContactStep(page, { concern: journey.concern, timing: journey.timing, category: journey.choice, budget: journey.budget });
    await submitCustomer(page, `${journey.category.name} QA`, "81234567");
    await expect(page.getByRole("heading", { name: journey.category.name })).toBeVisible();
    await expect(page.locator(".price-summary strong")).toHaveText(formatEstimatedPrice(journey.category));
    expect(api.assessmentRequestCount()).toBe(1);
    expect(api.assessmentBodies[0]).toMatchObject({ customerName: `${journey.category.name} QA`, whatsappNumber: "81234567", comfortConcern: journey.concern, whenAffected: journey.timing, budgetRange: journey.budget });

    const helpHref = await page.getByRole("link", { name: /Continue on WhatsApp/ }).getAttribute("href");
    expect(decodedWhatsApp(helpHref ?? "")).toMatchObject({ recipient: "6580208895" });
    expect(decodedWhatsApp(helpHref ?? "").message).not.toMatch(/private fitting|81234567|6581234567/i);

    await page.getByRole("button", { name: "Request a private fitting", exact: true }).click();
    await page.getByRole("textbox", { name: "Preferred date" }).fill("2026-08-24");
    await page.getByRole("combobox", { name: "Preferred time" }).selectOption("17:00");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Preferred date" })).toHaveCount(0);
    expect(api.fittingRequestCount()).toBe(0);

    await page.getByRole("button", { name: "Request a private fitting", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Preferred date" })).toHaveValue("");
    await page.getByRole("textbox", { name: "Preferred date" }).fill("2026-08-24");
    await page.getByRole("combobox", { name: "Preferred time" }).selectOption("17:00");
    const popupPromise = context.waitForEvent("page");
    await page.getByRole("button", { name: "Save fitting request", exact: true }).click();
    await expect(page.getByRole("button", { name: "Saving…", exact: true })).toBeDisabled();
    const popup = await popupPromise;
    await expect(page.getByRole("status")).toContainText("Fitting request saved.");
    expect(api.fittingRequestCount()).toBe(1);
    expect(api.fittingBodies).toEqual([{ preferredTime: "2026-08-24T17:00" }]);
    await popup.waitForURL(/whatsapp\.com|wa\.me/, { timeout: 20_000, waitUntil: "domcontentloaded" });
    const fittingDraft = decodedWhatsApp(popup.url());
    expect(fittingDraft.recipient).toBe("6580208895");
    expect(fittingDraft.message).toContain(`Name: ${journey.category.name} QA`);
    expect(fittingDraft.message).toContain("WhatsApp: +65 81234567");
    expect(fittingDraft.message).toContain("Preferred date and time: 24 Aug 2026 at 5:00 PM");
    await expect(page.getByRole("link", { name: "Open fitting request in WhatsApp" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Request a private fitting", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: journey.category.name })).toBeVisible();
    await popup.close();

    await page.getByRole("button", { name: "Start another assessment", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Which area would you like more everyday comfort with?" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}

test("fully undecided result uses the popup-blocked fallback and refresh resets safely", async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
  const api = await installControlledApi(page);
  await page.goto("/");
  await reachContactStep(page, { concern: "Not sure yet", timing: "It varies", category: "Help me choose", budget: "Flexible / not sure" });
  await submitCustomer(page, "Fallback QA", "91234567");
  await expect(page.getByRole("heading", { name: "Let’s narrow it down together" })).toBeVisible();
  await expect(page.locator(".price-summary, .match-teaser, .match-note")).toHaveCount(0);

  const help = decodedWhatsApp(await page.getByRole("link", { name: /Help me choose on WhatsApp/ }).getAttribute("href") ?? "");
  expect(help.recipient).toBe("6580208895");
  expect(help.message).not.toMatch(/private fitting|91234567|6591234567/i);

  await page.getByRole("button", { name: "Request a private fitting", exact: true }).click();
  await page.getByRole("textbox", { name: "Preferred date" }).fill("2026-08-24");
  await page.getByRole("combobox", { name: "Preferred time" }).selectOption("17:30");
  await page.getByRole("button", { name: "Save fitting request", exact: true }).click();
  const fallback = page.getByRole("link", { name: "Open fitting request in WhatsApp", exact: false });
  await expect(fallback).toBeVisible();
  const fitting = decodedWhatsApp(await fallback.getAttribute("href") ?? "");
  expect(fitting.recipient).toBe("6580208895");
  expect(fitting.message).toContain("Name: Fallback QA");
  expect(fitting.message).toContain("WhatsApp: +65 91234567");
  expect(fitting.message).toContain("Preferred date and time: 24 Aug 2026 at 5:30 PM");
  await expect(page.getByText("Request a private fitting", { exact: true })).toHaveCount(0);
  expect(api.fittingRequestCount()).toBe(1);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Which area would you like more everyday comfort with?" })).toBeVisible();
});

test("assessment and fitting failures recover without duplicate requests or stale popups", async ({ page, context }) => {
  const api = await installControlledApi(page, { assessmentFailures: 1, fittingFailures: 1 });
  await page.goto("/");
  await reachContactStep(page, { concern: "Feet or lower-leg comfort after a long day", timing: "After a long day", category: "Wellness Socks", budget: "S$80–S$120" });
  await submitCustomer(page, "Recovery QA", "81234567");
  await expect(page.locator(".error-banner[role='alert']")).toContainText("Controlled assessment failure.");
  expect(api.assessmentRequestCount()).toBe(1);
  await page.getByRole("button", { name: /Get My Custom Match/ }).click();
  await expect(page.getByRole("heading", { name: "Wellness Socks" })).toBeVisible();
  expect(api.assessmentRequestCount()).toBe(2);

  await page.getByRole("button", { name: "Request a private fitting", exact: true }).click();
  await page.getByRole("textbox", { name: "Preferred date" }).fill("2026-08-24");
  await page.getByRole("combobox", { name: "Preferred time" }).selectOption("18:00");
  const failedPopupPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "Save fitting request", exact: true }).click();
  const failedPopup = await failedPopupPromise;
  await expect(page.locator(".error-banner[role='alert']")).toContainText("Controlled fitting failure.");
  await expect.poll(() => failedPopup.isClosed()).toBe(true);
  expect(api.fittingRequestCount()).toBe(1);

  const retryPopupPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "Save fitting request", exact: true }).click();
  const retryPopup = await retryPopupPromise;
  await expect(page.getByRole("status")).toContainText("Fitting request saved.");
  expect(api.fittingRequestCount()).toBe(2);
  await retryPopup.close();
});

test("protected admin and login pages render without exposing the public admin link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Admin", exact: true })).toHaveCount(0);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin|\/login\?next=\/admin/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});
