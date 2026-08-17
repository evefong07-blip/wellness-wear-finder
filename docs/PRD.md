# Wellness Wear Finder — PRD

## Problem
Women and adults in Singapore curious about wellness clothing can't easily figure out which product category suits their everyday comfort needs. Repeated manual Q&A wastes the distributor's follow-up time and doesn't filter casual enquiries from qualified leads.

## Target User
Singapore-based adults (primarily women) who saw wellness clothing content on Facebook/ads and want guidance choosing a category. Secondary user: the independent distributor who receives and follows up on qualified responses.

## Core Objects
- **Assessment** — a completed quiz: name, WhatsApp number, comfort concern, when it affects them, preferred product category, budget range, AI-suggested product category, preferred next step (WhatsApp chat / fitting booking).
- **Product Category** — reference list of wellness clothing categories (e.g. everyday support wear, posture tops, comfort bottoms, sleep/relax wear) with a short description and matching rule hints.

## MVP (v1) Checklist
- [ ] Multi-step assessment form (5–7 questions, ~2 minutes)
- [ ] Suggested product category shown after submission (rule-based, AI-enhanced later)
- [ ] WhatsApp deep-link button pre-filled with the user's assessment summary
- [ ] Fitting booking request option (captures preferred time slot)
- [ ] Assessment records persisted to database (viewable by distributor)
- [ ] Admin view listing all assessments (read-only table)
- [ ] Demo seed data so app renders instantly for anonymous visitors

## Non-Goals (v1)
- No medical diagnosis or health claims
- No online payment or e-commerce checkout
- No full product catalogue or inventory
- No customer accounts or login
- No distributor recruitment or webinar features

## Success Criteria
A visitor lands on the page, completes a 5-question assessment in under 2 minutes, receives a suggested product category, taps a WhatsApp button that opens a pre-filled chat summarising their responses, and the distributor sees the saved assessment in the admin list — end to end, no login required.