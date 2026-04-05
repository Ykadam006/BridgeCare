-- BridgeCare Expanded Schema
-- Run AFTER 001_initial_schema.sql

-- ─── Symptoms ─────────────────────────────────────────────────────────────────
create table if not exists public.symptoms (
  id           uuid primary key default uuid_generate_v4(),
  case_id      uuid references public.cases(id) on delete cascade not null,
  name         text not null,
  duration     text,
  severity     integer,  -- 1-10
  notes        text,
  created_at   timestamptz default now()
);
create index if not exists symptoms_case_idx on public.symptoms(case_id);
alter table public.symptoms enable row level security;
create policy "Users can manage own case symptoms"
  on public.symptoms for all using (
    auth.uid() = (select user_id from public.cases where id = case_id)
  );

-- ─── Triage scores ────────────────────────────────────────────────────────────
-- Denormalized snapshot per case (for analytics without joining)
create table if not exists public.triage_scores (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid references public.cases(id) on delete cascade unique not null,
  score         integer not null,
  urgency_level text not null,
  red_flags     text[] default '{}',
  scored_at     timestamptz default now()
);
create index if not exists triage_scores_urgency_idx on public.triage_scores(urgency_level);
alter table public.triage_scores enable row level security;
create policy "Anyone with case access can read scores"
  on public.triage_scores for select using (
    auth.uid() = (select user_id from public.cases where id = case_id)
  );

-- ─── Providers (seeded local data) ───────────────────────────────────────────
create table if not exists public.providers (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  type             text not null,  -- clinic, urgent_care, er, pharmacy, telehealth, mental_health
  address          text,
  city             text,
  state            text,
  zip              text,
  lat              numeric(9,6),
  lon              numeric(9,6),
  phone            text,
  website          text,
  accepts_uninsured boolean default false,
  sliding_scale    boolean default false,
  telehealth_only  boolean default false,
  languages        text[] default '{}',
  notes            text,
  active           boolean default true,
  created_at       timestamptz default now()
);
create index if not exists providers_location_idx on public.providers(lat, lon);
create index if not exists providers_type_idx on public.providers(type);
create index if not exists providers_city_idx on public.providers(city);

-- Public read for providers
alter table public.providers enable row level security;
create policy "Public read providers" on public.providers for select using (true);

-- ─── Coverage content (static explainer content) ─────────────────────────────
create table if not exists public.coverage_content (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,  -- 'parent-plan', 'student-plan', etc.
  title        text not null,
  summary      text not null,
  details      text[],
  action_text  text,
  applicable_for text[],  -- ['18-24', 'uninsured', etc.]
  updated_at   timestamptz default now()
);
alter table public.coverage_content enable row level security;
create policy "Public read coverage content" on public.coverage_content for select using (true);

-- ─── Medication guides (openFDA-sourced) ─────────────────────────────────────
create table if not exists public.medication_guides (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  generic_name text,
  category     text,
  indications  text,
  warnings     text,
  otc          boolean default false,
  source       text default 'openFDA',
  embedding    vector(384),
  created_at   timestamptz default now()
);
create index if not exists meds_embedding_idx on public.medication_guides
  using hnsw (embedding vector_cosine_ops);
alter table public.medication_guides enable row level security;
create policy "Public read meds" on public.medication_guides for select using (true);

-- ─── Followups ────────────────────────────────────────────────────────────────
create table if not exists public.followups (
  id         uuid primary key default uuid_generate_v4(),
  case_id    uuid references public.cases(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  status     text default 'pending',  -- pending, completed, skipped
  got_care   boolean,
  feeling    text,  -- better, same, worse
  notes      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists followups_user_idx on public.followups(user_id);
create index if not exists followups_case_idx on public.followups(case_id);
alter table public.followups enable row level security;
create policy "Users can manage own followups"
  on public.followups for all using (auth.uid() = user_id);

-- ─── Audit logs ───────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id         bigserial primary key,
  user_id    uuid references public.profiles(id) on delete set null,
  action     text not null,
  resource   text,
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists audit_logs_user_idx on public.audit_logs(user_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
-- Audit logs: admins only (service role)
alter table public.audit_logs enable row level security;
create policy "Service role only audit" on public.audit_logs for all using (false);

-- ─── Update cases table to add new columns ────────────────────────────────────
alter table public.cases add column if not exists care_options jsonb default '[]';
alter table public.cases add column if not exists warning_signs text[] default '{}';
alter table public.cases add column if not exists visit_prep jsonb default '{}';
alter table public.cases add column if not exists insurance_context text;
