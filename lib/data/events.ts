import { createClient } from "@/lib/supabase/server";

export type AssessmentEvent = "assessment_started" | "assessment_completed" | "suggestion_shown" | "whatsapp_clicked" | "fitting_requested";

export async function trackEvent(eventType: AssessmentEvent, assessmentId?: string, metadata: Record<string, unknown> = {}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  const supabase = await createClient();
  const { error } = await supabase.from("assessment_events").insert({ assessment_id: assessmentId ?? null, event_type: eventType, metadata });
  if (error) throw new Error(error.message);
}
