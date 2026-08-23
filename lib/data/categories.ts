import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/types";

export async function getCategories(): Promise<ProductCategory[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Database configuration is missing. The assessment is temporarily unavailable.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("id,name,description,match_keywords,budget_min,budget_max")
    .order("created_at");

  if (error) throw new Error(`Could not load categories: ${error.message}`);
  if (!data?.length) throw new Error("No product categories are available. Please try again later.");
  return data.map((category: ProductCategory) => ({
    ...category,
    budget_min: category.budget_min === null ? null : Number(category.budget_min),
    budget_max: category.budget_max === null ? null : Number(category.budget_max),
  }));
}
