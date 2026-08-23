import type { AssessmentRow } from "@/lib/types";
import { markContacted } from "@/app/admin/actions";
import Link from "next/link";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Singapore" }).format(new Date(value));
}

export function AdminTable({ assessments }: { assessments: AssessmentRow[] }) {
  if (!assessments.length) {
    return <div className="empty-state"><span>◎</span><h2>No assessments yet</h2><p>New completed assessments will appear here automatically.</p><Link className="button primary" href="/">Open assessment</Link></div>;
  }

  return (
    <div className="table-shell">
      <table>
        <thead><tr><th>Lead</th><th>Customer</th><th>Comfort need</th><th>Suggested match</th><th>Next step</th><th>Submitted</th></tr></thead>
        <tbody>{assessments.map((assessment) => <tr key={assessment.id}>
          <td data-label="Lead"><strong className={`lead-score ${assessment.leadScore >= 70 ? "hot" : ""}`}>{assessment.leadScore}</strong><span>{assessment.leadScoreReasons.slice(0, 2).join(" · ") || "New enquiry"}</span></td>
          <td data-label="Customer"><strong>{assessment.customerName}</strong><a href={`https://wa.me/65${assessment.whatsappNumber.replace(/\D/g, "").replace(/^65/, "")}`} target="_blank" rel="noreferrer">{assessment.whatsappNumber}</a></td>
          <td data-label="Comfort need"><strong>{assessment.comfortConcern}</strong><span>{assessment.whenAffected} · {assessment.budgetRange}</span>{assessment.parsedConcern && <small className="tag">{assessment.parsedConcern.replaceAll("_", " ")}</small>}</td>
          <td data-label="Suggested match"><strong>{assessment.suggestedCategory}</strong><span>{Math.round(assessment.confidence * 100)}% {assessment.suggestionSource} confidence</span>{assessment.recommendationCopy && <small>{assessment.recommendationCopy}</small>}</td>
          <td data-label="Next step"><span className={`status ${assessment.preferredNextStep ?? "none"}`}>{assessment.preferredNextStep === "fitting" ? "Fitting requested" : assessment.preferredNextStep === "whatsapp" ? "WhatsApp" : "Not selected"}</span>{assessment.fittingPreferredTime && <small>{assessment.fittingPreferredTime.replace("T", " at ")}</small>}</td>
          <td data-label="Submitted"><span>{formatDate(assessment.createdAt)}</span>{assessment.reviewStatus === "contacted" ? <small className="contacted">✓ Contacted</small> : <form action={markContacted}><input type="hidden" name="assessmentId" value={assessment.id} /><button type="submit" className="mini-button">Mark contacted</button></form>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
