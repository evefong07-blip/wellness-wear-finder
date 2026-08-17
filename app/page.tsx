import { AssessmentForm } from "@/components/AssessmentForm";
import { getCategories } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getCategories();
  return (
    <main className="app-main">
      <div className="hero-copy">
        <p className="eyebrow">Personal guidance · Singapore</p>
        <h1>Feel more at ease in what you wear.</h1>
        <p>Answer five quick questions and discover a wellness-wear category shaped around your comfort, routine and budget.</p>
        <div className="trust-row"><span>✓ No login</span><span>✓ About 2 minutes</span><span>✓ Private by design</span></div>
      </div>
      <AssessmentForm categories={categories} />
    </main>
  );
}
