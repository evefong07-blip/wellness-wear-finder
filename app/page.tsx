import { AssessmentForm } from "@/components/AssessmentForm";
import { getCategories } from "@/lib/data/categories";
import type { ProductCategory } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: ProductCategory[] = [];
  let error = "";
  try {
    categories = await getCategories();
  } catch (reason) {
    error = reason instanceof Error ? reason.message : "The assessment is temporarily unavailable.";
  }
  return (
    <main className="app-main">
      <div className="hero-copy">
        <p className="eyebrow">Personal guidance · Singapore</p>
        <h1>Feel more at ease in what you wear.</h1>
        <p>Answer five quick questions and discover a wellness-wear category shaped around your comfort, routine and budget.</p>
        <div className="trust-row"><span>✓ No login</span><span>✓ About 2 minutes</span><span>✓ Private by design</span></div>
      </div>
      {error ? <section className="assessment-card unavailable-state" role="alert"><p className="eyebrow">Temporarily unavailable</p><h2>We couldn’t load the assessment.</h2><p>{error}</p><Link className="button primary" href="/">Try again</Link></section> : <AssessmentForm categories={categories} />}
    </main>
  );
}
