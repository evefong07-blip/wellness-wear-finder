import { NextResponse } from "next/server";
import { trackEvent, type AssessmentEvent } from "@/lib/data/events";

const allowed = new Set<AssessmentEvent>(["assessment_started", "whatsapp_clicked"]);

export async function POST(request: Request) {
  try {
    const { eventType, assessmentId } = await request.json() as { eventType: AssessmentEvent; assessmentId?: string };
    if (!allowed.has(eventType)) return NextResponse.json({ error: "Unsupported event." }, { status: 400 });
    await trackEvent(eventType, assessmentId);
    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ error: "Could not track event." }, { status: 500 });
  }
}
