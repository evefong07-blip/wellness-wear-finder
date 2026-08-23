import type { AssessmentInput, ProductCategory } from "../types.ts";
import { formatPriceAmount } from "./budget.ts";

export const DISTRIBUTOR_WHATSAPP_NUMBER = "80208895";

export function normalizeSingaporeNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("65") ? digits : `65${digits}`;
}

export function buildWhatsAppUrl(
  assessment: AssessmentInput,
  category: ProductCategory,
): string {
  const message = [
    `Hi, I'm ${assessment.customerName}. I just completed the Wellness Wear Finder assessment.`,
    `My WhatsApp number: ${normalizeSingaporeNumber(assessment.whatsappNumber)}.`,
    `My main concern: ${assessment.comfortConcern}.`,
    `When it affects me: ${assessment.whenAffected}.`,
    `Budget: ${assessment.budgetRange}.`,
    `Suggestion: ${category.name}.`,
    `Estimated catalogue price: ${formatPriceAmount(category)}.`,
    "Requested next step: WhatsApp follow-up.",
    "I'd like to learn more.",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}

export function buildUndecidedWhatsAppUrl(assessment: AssessmentInput): string {
  const message = [
    `Hi, I'm ${assessment.customerName}. I completed the Wellness Wear Finder assessment.`,
    `My WhatsApp number: ${normalizeSingaporeNumber(assessment.whatsappNumber)}.`,
    `Main comfort need: ${assessment.comfortConcern}.`,
    `Routine or timing: ${assessment.whenAffected}.`,
    `Budget: ${assessment.budgetRange}.`,
    "I'm still unsure which product category fits me and would like help narrowing down the most suitable starting point.",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}

export function addFittingRequestToWhatsAppUrl(url: string, preferredTime: string): string {
  const parsed = new URL(url);
  const message = parsed.searchParams.get("text") ?? "";
  const fittingLine = `Private fitting requested: ${preferredTime.replace("T", " at ")}.`;
  parsed.searchParams.set("text", `${message}\n${fittingLine}`);
  return parsed.toString();
}
