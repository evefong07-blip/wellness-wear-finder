"use client";

import { useState, useTransition } from "react";
import { submitFittingRequest } from "@/app/actions";
import type { AssessmentResult } from "@/lib/types";
import { combinePreferredDateTime, singaporeDateValue } from "@/lib/logic/form";

const fittingTimes = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const label = new Intl.DateTimeFormat("en-SG", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(2000, 0, 1, hours, minutes));
  return { value, label };
});

export function ResultCard({ result, onRestart }: { result: AssessmentResult; onRestart: () => void }) {
  const [showFitting, setShowFitting] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredClock, setPreferredClock] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const preferredTime = combinePreferredDateTime(preferredDate, preferredClock);

  function saveFitting() {
    setError("");
    startTransition(async () => {
      try {
        await submitFittingRequest(result.assessmentId, preferredTime);
        setSaved(true);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not save your request.");
      }
    });
  }

  return (
    <section className="assessment-card result-card" aria-live="polite">
      <div className="result-icon">✓</div>
      <p className="eyebrow">Your everyday comfort match</p>
      <h2>{result.category.name}</h2>
      <p className="result-description">{result.recommendationCopy || result.category.description}</p>
      <div className="match-note"><span>Why this match</span><p>Your concern, routine and budget aligned most closely with this category. This is practical guidance, not medical advice.</p></div>
      <a className="button whatsapp" href={result.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => { void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "whatsapp_clicked", assessmentId: result.assessmentId }), keepalive: true }); }}>Continue on WhatsApp <span>↗</span></a>
      {!saved && <button className="button fitting" type="button" onClick={() => setShowFitting((value) => !value)}>Request a private fitting</button>}
      {showFitting && !saved && <div className="fitting-form">
        <div className="fitting-fields">
          <label>Preferred date<input aria-label="Preferred date" type="date" min={singaporeDateValue()} defaultValue={preferredDate} onInput={(event) => setPreferredDate(event.currentTarget.value)} /></label>
          <label>Preferred time<select aria-label="Preferred time" value={preferredClock} onChange={(event) => setPreferredClock(event.currentTarget.value)}><option value="">Choose a time</option>{fittingTimes.map((time) => <option key={time.value} value={time.value}>{time.label}</option>)}</select></label>
        </div>
        {error && <div className="error-banner" role="alert">{error}</div>}
        <button type="button" className="button primary" onClick={saveFitting} disabled={!preferredTime || isPending}>{isPending ? "Saving…" : "Save fitting request"}</button>
      </div>}
      {saved && <div className="success-banner" role="status"><strong>Fitting request saved.</strong><span>The distributor can now see your preferred time and follow up with you.</span></div>}
      <p className="result-footnote">Your assessment has been saved. The message opens in your WhatsApp for you to review before sending.</p>
      <button className="text-button" type="button" onClick={onRestart}>Start another assessment</button>
    </section>
  );
}
