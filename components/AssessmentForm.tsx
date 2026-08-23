"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { submitAssessment } from "@/app/actions";
import type { AssessmentInput, AssessmentResult, ProductCategory } from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";
import { matchCategory } from "@/lib/logic/categoryMatcher";
import { isValidSingaporeMobile } from "@/lib/logic/form";
import { describeBudgetFit, formatEstimatedPrice, getBudgetFit } from "@/lib/logic/budget";

const concerns = [
  "Knee comfort during walking, standing or stairs",
  "Feet or lower-leg comfort after a long day",
  "Resting my eyes or winding down",
  "Not sure yet",
];
const timings = ["During walking or stairs", "After long hours standing", "After a long day", "At bedtime or while resting", "It varies"];
const budgets = ["Under S$80", "S$80–S$120", "S$120–S$180", "S$180–S$230", "Flexible / not sure"];
const categoryImages: Record<string, string> = {
  "Knee Supporter": "/images/product-knee-supporter.png",
  "Wellness Socks": "/images/product-wellness-socks.png",
  "Wellness Eye Mask": "/images/product-eye-mask.png",
};

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
  const [categoryChoiceMade, setCategoryChoiceMade] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "assessment_started" }), keepalive: true });
  }, []);

  const canContinue = [
    Boolean(values.comfortConcern),
    Boolean(values.whenAffected),
    categoryChoiceMade,
    Boolean(values.budgetRange),
    Boolean(values.customerName.trim() && isValidSingaporeMobile(values.whatsappNumber)),
  ][step];

  const previewMatch = step === 4 && categories.length
    ? matchCategory(categories, {
      concern: values.comfortConcern,
      timing: values.whenAffected,
      budget: values.budgetRange,
      preferredCategoryId: values.preferredCategoryId,
    }).category
    : null;

  function choose(field: keyof AssessmentInput, value: string | null) {
    setError("");
    setValues((current) => ({ ...current, [field]: value }));
  }

  function chooseCategory(value: string | null) {
    setCategoryChoiceMade(true);
    choose("preferredCategoryId", value);
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
    return <ResultCard result={result} onRestart={() => { setValues(initialValues); setStep(0); setCategoryChoiceMade(false); setResult(null); }} />;
  }

  return (
    <section className="assessment-card" aria-labelledby="assessment-title">
      <div className="progress-row">
        <span>Question {step + 1} of 5</span>
        <span>About 2 minutes</span>
      </div>
      <div className="progress-track"><span style={{ width: `${(step + 1) * 20}%` }} /></div>

      {step === 0 && (
        <ChoiceQuestion eyebrow="Your everyday comfort" title="Which area would you like more everyday comfort with?" copy="Start with what you notice most — there’s no right or wrong answer." options={concerns} value={values.comfortConcern} onChange={(value) => choose("comfortConcern", value)} />
      )}

      {step === 1 && <ChoiceQuestion eyebrow="Your routine" title="When do you notice it most?" copy="This helps us narrow the category to your everyday context." options={timings} value={values.whenAffected} onChange={(value) => choose("whenAffected", value)} />}
      {step === 2 && (
        <div className="question-panel">
          <p className="eyebrow">Your preference</p>
          <h2>Which option feels closest to what you’d use?</h2>
          <p className="question-copy">Choose by lifestyle and comfort — these are categories, not items to buy here.</p>
          <div className="category-choice-grid">
            {categories.map((category) => <button type="button" key={category.id} className={values.preferredCategoryId === category.id ? "category-choice selected" : "category-choice"} onClick={() => chooseCategory(category.id)}>
              <Image src={categoryImages[category.name] ?? "/images/product-knee-supporter.png"} alt={categoryImageAlt(category.name)} width={640} height={640} sizes="(max-width: 560px) 42vw, 180px" />
              <span><strong>{category.name}</strong><small>{category.description}</small></span>
            </button>)}
            <button type="button" className={categoryChoiceMade && values.preferredCategoryId === null ? "choice category-unsure selected" : "choice category-unsure"} onClick={() => chooseCategory(null)}><span className="radio-dot" /><strong>Help me choose</strong><span>Use my answers to find the closest match</span></button>
          </div>
        </div>
      )}
      {step === 3 && <ChoiceQuestion eyebrow="Your budget" title="What range feels comfortable?" copy="This helps keep the suggestion realistic for you." options={budgets} value={values.budgetRange} onChange={(value) => choose("budgetRange", value)} />}
      {step === 4 && previewMatch && (
        <div className="question-panel contact-step">
          <p className="eyebrow">Your match is taking shape</p>
          <h2 id="assessment-title">Here’s your likely starting point.</h2>
          <div className="match-teaser">
            <Image src={categoryImages[previewMatch.name] ?? "/images/product-knee-supporter.png"} alt="" width={120} height={120} />
            <div><span>Your likely match</span><strong>{previewMatch.name}</strong><small>{formatEstimatedPrice(previewMatch)}</small></div>
          </div>
          <p className={`budget-guidance ${getBudgetFit(previewMatch, values.budgetRange) === "outside" ? "outside" : ""}`}>{describeBudgetFit(previewMatch, values.budgetRange)}</p>
          <p className="question-copy">Add your details to save the full recommendation and choose WhatsApp or a private fitting next.</p>
          <label>Your name<input autoFocus value={values.customerName} onChange={(event) => choose("customerName", event.target.value)} placeholder="Sarah Tan" autoComplete="name" /></label>
          <label>Singapore WhatsApp number
            <div className="phone-field">
              <select aria-label="Country code" defaultValue="+65"><option value="+65">SG +65</option></select>
              <input aria-label="WhatsApp number" defaultValue={values.whatsappNumber} onInput={(event) => choose("whatsappNumber", event.currentTarget.value)} placeholder="8123 4567" inputMode="tel" autoComplete="tel" />
            </div>
          </label>
          <p className="consent-copy">We’ll only send your result summary via WhatsApp—no spam.</p>
          {values.whatsappNumber && !isValidSingaporeMobile(values.whatsappNumber) && <p className="field-error">Use an 8-digit Singapore mobile number starting with 6, 8 or 9.</p>}
        </div>
      )}

      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="form-actions">
        {step > 0 && <button className="button secondary" type="button" onClick={() => setStep((current) => current - 1)} disabled={isPending}>Back</button>}
        {step < 4 ? <button className="button primary" type="button" onClick={() => setStep((current) => current + 1)} disabled={!canContinue}>Continue <span>→</span></button> : <button className="button primary" type="button" onClick={finish} disabled={!canContinue || isPending}>{isPending ? "Preparing your match…" : "Get My Custom Match →"}</button>}
      </div>
      <p className="privacy-note">No diagnosis or health claims — just practical category guidance based on your preferences.</p>
    </section>
  );
}

function ChoiceQuestion({ eyebrow, title, copy, options, value, onChange }: { eyebrow: string; title: string; copy: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="question-panel"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="question-copy">{copy}</p><div className="choice-grid">{options.map((option) => <button type="button" key={option} className={value === option ? "choice selected" : "choice"} onClick={() => onChange(option)}><span className="radio-dot" /> <strong>{option}</strong></button>)}</div></div>;
}

function categoryImageAlt(name: string) {
  if (name === "Knee Supporter") return "Black knee supporter worn on the lower leg";
  if (name === "Wellness Socks") return "Black wellness socks worn by a seated model";
  return "Beige wellness eye mask";
}
