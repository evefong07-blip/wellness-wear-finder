# Tasks — Sprints

## Sprint 1: Core Engine — Assessment + Suggestion + WhatsApp (v1 functional)
**Goal:** A visitor completes the assessment, gets a suggestion, and can contact via WhatsApp — end to end, no login.

- [ ] Set up Next.js + Supabase project
- [ ] Create `product_categories` and `assessments` tables with seed data (migration SQL)
- [ ] Build `lib/data/categories.ts` — read categories from Supabase
- [ ] Build `lib/data/assessments.ts` — insert assessment row
- [ ] Build `lib/logic/categoryMatcher.ts` — rule-based scoring
- [ ] Build `lib/logic/whatsapp.ts` — deep-link builder
- [ ] Build `AssessmentForm` component (5-step questions)
- [ ] Build `ResultCard` with suggested category + WhatsApp button
- [ ] Wire `/` page: form → submit → result
- [ ] Handle loading, empty, error states on form and result
- [ ] Test steps written and passing

**Definition of Done:** A visitor opens `/`, answers 5 questions, sees a suggested category, taps WhatsApp and a pre-filled message opens — and the row is saved in Supabase.

## Sprint 2: Admin View + Fitting Request
**Goal:** Distributor can see all assessments and visitors can request a fitting.

- [ ] Build `AdminTable` component listing assessments
- [ ] Wire `/admin` page (read-only table)
- [ ] Add fitting-request form on result screen (preferred time slot)
- [ ] Persist fitting preference to assessment row
- [ ] Add empty state for admin ("No assessments yet")
- [ ] Add pagination or scroll for admin table

**Definition of Done:** Distributor opens `/admin`, sees all submitted assessments with names, concerns, suggestions, and next-step preferences.

## Sprint 3: Lock Down — Auth + Owner-Scoped RLS
**Goal:** Secure the app for real use; admin protected, submissions scoped.

- [ ] Add Supabase Auth (email/password for distributor)
- [ ] Protect `/admin` route — redirect to login if unauthenticated
- [ ] Replace permissive RLS with owner-scoped policies
- [ ] Add login page + logout button
- [ ] Test: anonymous can still submit assessment; admin requires login

**Definition of Done:** Anonymous visitors can submit assessments; only the authenticated distributor can view the admin list.

## Sprint 4: AI Enhancement + Lead Scoring (Later)
- [ ] LLM parses free-text concern into structured tags
- [ ] LLM generates personalised recommendation copy
- [ ] Lead-scoring model ranks assessments for follow-up priority
- [ ] Dashboard charts (submissions over time, top categories)

## Gantt
```
Sprint 1 ████████████  Core Engine (v1 functional)
Sprint 2 ██████          Admin + Fitting
Sprint 3 ██████          Lock Down
Sprint 4 ████            AI + Lead Scoring (later)
```