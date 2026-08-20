import type { AssessmentInput, ProductCategory } from "@/lib/types";
import type { StructuredAssessment } from "@/lib/logic/intelligence";

type AiSuggestion = StructuredAssessment & {
  suggestedCategoryId: string;
  confidence: number;
};

export async function getAiSuggestion(
  input: AssessmentInput,
  categories: ProductCategory[],
): Promise<AiSuggestion | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const categoryIds = categories.map((category) => category.id);
  const categoryContext = categories.map(({ id, name, description }) => ({ id, name, description }));
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input: [
          { role: "system", content: "You structure wellness clothing preferences. Do not diagnose, make health claims, or promise outcomes. Select only from the supplied categories and write one concise, practical recommendation." },
          { role: "user", content: JSON.stringify({ assessment: input, categories: categoryContext }) },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "wellness_wear_suggestion",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                parsedConcern: { type: "string", enum: ["knee_comfort", "foot_leg_comfort", "eye_rest", "general_comfort"] },
                parsedTiming: { type: "string", enum: ["during_movement", "after_standing", "after_day", "rest_time", "variable"] },
                parsedBudgetMin: { type: "number" },
                parsedBudgetMax: { type: "number" },
                suggestedCategoryId: { type: "string", enum: categoryIds },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                recommendationCopy: { type: "string", maxLength: 360 },
              },
              required: ["parsedConcern", "parsedTiming", "parsedBudgetMin", "parsedBudgetMax", "suggestedCategoryId", "confidence", "recommendationCopy"],
            },
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const text = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    if (!text) return null;
    const suggestion = JSON.parse(text) as AiSuggestion;
    return categoryIds.includes(suggestion.suggestedCategoryId) ? suggestion : null;
  } catch {
    return null;
  }
}
