import type { AssessmentInput, AssessmentResult } from "../types.ts";

async function responseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => ({})) as { error?: string };
  return new Error(body.error || fallback);
}

export async function submitAssessmentRequest(input: AssessmentInput): Promise<AssessmentResult> {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await responseError(response, "Could not complete assessment.");
  return response.json() as Promise<AssessmentResult>;
}

export async function submitFittingRequest(assessmentId: string, preferredTime: string): Promise<void> {
  const response = await fetch(`/api/assessments/${encodeURIComponent(assessmentId)}/fitting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferredTime }),
  });
  if (!response.ok) throw await responseError(response, "Could not save your fitting request.");
}
