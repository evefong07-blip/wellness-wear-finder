import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/types";

const demoCategories: ProductCategory[] = [
  {
    id: "demo-everyday-support",
    name: "Everyday Support Wear",
    description: "Lightweight pieces designed for gentle, all-day posture support.",
    match_keywords: ["posture", "back", "support", "slouch", "spine", "all day"],
    budget_min: 50,
    budget_max: 120,
  },
  {
    id: "demo-comfort-bottoms",
    name: "Comfort Bottoms",
    description: "Soft, flexible-waist bottoms for everyday ease and movement.",
    match_keywords: ["legs", "tight", "waist", "hips", "movement"],
    budget_min: 40,
    budget_max: 90,
  },
  {
    id: "demo-sleep-relax",
    name: "Sleep & Relax Wear",
    description: "Breathable, relaxed pieces for winding down and resting comfortably.",
    match_keywords: ["sleep", "night", "rest", "relax", "recover"],
    budget_min: 45,
    budget_max: 100,
  },
  {
    id: "demo-active-recovery",
    name: "Active Recovery Wear",
    description: "Supportive pieces for tired muscles after exercise or a long day.",
    match_keywords: ["sore", "tired", "muscle", "recovery", "after work", "exercise"],
    budget_min: 60,
    budget_max: 150,
  },
];

export async function getCategories(): Promise<ProductCategory[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return demoCategories;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("id,name,description,match_keywords,budget_min,budget_max")
    .order("created_at");

  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return (data ?? []).map((category) => ({
    ...category,
    budget_min: category.budget_min === null ? null : Number(category.budget_min),
    budget_max: category.budget_max === null ? null : Number(category.budget_max),
  }));
}
