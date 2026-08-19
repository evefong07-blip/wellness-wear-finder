"use client";

import { FormEvent, useState, useTransition } from "react";
import { requestAdminMagicLink } from "@/app/auth/actions";

export function LoginForm({ unauthorized = false }: { unauthorized?: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(unauthorized ? "This account is not approved for distributor access." : "");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await requestAdminMagicLink(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) return <div className="login-sent" role="status"><strong>Check your email</strong><p>We sent a secure sign-in link to {email}. It expires automatically.</p><button type="button" className="text-button" onClick={() => setSent(false)}>Use a different email</button></div>;

  return <form className="login-form" onSubmit={submit}>
    <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" /></label>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <button className="button primary" type="submit" disabled={isPending}>{isPending ? "Sending secure link…" : "Email me a sign-in link"}</button>
  </form>;
}
