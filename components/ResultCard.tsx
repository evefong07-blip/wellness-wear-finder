import type { AssessmentResult } from "@/lib/types";

export function ResultCard({ result, onRestart }: { result: AssessmentResult; onRestart: () => void }) {
  return (
    <section className="assessment-card result-card" aria-live="polite">
      <div className="result-icon">✓</div>
      <p className="eyebrow">Your everyday comfort match</p>
      <h2>{result.category.name}</h2>
      <p className="result-description">{result.category.description}</p>
      <div className="match-note"><span>Why this match</span><p>Your concern, routine and budget aligned most closely with this category. This is practical guidance, not medical advice.</p></div>
      <a className="button whatsapp" href={result.whatsappUrl} target="_blank" rel="noreferrer">Continue on WhatsApp <span>↗</span></a>
      <p className="result-footnote">Your assessment has been saved. The message opens in your WhatsApp for you to review before sending.</p>
      <button className="text-button" type="button" onClick={onRestart}>Start another assessment</button>
    </section>
  );
}
