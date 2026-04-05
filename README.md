# BridgeCare

> Tell us what's going on. We'll help you understand urgency, care options, cost direction, and next steps.

A calm, Gen Z-first AI health navigation app — not a symptom-diagnosis tool.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 App Router + TypeScript + Tailwind CSS (`apps/web`) |
| Animation | Motion for React |
| Backend | FastAPI, Python 3.9+ (`apps/api`) |
| Database / Auth | Supabase (Postgres + Row Level Security) |
| Vector search | pgvector (HNSW) + local `all-MiniLM-L6-v2` embeddings (Hugging Face, open source) |
| AI runtime | Ollama → Claude → Groq → Google AI Studio |
| Maps | OpenStreetMap + Nominatim + Overpass API, OSRM routes |
| Charts | Recharts |

---

## Core architecture principle

**Rules first, AI second.**

- Red-flag checks are **deterministic** (`apps/api/app/services/triage_engine.py`), with phrase lists in all 7 UI languages (en, es, fr, pt, hi, zh, ar)
- Urgency level comes from a **scoring engine**, never LLM inference
- For non-English check-ins the LLM *translates* the text and the rules score that too; this can only raise urgency, never lower it
- AI only **explains** the result in plain language and **asks follow-up questions**

## AI provider chain

```
Ollama (local, free) → Claude (paid, capped) → Groq (free tier) → Google AI Studio (free tier)
```

Providers without a key are skipped; if every provider fails the app falls back to built-in text.

Claude defaults to `claude-haiku-4-5` (the cheapest current model) and stops being called once this app's recorded spend reaches `ANTHROPIC_BUDGET_USD` (default $100, tracked in `public.llm_spend`). Also set a spend limit in the Anthropic Console as a hard cap.

## Health documents (RAG)

Signed-in users upload PDFs or text files at `/documents` and ask questions about them:

```
upload → pypdf text per page → 150-word overlapping chunks → local embeddings (384-d)
       → document_chunks (pgvector, HNSW)
question → embed → match_document_chunks (this user's chunks only) → top 6 above 0.25 similarity
         → LLM chain answers ONLY from those passages, citing [n] → answer + sources (title, page)
```

Embeddings run locally, so indexing is free. Scanned (image-only) PDFs aren't supported yet.

## Security model

- The API reads the user from the Supabase access token (`Authorization: Bearer …`) — never from a `user_id` in the request body
- RLS: users see only their own cases, reminders and follow-ups; the anon key can't read any case
- Guest results are served by the API using the case's random UUID (the results link)
- Documents: RLS limits rows to their owner; the search function takes a user id, so only the server (secret key) may call it
- `/admin` requires a row in `public.admins` (see `supabase/migrations/004_admins.sql`)

This is not a HIPAA-compliant deployment.

---

## Quickstart

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor run, in order: `supabase/migrations/001…006`, then `supabase/seeds/seed_providers.sql`
3. Make yourself admin: `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`

### 2. API

```bash
cd apps/api
cp .env.example .env      # Supabase URL + service key, plus at least one AI key
./run.sh                  # creates .venv, installs, serves http://localhost:8000/docs
```

### 3. Web

```bash
cp apps/web/.env.local.example apps/web/.env.local   # Supabase URL + anon key
pnpm install
pnpm dev                  # http://localhost:3000
```

### Checks

```bash
cd apps/api && for t in test_triage_engine test_api_auth test_llm_budget test_documents; do .venv/bin/python -m tests.$t; done
pnpm --filter web lint    # tsc --noEmit
```

---

## Project structure

```
BridgeCare/
├── apps/
│   ├── web/                    # Next.js: /check flow, /results, /options (map), /documents, /dashboard, /admin
│   └── api/
│       ├── app/core/           # config, auth (Supabase token → user id)
│       ├── app/routes/         # triage, providers, coverage, followup, documents
│       ├── app/services/       # triage_engine (rules), llm_service (provider chain), …
│       └── tests/
├── packages/ui/                # shared React components
└── supabase/
    ├── migrations/             # tables, RLS, pgvector, admins
    └── seeds/
```

---

## Disclaimer

BridgeCare is a health **navigation** tool, not a medical provider. It does not diagnose conditions. For emergencies, call **911**.
