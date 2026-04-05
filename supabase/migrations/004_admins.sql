-- Admin analytics access (/admin page).
-- Admins live in their own table with no client-writable policy, so a user can't promote
-- themselves by updating their profile. Add one from the SQL editor:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';

create table if not exists public.admins (
  user_id    uuid primary key references auth.users on delete cascade,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;  -- no policies: invisible to clients

-- security definer so policies can call it without recursing through RLS
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can view all cases" on public.cases;
create policy "Admins can view all cases"
  on public.cases for select using (public.is_admin());

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());
