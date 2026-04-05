-- Health documents a signed-in user uploads, split into chunks with embeddings for
-- semantic search and cited answers (POST /documents, POST /documents/ask).
-- Embeddings: all-MiniLM-L6-v2 (384 dims), computed by the API.

create table if not exists public.documents (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  mime_type   text,
  page_count  integer,
  chunk_count integer not null default 0,
  created_at  timestamptz default now() not null
);
create index if not exists documents_user_idx on public.documents(user_id);

create table if not exists public.document_chunks (
  id          bigserial primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,  -- denormalized for the search filter
  chunk_index integer not null,
  page        integer,  -- 1-based PDF page, null for text files
  content     text not null,
  embedding   vector(384) not null
);
create index if not exists document_chunks_doc_idx on public.document_chunks(document_id);
create index if not exists document_chunks_user_idx on public.document_chunks(user_id);
create index if not exists document_chunks_embedding_idx on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

-- Owners can see and delete their own documents; writes go through the API (secret key).
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

drop policy if exists "Users can view own documents" on public.documents;
create policy "Users can view own documents"
  on public.documents for select using (auth.uid() = user_id);
drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
  on public.documents for delete using (auth.uid() = user_id);
drop policy if exists "Users can view own chunks" on public.document_chunks;
create policy "Users can view own chunks"
  on public.document_chunks for select using (auth.uid() = user_id);

-- Nearest chunks for ONE user. Takes the user id as an argument, so it must never be
-- callable by clients (they could pass someone else's id) — server/secret key only.
create or replace function public.match_document_chunks(
  p_user_id uuid,
  query_embedding vector(384),
  match_count int default 6
)
returns table (
  id bigint, document_id uuid, title text, page integer, content text, similarity float
)
-- `extensions` is where Supabase installs pgvector; without it the <=> operator isn't found
language sql stable security definer set search_path = public, extensions
as $$
  select c.id, c.document_id, d.title, c.page, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from document_chunks c
  join documents d on d.id = c.document_id
  where c.user_id = p_user_id
  order by c.embedding <=> query_embedding
  limit match_count
$$;
revoke execute on function public.match_document_chunks(uuid, vector, int) from public, anon, authenticated;
grant execute on function public.match_document_chunks(uuid, vector, int) to service_role;
