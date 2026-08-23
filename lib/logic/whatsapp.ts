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
    "Hi, I completed the Wellness Wear Finder assessment and would like to learn more about my result.",
    "",
    "My answers:",
    `Comfort need: ${assessment.comfortConcern}`,
    `Routine: ${assessment.whenAffected}`,
    `Budget: ${assessment.budgetRange}`,
    "",
    `Suggested option: ${category.name}`,
    `Estimated catalogue price: ${formatPriceAmount(category)}`,
    "",
    "Could you tell me more about this option?",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}

export function buildUndecidedWhatsAppUrl(assessment: AssessmentInput): string {
  const message = [
    "Hi, I completed the Wellness Wear Finder assessment, but I’m still unsure which option suits me.",
    "",
    "My answers:",
    `Comfort need: ${assessment.comfortConcern}`,
    `Routine: ${assessment.whenAffected}`,
    `Budget: ${assessment.budgetRange}`,
    "",
    "Could you help me find a suitable starting point?",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}

function formatFittingDateTime(preferredTime: string): string {
  const [date, time] = preferredTime.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  const hour = hours % 12 || 12;
  const period = hours >= 12 ? "PM" : "AM";
  return `${day} ${monthName} ${year} at ${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function buildFittingWhatsAppUrl(preferredTime: string): string {
  const message = [
    "Hi, I completed the Wellness Wear Finder assessment and would like to request a private fitting.",
    "",
    `Preferred date and time: ${formatFittingDateTime(preferredTime)}`,
    "",
    "Please let me know if this time is available.",
  ].join("\n");

  return `https://wa.me/${normalizeSingaporeNumber(DISTRIBUTOR_WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}
