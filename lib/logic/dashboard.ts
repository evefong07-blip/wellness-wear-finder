import type { AssessmentRow } from "../types.ts";

export type DashboardStats = {
  total: number;
  fittingRequests: number;
  highIntent: number;
  averageScore: number;
  categories: { label: string; value: number }[];
  daily: { label: string; value: number }[];
};

export function buildDashboardStats(rows: AssessmentRow[], now = new Date()): DashboardStats {
  const categoryCounts = new Map<string, number>();
  rows.forEach((row) => categoryCounts.set(row.suggestedCategory, (categoryCounts.get(row.suggestedCategory) ?? 0) + 1));
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      label: new Intl.DateTimeFormat("en-SG", { weekday: "short" }).format(day),
      value: rows.filter((row) => new Date(row.createdAt).toISOString().slice(0, 10) === key).length,
    };
  });
  return {
    total: rows.length,
    fittingRequests: rows.filter((row) => row.preferredNextStep === "fitting").length,
    highIntent: rows.filter((row) => row.leadScore >= 70).length,
    averageScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.leadScore, 0) / rows.length) : 0,
    categories: [...categoryCounts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    daily,
  };
}
