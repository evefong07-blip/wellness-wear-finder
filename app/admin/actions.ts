"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { markAssessmentContacted } from "@/lib/data/assessments";

export async function markContacted(formData: FormData) {
  const user = await requireAdmin();
  const assessmentId = String(formData.get("assessmentId") ?? "");
  if (!assessmentId) return;
  await markAssessmentContacted(assessmentId, user.id);
  revalidatePath("/admin");
}
