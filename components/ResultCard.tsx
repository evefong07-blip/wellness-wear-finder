"use client";

import { useState, useTransition } from "react";
import { submitFittingRequest } from "@/lib/client/assessmentApi";
import type { AssessmentResult } from "@/lib/types";
import { combinePreferredDateTime, singaporeDateValue } from "@/lib/logic/form";
import { describeBudgetFit, formatEstimatedPrice, getBudgetFit } from "@/lib/logic/budget";
import { buildFittingWhatsAppUrl } from "@/lib/logic/whatsapp";
import { undecidedPresentation } from "@/lib/logic/undecided";

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
  const [showOpenFallback, setShowOpenFallback] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const preferredTime = combinePreferredDateTime(preferredDate, preferredClock);
  const budgetFit = result.category ? getBudgetFit(result.category, result.budgetRange) : "unknown";
  const fittingWhatsAppUrl = preferredTime ? buildFittingWhatsAppUrl(result.customerName, result.whatsappNumber, preferredTime) : "";
  const isConsultation = result.outcome === "consultation";

  function saveFitting() {
    setError("");
    setShowOpenFallback(false);
    const whatsappWindow = window.open("", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    startTransition(async () => {
      try {
        await submitFittingRequest(result.assessmentId, preferredTime);
        setSaved(true);
        if (whatsappWindow) {
          whatsappWindow.location.href = fittingWhatsAppUrl;
        } else {
          setShowOpenFallback(true);
        }
      } catch (reason) {
        whatsappWindow?.close();
        setError(reason instanceof Error ? reason.message : "Could not save your request.");
      }
    });
  }

  function cancelFitting() {
    setShowFitting(false);
    setPreferredDate("");
    setPreferredClock("");
    setError("");
  }

  return (
    <section className="assessment-card result-card" aria-live="polite">
      <div className="result-icon">{isConsultation ? "?" : "✓"}</div>
      {isConsultation ? <>
        <p className="eyebrow">Personal guidance</p>
        <h2>{undecidedPresentation.title}</h2>
        <p className="result-description">{undecidedPresentation.message}</p>
        <p className="consultation-support">{undecidedPresentation.supportingText}</p>
      </> : result.category && <>
        <p className="eyebrow">Your everyday comfort match</p>
        <h2>{result.category.name}</h2>
        <p className="result-description">{result.recommendationCopy || result.category.description}</p>
        <div className={`price-summary ${budgetFit === "outside" ? "outside" : ""}`}><strong>{formatEstimatedPrice(result.category)}</strong><p>{describeBudgetFit(result.category, result.budgetRange, result.category.id === result.preferredCategoryId)}</p></div>
        <div className="match-note"><span>Why this match</span><p>Your comfort need and routine aligned most closely with this category. This is practical guidance, not medical advice.</p></div>
      </>}
      <a className="button whatsapp" href={result.whatsappUrl} target="_blank" rel="noreferrer" onClick={() => { void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "whatsapp_clicked", assessmentId: result.assessmentId }), keepalive: true }); }}>{isConsultation ? undecidedPresentation.primaryAction : "Continue on WhatsApp"} <span>↗</span></a>
      {!saved && <button className="button fitting" type="button" onClick={() => setShowFitting((value) => !value)}>{isConsultation ? undecidedPresentation.secondaryAction : "Request a private fitting"}</button>}
      {showFitting && !saved && <div className="fitting-form">
        <div className="fitting-fields">
          <label>Preferred date<input aria-label="Preferred date" type="date" min={singaporeDateValue()} defaultValue={preferredDate} onInput={(event) => setPreferredDate(event.currentTarget.value)} /></label>
          <label>Preferred time<select aria-label="Preferred time" value={preferredClock} onChange={(event) => setPreferredClock(event.currentTarget.value)}><option value="">Choose a time</option>{fittingTimes.map((time) => <option key={time.value} value={time.value}>{time.label}</option>)}</select></label>
        </div>
        {error && <div className="error-banner" role="alert">{error}</div>}
        <div className="fitting-form-actions"><button type="button" className="button primary" onClick={saveFitting} disabled={!preferredTime || isPending}>{isPending ? "Saving…" : "Save fitting request"}</button><button type="button" className="button secondary" onClick={cancelFitting} disabled={isPending}>Cancel</button></div>
      </div>}
      {saved && <><div className="success-banner" role="status"><strong>Fitting request saved.</strong><span>{showOpenFallback ? "Use the button below to open your prepared WhatsApp request." : "Your prepared WhatsApp request has opened for you to review."}</span></div>{showOpenFallback && <a className="button fitting" href={fittingWhatsAppUrl} target="_blank" rel="noreferrer">Open fitting request in WhatsApp <span>↗</span></a>}</>}
      <p className="result-footnote">Your assessment has been saved. The message opens in your WhatsApp for you to review before sending.</p>
      <button className="text-button" type="button" onClick={onRestart}>Start another assessment</button>
    </section>
  );
}
