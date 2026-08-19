"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";

const APPROVED_ADMIN_HASHES = new Set([
  "5da614e3ed66f714017f82688fc22cc87451b257df02fbaf6fdfc84d5a0cecc7",
]);

export async function requestAdminMagicLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = createHash("sha256").update(normalizedEmail).digest("hex");
  if (!APPROVED_ADMIN_HASHES.has(hash)) {
    return { error: "This email is not approved for distributor access." };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wellness-wear-finder.vercel.app";
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: { emailRedirectTo: `${appUrl}/auth/callback?next=/admin`, shouldCreateUser: true },
  });
  if (error) return { error: "Could not send the secure sign-in link. Please try again." };
  return { sent: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
