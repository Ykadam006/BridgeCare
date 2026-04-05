-- BridgeCare Initial Schema
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  email       text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Cases ───────────────────────────────────────────────────────────────────
create table if not exists public.cases (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  chief_complaint  text not null,
  urgency_level    text not null check (urgency_level in ('low', 'medium', 'high', 'critical')),
  urgency_label    text,
  score            integer default 0,
  explanation      text,
  red_flags        text[] default '{}',
  resolved         boolean default false,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index if not exists cases_user_id_idx on public.cases(user_id);
create index if not exists cases_created_at_idx on public.cases(created_at desc);
create index if not exists cases_urgency_idx on public.cases(urgency_level);

-- ─── Reminders ───────────────────────────────────────────────────────────────
create table if not exists public.reminders (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid references public.profiles(id) on delete cascade not null,
  case_id   uuid references public.cases(id) on delete set null,
  message   text not null,
  due_at    timestamptz not null,
  done      boolean default false,
  created_at timestamptz default now()
);

create index if not exists reminders_user_id_idx on public.reminders(user_id);
create index if not exists reminders_due_at_idx on public.reminders(due_at);

-- ─── Knowledge snippets (for RAG / pgvector) ──────────────────────────────
create table if not exists public.knowledge_snippets (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  content     text not null,
  source      text,
  category    text,  -- 'triage', 'coverage', 'medication', 'provider'
  embedding   vector(384),  -- all-MiniLM-L6-v2 dimensions
  created_at  timestamptz default now()
);

create index if not exists snippets_category_idx on public.knowledge_snippets(category);
create index if not exists snippets_embedding_idx on public.knowledge_snippets
  using hnsw (embedding vector_cosine_ops);  -- hnsw: no training data needed, unlike ivfflat

-- ─── Row-level security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.reminders enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Cases: users can only access their own
create policy "Users can view own cases"
  on public.cases for select using (auth.uid() = user_id);
create policy "Users can insert own cases"
  on public.cases for insert with check (auth.uid() = user_id);
create policy "Users can update own cases"
  on public.cases for update using (auth.uid() = user_id);

-- Reminders: users can only access their own
create policy "Users can view own reminders"
  on public.reminders for select using (auth.uid() = user_id);
create policy "Users can update own reminders"
  on public.reminders for update using (auth.uid() = user_id);

-- Knowledge: public read
alter table public.knowledge_snippets enable row level security;
create policy "Anyone can read knowledge"
  on public.knowledge_snippets for select using (true);

-- ─── Similarity search function ──────────────────────────────────────────────
create or replace function public.match_knowledge(
  query_embedding vector(384),
  match_count int default 5,
  filter_category text default null
)
returns table (
  id uuid,
  title text,
  content text,
  source text,
  category text,
  similarity float
) as $$
begin
  return query
  select
    k.id, k.title, k.content, k.source, k.category,
    1 - (k.embedding <=> query_embedding) as similarity
  from public.knowledge_snippets k
  where (filter_category is null or k.category = filter_category)
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql;
