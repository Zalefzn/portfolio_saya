-- Live chat between portfolio visitors and the site owner.
--
-- Visitors sign in anonymously (Supabase Auth) and each one gets a single
-- conversation they alone can read. The owner is a normal email/password
-- user listed in chat_admins and can read and reply to every conversation.
-- New visitor messages are pushed to the owner's devices by the
-- notify-admin Edge Function (see the trigger at the bottom).

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------- admins

create table public.chat_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.chat_admins enable row level security;

create policy "admins can see themselves"
  on public.chat_admins for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_chat_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.chat_admins where user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------- conversations

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null unique default auth.uid()
    references auth.users (id) on delete cascade,
  visitor_name text not null check (char_length(btrim(visitor_name)) between 1 and 80),
  visitor_email text check (visitor_email is null or char_length(visitor_email) <= 200),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  admin_unread integer not null default 0,
  visitor_unread integer not null default 0
);

create index conversations_last_message_at_idx
  on public.conversations (last_message_at desc);

alter table public.conversations enable row level security;

create policy "visitors read their conversation, admins read all"
  on public.conversations for select
  to authenticated
  using (visitor_id = (select auth.uid()) or (select public.is_chat_admin()));

create policy "visitors open their own conversation"
  on public.conversations for insert
  to authenticated
  with check (visitor_id = (select auth.uid()));

-- counters and previews are maintained by triggers / mark_conversation_read,
-- so nobody updates conversations directly
create policy "admins can delete conversations"
  on public.conversations for delete
  to authenticated
  using ((select public.is_chat_admin()));

-- --------------------------------------------------------------- messages

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender text not null check (sender in ('visitor', 'admin')),
  sender_id uuid not null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create index messages_sender_created_idx
  on public.messages (sender_id, created_at);

alter table public.messages enable row level security;

create policy "participants read messages"
  on public.messages for select
  to authenticated
  using (
    (select public.is_chat_admin())
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.visitor_id = (select auth.uid())
    )
  );

create policy "visitors write in their own conversation"
  on public.messages for insert
  to authenticated
  with check (
    sender = 'visitor'
    and sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.visitor_id = (select auth.uid())
    )
  );

create policy "admins reply anywhere"
  on public.messages for insert
  to authenticated
  with check (
    sender = 'admin'
    and sender_id = (select auth.uid())
    and (select public.is_chat_admin())
  );

-- simple flood protection: at most 10 messages per sender per minute
create or replace function public.messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.messages
    where sender_id = new.sender_id
      and created_at > now() - interval '1 minute'
  ) >= 10 then
    raise exception 'Too many messages, please wait a moment.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- keep the conversation preview and unread counters in sync
create or replace function public.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(new.body, 140),
      admin_unread = admin_unread + case when new.sender = 'visitor' then 1 else 0 end,
      visitor_unread = visitor_unread + case when new.sender = 'admin' then 1 else 0 end
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.messages_after_insert();

-- the caller's side of the conversation is now read
create or replace function public.mark_conversation_read(conversation uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.is_chat_admin()) then
    update public.conversations set admin_unread = 0 where id = conversation;
  else
    update public.conversations set visitor_unread = 0
    where id = conversation and visitor_id = (select auth.uid());
  end if;
end;
$$;

revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ------------------------------------------------------ push subscriptions

create table public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "admins manage their own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = (select auth.uid()) and (select public.is_chat_admin()))
  with check (user_id = (select auth.uid()) and (select public.is_chat_admin()));

-- ---------------------------------------------------------------- grants
-- explicit, so the chat does not depend on the project's default privileges;
-- signed-out requests (anon) get nothing, RLS narrows what authenticated sees

revoke all on public.chat_admins, public.conversations, public.messages, public.push_subscriptions from anon;
grant select on public.chat_admins to authenticated;
grant select, insert, delete on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant execute on function public.is_chat_admin() to authenticated;
-- the notify-admin Edge Function (service_role) reads names and subscriptions
grant select on public.conversations to service_role;
grant select, delete on public.push_subscriptions to service_role;

-- -------------------------------------------------------------- realtime

alter publication supabase_realtime add table public.messages, public.conversations;

-- ------------------------------------------------- push notification hook
--
-- Calls the notify-admin Edge Function for every visitor message. The URL
-- and shared secret live in Vault (set once after deploying the function):
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1/notify-admin', 'chat_notify_url');
--   select vault.create_secret('<random secret>', 'chat_webhook_secret');
-- Until both exist the trigger does nothing, so chat keeps working.

create or replace function public.notify_admin_of_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fn_url text;
  fn_secret text;
begin
  if new.sender <> 'visitor' then
    return new;
  end if;

  select decrypted_secret into fn_url
  from vault.decrypted_secrets where name = 'chat_notify_url';
  select decrypted_secret into fn_secret
  from vault.decrypted_secrets where name = 'chat_webhook_secret';

  if fn_url is null or fn_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := fn_url,
    body := jsonb_build_object('record', to_jsonb(new)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', fn_secret
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

create trigger messages_notify_admin
  after insert on public.messages
  for each row execute function public.notify_admin_of_message();
