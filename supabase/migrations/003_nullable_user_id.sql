-- Allow guest (anonymous) check-ins by making user_id nullable in cases
-- Also add missing columns that the API writes to

ALTER TABLE public.cases
  ALTER COLUMN user_id DROP NOT NULL;

-- Add columns not present in initial schema
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS urgency_label    text,
  ADD COLUMN IF NOT EXISTS care_options     jsonb  DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS cost_estimate    text,
  ADD COLUMN IF NOT EXISTS follow_up_in     text,
  ADD COLUMN IF NOT EXISTS warning_signs    text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS visit_prep       jsonb;

-- Allow service role to insert guest cases (no auth.uid match)
-- The API uses the service key which bypasses RLS, so this is safe.
-- Logged-in users still only see their own cases via existing RLS policies.

-- Guest cases are NOT readable through the anon key (that would expose every guest's
-- symptoms). The API serves them by their unguessable id: GET /triage/case/{id}.
