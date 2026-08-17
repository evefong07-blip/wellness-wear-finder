import { AdminTable } from "@/components/AdminTable";
import { getAssessments } from "@/lib/data/assessments";
import type { AssessmentRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let assessments: AssessmentRow[] = [];
  let error = "";
  try {
    assessments = await getAssessments();
  } catch (reason) {
    error = reason instanceof Error ? reason.message : "Could not load assessments.";
  }

  return <main className="admin-main">
    <div className="admin-heading"><div><p className="eyebrow">Distributor workspace</p><h1>Assessment inbox</h1><p>Every saved visitor response, suggestion and requested next step in one place.</p></div><div className="admin-stat"><strong>{assessments.length}</strong><span>Recent assessments</span></div></div>
    {error ? <div className="error-banner admin-error" role="alert"><strong>Unable to load assessments.</strong><br />{error}</div> : <AdminTable assessments={assessments} />}
  </main>;
}
