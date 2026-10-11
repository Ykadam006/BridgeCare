-- Emails follow-up reminders when they come due. Safe to run on new and existing databases.
--
-- Before running, store these in Vault (SQL editor), so no secret lives in git:
--   select vault.create_secret('re_xxx', 'resend_api_key');                     -- resend.com → API Keys
--   select vault.create_secret('https://your-app.vercel.app', 'site_url');       -- no trailing slash
--   select vault.create_secret('BridgeCare <reminders@your-domain>', 'reminder_from');  -- optional
-- Without reminder_from, Resend's test sender is used, which only delivers to your own Resend email.

create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.reminders add column if not exists emailed_at timestamptz;

create or replace function public.send_due_reminder_emails()
returns int
language plpgsql security definer set search_path = public
as $$
declare
  api_key   text := (select decrypted_secret from vault.decrypted_secrets where name = 'resend_api_key');
  site      text := (select decrypted_secret from vault.decrypted_secrets where name = 'site_url');
  sender    text := coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'reminder_from'),
                             'BridgeCare <onboarding@resend.dev>');
  r         record;
  sent      int := 0;
begin
  if api_key is null or site is null then
    return 0;  -- not configured yet: reminders still show on /dashboard
  end if;

  for r in
    select rem.id, rem.message, rem.case_id, p.email
    from reminders rem
    join profiles p on p.id = rem.user_id
    where rem.due_at <= now() and rem.done is not true and rem.emailed_at is null and p.email is not null
    order by rem.due_at
    limit 100
    for update of rem skip locked
  loop
    -- Plain text only: message contains the user's own words, so no HTML to inject into.
    -- ponytail: pg_net is fire-and-forget, so a failed send isn't retried; check net._http_response
    -- for non-2xx and clear emailed_at if delivery ever matters more than "best effort".
    perform net.http_post(
      url     := 'https://api.resend.com/emails',
      headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
      body    := jsonb_build_object(
        'from', sender,
        'to', r.email,
        'subject', 'How are you feeling? Quick BridgeCare check-in',
        'text', r.message || E'\n\nTell us how it''s going (takes a minute):\n'
                || site || coalesce('/followup/' || r.case_id::text, '/dashboard')
                || E'\n\nIf symptoms are getting worse or you feel unsafe, call 911 or go to the nearest ER.'
                || E'\n\nBridgeCare is navigation, not medical advice.'
      )
    );
    update reminders set emailed_at = now() where id = r.id;
    sent := sent + 1;
  end loop;
  return sent;
end;
$$;
revoke execute on function public.send_due_reminder_emails() from public, anon, authenticated;
grant execute on function public.send_due_reminder_emails() to service_role;

-- Hourly. Re-running this file updates the job instead of adding a second one.
select cron.schedule('email-due-reminders', '0 * * * *', 'select public.send_due_reminder_emails()');
