# Architecture

## Stack
- **Next.js 14** (App Router, server components) + **Supabase** (Postgres) + **Vercel** (deploy)
- TypeScript throughout

## Responsive Nav Shell
Two surfaces: the public assessment page (`/`) and a distributor admin list (`/admin`). Persistent left sidebar on desktop (Assessment, Admin), collapsing to hamburger on mobile. Current section highlighted.

## Build Order — Now / Next / Later
- **Now:** Assessment form → rule-based category suggestion → WhatsApp deep-link → persistence → admin list
- **Next:** AI-suggested category (LLM on stored answers) → lead scoring → dashboard charts
- **Later:** Lock down with auth + owner-scoped RLS → fitting calendar integration → email/SMS follow-up reminders

## Key User Action Flow
1. Visitor opens `/` → assessment form renders with seed category data
2. Answers 5 questions (name, WhatsApp, comfort concern, when affected, budget, preferred category)
3. Form submits → server action writes assessment row to Supabase
4. Rule engine maps answers → suggested product category
5. Result screen shows suggestion + two CTAs: WhatsApp deep-link (pre-filled message) and fitting-request form
6. Distributor opens `/admin` → sees all assessments in a table

## Layer Plan
1. **Data layer** (`lib/data/`) — all Supabase reads/writes; nothing inline in UI
2. **App logic** (`lib/logic/`) — category matching rules, WhatsApp link builder
3. **Smart features** (`lib/ai/`) — LLM-enhanced suggestions (later)
4. **UI** (`app/`) — server components + client islands for the form

## Why Core Runs Without AI
Category suggestion is rule-based: answers map to a category via a simple scoring matrix stored in `lib/logic/categoryMatcher.ts`. The LLM enhancement is additive — if it fails or is absent, the rule output is shown.

## Repo Structure
```
app/
  layout.tsx              # sidebar shell
  page.tsx                # assessment form + result
  admin/page.tsx           # assessment list
components/
  AssessmentForm.tsx
  ResultCard.tsx
  WhatsAppButton.tsx
  AdminTable.tsx
lib/
  data/assessments.ts      # CRUD for assessments
  data/categories.ts       # read categories
  logic/categoryMatcher.ts # rule-based suggestion
  logic/whatsapp.ts        # deep-link builder
  ai/suggestion.ts         # LLM suggestion (later)
tests/
  categoryMatcher.test.ts
  assessments.test.ts
```

## Module Map
| Module | Responsibility | Owns | Build Order |
|--------|---------------|------|-------------|
| data/categories | Read product categories | product_categories table | 1st |
| data/assessments | CRUD assessments | assessments table | 2nd |
| logic/categoryMatcher | Map answers → category | matching rules | 3rd |
| logic/whatsapp | Build pre-filled WhatsApp link | link format | 4th |
| ui/assessment | Form + result flow | form component | 5th |
| ui/admin | Distributor list view | admin table | 6th |
| ai/suggestion | LLM-enhanced suggestion | prompt + parse | later |