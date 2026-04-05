# BridgeCare — Pitch & Judging Notes

## One-liner
> **BridgeCare is the AI health front door for Gen Z students.**

## Elevator pitch (30 seconds)
BridgeCare helps young adults understand urgency, care options, cost direction, and next steps — in one calm, accessible flow.

We are not replacing clinicians. We are reducing confusion before care happens.

## Problem
- 40% of young adults avoid or delay care because they don't know if it's "bad enough"
- Healthcare navigation is fragmented, jargon-heavy, and anxiety-inducing
- Googling symptoms leads to spiraling, not action

## Solution
A calm AI health navigation app that:
1. Accepts plain-language symptom descriptions
2. Runs deterministic red-flag triage (rules-first, AI explains)
3. Returns urgency level + care options + cost estimates
4. Finds nearby providers via OpenStreetMap
5. Explains insurance coverage in plain English
6. Follows up to ensure patients got care

## Key differentiators

| Feature | BridgeCare | WebMD/Symptom checkers |
|---|---|---|
| Urgency decision | Rules engine (deterministic) | AI or symptom matching |
| Output | Actionable care route | List of diagnoses |
| Cost/coverage | Explained in plain language | Not covered |
| Follow-up | Built-in reminders | None |
| Accessibility | WCAG-compliant, reduced motion | Not designed for it |

## Tech stack
- **Frontend:** Next.js 14 App Router + Tailwind + Motion
- **AI:** Ollama (local) → Claude → Groq → Google AI Studio
- **Backend:** FastAPI + pydantic
- **Database:** Supabase + pgvector
- **Maps:** OpenStreetMap + Overpass API (free, no API key)
- **Cost:** ~$0/month to run for demo

## Why we'll win
1. The user story is immediately relatable to judges and users
2. The demo is end-to-end working in 5 minutes
3. Safety is built-in architecturally, not bolted on
4. The design is beautiful and calming — it feels like a health app should
5. The business case is clear: health systems, student health plans, and insurers want this
