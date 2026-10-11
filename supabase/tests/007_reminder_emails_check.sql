-- Run in the Supabase SQL editor after 007. Everything rolls back, so no email is sent
-- (pg_net only sends requests that were committed) and no data is left behind.
-- Needs at least one signed-up user. Expect: "ok: due reminder was queued, future one was not".
begin;

do $$
declare
  uid uuid := (select id from public.profiles where email is not null limit 1);
  due_id uuid; later_id uuid;
begin
  if uid is null then raise exception 'sign up one user first'; end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'resend_api_key') then
    perform vault.create_secret('test-key', 'resend_api_key');
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'site_url') then
    perform vault.create_secret('https://example.test', 'site_url');
  end if;

  insert into public.reminders (user_id, message, due_at) values (uid, 'check test', now() - interval '1 minute')
    returning id into due_id;
  insert into public.reminders (user_id, message, due_at) values (uid, 'check test', now() + interval '1 day')
    returning id into later_id;

  perform public.send_due_reminder_emails();

  assert (select emailed_at from public.reminders where id = due_id) is not null, 'due reminder was not emailed';
  assert (select emailed_at from public.reminders where id = later_id) is null, 'future reminder was emailed early';
  raise notice 'ok: due reminder was queued, future one was not';
end $$;

rollback;
