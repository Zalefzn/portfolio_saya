-- Visitors must leave a way to be reached before starting a chat.
-- NOT VALID: enforced for every new conversation, older rows are left as-is.

alter table public.conversations
  add column visitor_phone text,
  add column topic text;

alter table public.conversations
  add constraint conversations_contact_required check (
    -- explicit not-nulls: a regex against NULL yields NULL, which CHECK lets through
    visitor_email is not null and visitor_phone is not null and topic is not null
    and visitor_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and visitor_phone ~ '^\+?[0-9 ()-]{8,20}$'
    and topic in ('website', 'mobile_app', 'system', 'other')
  ) not valid;
