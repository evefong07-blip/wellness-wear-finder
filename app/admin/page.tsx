import { AdminTable } from "@/components/AdminTable";
import { AdminSession } from "@/components/AdminSession";
import { getAssessments } from "@/lib/data/assessments";
import { requireAdmin } from "@/lib/auth/admin";
import { DashboardCharts } from "@/components/DashboardCharts";
import { buildDashboardStats } from "@/lib/logic/dashboard";
import type { AssessmentRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin();
  let assessments: AssessmentRow[] = [];
  let error = "";
  try {
    assessments = await getAssessments();
  } catch (reason) {
    error = reason instanceof Error ? reason.message : "Could not load assessments.";
  }

  return <main className="admin-main">
    <AdminSession email={user.email ?? "Distributor"} />
    <div className="admin-heading"><div><p className="eyebrow">Distributor workspace</p><h1>Assessment inbox</h1><p>Every saved visitor response, suggestion and requested next step in one place.</p></div><div className="admin-stat"><strong>{assessments.length}</strong><span>Recent assessments</span></div></div>
    {!error && <DashboardCharts stats={buildDashboardStats(assessments)} />}
    {error ? <div className="error-banner admin-error" role="alert"><strong>Unable to load assessments.</strong><br />{error}</div> : <AdminTable assessments={assessments} />}
  </main>;
}
