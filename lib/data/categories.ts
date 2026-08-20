import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/types";

const demoCategories: ProductCategory[] = [
  {
    id: "demo-knee-supporter",
    name: "Knee Supporter",
    description: "Everyday knee comfort for walking, standing and stairs.",
    match_keywords: ["knee", "knees", "walking", "stairs", "joint", "support"],
    budget_min: 165,
    budget_max: 165,
  },
  {
    id: "demo-wellness-socks",
    name: "Wellness Socks",
    description: "Everyday foot and lower-leg comfort after a long day.",
    match_keywords: ["feet", "foot", "legs", "lower-leg", "standing", "socks", "long day"],
    budget_min: 70,
    budget_max: 115,
  },
  {
    id: "demo-wellness-eye-mask",
    name: "Wellness Eye Mask",
    description: "Quiet eye rest for travel, bedtime and winding down.",
    match_keywords: ["eye", "eyes", "sleep", "night", "rest", "bedtime", "winding down"],
    budget_min: 65,
    budget_max: 70,
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
