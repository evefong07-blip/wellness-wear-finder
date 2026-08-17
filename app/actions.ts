"use server";

import { requestFitting } from "@/lib/data/assessments";
import { processAssessment } from "@/lib/services/assessment";
import type { AssessmentInput, AssessmentResult } from "@/lib/types";

export async function submitAssessment(input: AssessmentInput): Promise<AssessmentResult> {
  return processAssessment(input);
}

export async function submitFittingRequest(assessmentId: string, preferredTime: string) {
  if (!assessmentId || !preferredTime.trim()) throw new Error("Choose a preferred fitting time.");
  await requestFitting(assessmentId, preferredTime.trim());
  return { saved: true };
}
