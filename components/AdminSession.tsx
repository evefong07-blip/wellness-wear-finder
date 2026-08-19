import { logout } from "@/app/auth/actions";

export function AdminSession({ email }: { email: string }) {
  return <div className="admin-session"><span>Signed in as <strong>{email}</strong></span><form action={logout}><button className="text-button" type="submit">Sign out</button></form></div>;
}
