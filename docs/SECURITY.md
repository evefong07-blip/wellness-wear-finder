# Security

## Secret Handling
- Supabase URL + anon key: public-safe, exposed via `NEXT_PUBLIC_SUPABASE_*`
- Supabase service role key: server-only, never prefixed with `NEXT_PUBLIC_`, only used in server actions / route handlers
- Any future WhatsApp Business API token: stored in Supabase secrets vault or Vercel env, never in client code

## Permission Model
- **v1 (demo-first):** RLS enabled but permissive — all rows readable/writable without login so anonymous visitors can submit assessments and the app renders from seed data
- **Lock-down sprint:** Replace permissive policies with owner-scoped: `auth.uid() = user_id` for assessments; distributor reads via service role in protected admin route

## Approved-Tools Rule
- The only external action in v1 is a WhatsApp `wa.me` deep-link — this opens the visitor's own WhatsApp client; the app sends nothing automatically
- No raw `run_any` / `send_any` patterns — every future agent action must call a named, typed function with explicit input schema

## Audit Principle
- Every assessment submission is a stored record (the assessment itself is the audit trail)
- Future agent actions log to `audit_logs` with actor, action, target, timestamp, and metadata
- No assessment data leaves Supabase except via the WhatsApp deep-link message the user explicitly triggers