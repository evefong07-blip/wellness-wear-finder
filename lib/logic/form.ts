export function singaporeMobileDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^65/, "");
}

export function isValidSingaporeMobile(value: string): boolean {
  return /^[689]\d{7}$/.test(singaporeMobileDigits(value));
}

export function combinePreferredDateTime(date: string, time: string): string {
  return date && time ? `${date}T${time}` : "";
}

export function singaporeDateValue(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
