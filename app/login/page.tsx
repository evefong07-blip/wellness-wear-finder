import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) redirect("/admin");
  }
  const params = await searchParams;

  return <main className="login-main">
    <section className="login-card">
      <div className="login-mark">W</div>
      <p className="eyebrow">Distributor access</p>
      <h1>Welcome back.</h1>
      <p>Enter the approved distributor email to receive a secure, password-free sign-in link.</p>
      <LoginForm unauthorized={params.error === "unauthorized"} />
      <Link className="login-back" href="/">← Return to public assessment</Link>
    </section>
  </main>;
}
