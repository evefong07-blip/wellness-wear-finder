import { NextResponse } from "next/server";
import { requestFitting } from "@/lib/data/assessments";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { preferredTime } = (await request.json()) as { preferredTime?: string };
    if (!preferredTime?.trim()) return NextResponse.json({ error: "Choose a preferred fitting time." }, { status: 400 });
    await requestFitting(id, preferredTime.trim());
    return NextResponse.json({ saved: true });
  } catch (reason) {
    return NextResponse.json({ error: reason instanceof Error ? reason.message : "Could not save fitting request." }, { status: 500 });
  }
}
