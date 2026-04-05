-- Safe to run on new and existing databases.

-- 1. Guest cases were readable by anyone holding the public (anon/publishable) key.
--    The API now serves them by their unguessable id instead (GET /triage/case/{id}).
drop policy if exists "Anyone can read case by id" on public.cases;

-- 2. ivfflat built on empty tables gives poor recall; hnsw needs no training data.
drop index if exists public.snippets_embedding_idx;
create index snippets_embedding_idx on public.knowledge_snippets using hnsw (embedding vector_cosine_ops);
drop index if exists public.meds_embedding_idx;
create index meds_embedding_idx on public.medication_guides using hnsw (embedding vector_cosine_ops);

-- 3. Running LLM spend, so the API can stop calling Claude at ANTHROPIC_BUDGET_USD.
create table if not exists public.llm_spend (
  provider   text primary key,
  usd        numeric(12, 6) not null default 0,
  updated_at timestamptz default now()
);
alter table public.llm_spend enable row level security;  -- no policies: server (secret key) only

create or replace function public.add_llm_spend(p_provider text, p_usd numeric)
returns numeric
language sql security definer set search_path = public
as $$
  insert into llm_spend (provider, usd) values (p_provider, p_usd)
  on conflict (provider) do update set usd = llm_spend.usd + excluded.usd, updated_at = now()
  returning usd
$$;
revoke execute on function public.add_llm_spend(text, numeric) from public, anon, authenticated;
grant execute on function public.add_llm_spend(text, numeric) to service_role;
