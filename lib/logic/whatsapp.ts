import type { AssessmentInput, ProductCategory } from "@/lib/types";

export const DISTRIBUTOR_WHATSAPP_NUMBER = "96324713";

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
    "I'd like to learn more.",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}
