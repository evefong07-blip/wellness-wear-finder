# Agentic Layer

## Risk Levels

### Low — Auto (no approval)
- Parse free-text comfort concern into structured tag
- Score and rank product categories for a suggestion
- Tag assessment with `review_status` (auto-reviewed / needs-review)

### Medium — Light approval (distributor confirms)
- Update assessment `review_status` to "contacted" after follow-up
- Generate a draft WhatsApp follow-up message from assessment data (distributor reviews before sending)

### High — Always approval
- Send an automated WhatsApp message to a lead (future — not v1)
- Create a fitting calendar event (future)

### Critical — Human only
- Delete an assessment record
- Export assessment data to external system

## Named Tools (v1 — none executable; manual only)
- `whatsapp_deep_link` — builds a wa.me URL with pre-filled message (opens user's WhatsApp, no auto-send)

## Named Tools (Later)
- `send_whatsapp_message` — sends via WhatsApp Business API (high risk)
- `create_fitting_event` — creates calendar entry (high risk)

## Audit Log Fields
- `id`, `action`, `actor` (user_id or 'system'), `target_id` (assessment id), `metadata jsonb`, `created_at`

## v1 vs Later
- **v1:** No automated agent actions. WhatsApp is a manual deep-link the user taps themselves. Suggestion is rule-based, not agentic.
- **Later:** LLM-assisted message drafting (medium), WhatsApp API send (high), calendar booking (high), audit logging of all actions.