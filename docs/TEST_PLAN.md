# Test Plan

## v1 Success Scenario (manual)
1. Open `/` — assessment form renders, first question visible
2. Enter name: "Sarah Tan", WhatsApp: "81234567"
3. Select comfort concern: "Posture / back support"
4. Select when affected: "All day at work"
5. Select budget: "$50–$100"
6. Submit — loading state shows briefly
7. Result screen displays suggested category (e.g. "Everyday Support Wear")
8. Tap WhatsApp button → opens `wa.me/6581234567?text=...` with pre-filled message containing name, concern, budget
9. Open Supabase table → confirm assessment row saved with all fields
10. Open `/admin` → see the submitted assessment in the list

## Empty State
1. Open `/admin` with no submissions (fresh DB) → shows "No assessments yet" message, not a blank screen

## Error State
1. Disconnect network, submit form → error message shown, no silent failure
2. Submit with missing required fields → inline validation errors, no partial save

## Loading State
1. Slow network → form submit shows spinner / disabled button

## Partial State
1. Assessment submitted but suggestion fails → fallback category shown with lower confidence, `review_status` = 'needs-review'

## RLS Check (post lock-down)
1. Unauthenticated user opens `/admin` → redirected to login
2. Authenticated distributor sees only their data
3. Anonymous user can still submit assessment at `/`