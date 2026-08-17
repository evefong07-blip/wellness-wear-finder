import { NextResponse } from "next/server";
import { processAssessment } from "@/lib/services/assessment";
import type { AssessmentInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AssessmentInput;
    const result = await processAssessment(input);
    return NextResponse.json(result, { status: 201 });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Could not complete assessment.";
    const clientError = /Please|Enter a valid|complete every/.test(message);
    return NextResponse.json({ error: message }, { status: clientError ? 400 : 500 });
  }
}
