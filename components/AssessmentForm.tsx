"use client";

import { useEffect, useState, useTransition } from "react";
import { submitAssessment } from "@/app/actions";
import type { AssessmentInput, AssessmentResult, ProductCategory } from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";

const concerns = ["Posture / back support", "Tired legs / lower-body comfort", "Sleep / relaxation", "Muscle recovery", "Something else"];
const timings = ["All day at work", "Mornings", "After work", "After exercise", "At night"];
const budgets = ["Under $50", "$50-$100", "$100-$150", "$150+"];

const initialValues: AssessmentInput = {
  customerName: "",
  whatsappNumber: "",
  comfortConcern: "",
  whenAffected: "",
  budgetRange: "",
  preferredCategoryId: null,
};

export function AssessmentForm({ categories }: { categories: ProductCategory[] }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "assessment_started" }), keepalive: true });
  }, []);

  const canContinue = [
    Boolean(values.customerName.trim() && /^[689]\d{7}$/.test(values.whatsappNumber.replace(/\D/g, "").replace(/^65/, ""))),
    Boolean(values.comfortConcern),
    Boolean(values.whenAffected),
    Boolean(values.budgetRange),
    true,
  ][step];

  function choose(field: keyof AssessmentInput, value: string | null) {
    setError("");
    setValues((current) => ({ ...current, [field]: value }));
  }

  function finish() {
    setError("");
    startTransition(async () => {
      try {
        setResult(await submitAssessment(values));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
      }
    });
  }

  if (result) {
    return <ResultCard result={result} onRestart={() => { setValues(initialValues); setStep(0); setResult(null); }} />;
  }

  return (
    <section className="assessment-card" aria-labelledby="assessment-title">
      <div className="progress-row">
        <span>Question {step + 1} of 5</span>
        <span>About 2 minutes</span>
      </div>
      <div className="progress-track"><span style={{ width: `${(step + 1) * 20}%` }} /></div>

      {step === 0 && (
        <div className="question-panel">
          <p className="eyebrow">Let’s start with you</p>
          <h2 id="assessment-title">Where should we send your match?</h2>
          <p className="question-copy">We’ll only use these details to prepare your result and help you follow up.</p>
          <label>Your name<input autoFocus value={values.customerName} onChange={(event) => choose("customerName", event.target.value)} placeholder="Sarah Tan" autoComplete="name" /></label>
          <label>Singapore WhatsApp number<input value={values.whatsappNumber} onChange={(event) => choose("whatsappNumber", event.target.value)} placeholder="8123 4567" inputMode="tel" autoComplete="tel" /></label>
          {values.whatsappNumber && !/^[689]\d{7}$/.test(values.whatsappNumber.replace(/\D/g, "").replace(/^65/, "")) && <p className="field-error">Use an 8-digit Singapore mobile number starting with 6, 8 or 9.</p>}
        </div>
      )}

      {step === 1 && <ChoiceQuestion eyebrow="Your everyday comfort" title="What would you most like support with?" options={concerns} value={values.comfortConcern} onChange={(value) => choose("comfortConcern", value)} />}
      {step === 2 && <ChoiceQuestion eyebrow="Your routine" title="When do you notice it most?" options={timings} value={values.whenAffected} onChange={(value) => choose("whenAffected", value)} />}
      {step === 3 && <ChoiceQuestion eyebrow="Your budget" title="What range feels comfortable?" options={budgets} value={values.budgetRange} onChange={(value) => choose("budgetRange", value)} />}
      {step === 4 && (
        <div className="question-panel">
          <p className="eyebrow">One last detail</p>
          <h2>Is there a category you’re already curious about?</h2>
          <p className="question-copy">Optional — your answers still guide the final match.</p>
          <div className="choice-grid">
            <button type="button" className={values.preferredCategoryId === null ? "choice selected" : "choice"} onClick={() => choose("preferredCategoryId", null)}><strong>No preference</strong><span>Show me the best match</span></button>
            {categories.map((category) => <button type="button" key={category.id} className={values.preferredCategoryId === category.id ? "choice selected" : "choice"} onClick={() => choose("preferredCategoryId", category.id)}><strong>{category.name}</strong><span>{category.description}</span></button>)}
          </div>
        </div>
      )}

      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="form-actions">
        {step > 0 && <button className="button secondary" type="button" onClick={() => setStep((current) => current - 1)} disabled={isPending}>Back</button>}
        {step < 4 ? <button className="button primary" type="button" onClick={() => setStep((current) => current + 1)} disabled={!canContinue}>Continue <span>→</span></button> : <button className="button primary" type="button" onClick={finish} disabled={isPending}>{isPending ? "Finding your match…" : "Show my match →"}</button>}
      </div>
      <p className="privacy-note">No diagnosis or health claims — just practical category guidance based on your preferences.</p>
    </section>
  );
}

function ChoiceQuestion({ eyebrow, title, options, value, onChange }: { eyebrow: string; title: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="question-panel"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="choice-grid">{options.map((option) => <button type="button" key={option} className={value === option ? "choice selected" : "choice"} onClick={() => onChange(option)}><span className="radio-dot" /> <strong>{option}</strong></button>)}</div></div>;
}
