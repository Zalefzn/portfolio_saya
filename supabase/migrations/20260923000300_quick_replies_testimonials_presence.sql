-- Quick replies for the admin, testimonials managed from /admin/, and an
-- "owner is online" presence channel that only admins can broadcast on.

-- ---------------------------------------------------------- quick replies

create table public.chat_quick_replies (
  id bigint generated always as identity primary key,
  title text not null check (char_length(btrim(title)) between 1 and 60),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.chat_quick_replies enable row level security;

create policy "admins manage quick replies"
  on public.chat_quick_replies for all
  to authenticated
  using ((select public.is_chat_admin()))
  with check ((select public.is_chat_admin()));

revoke all on public.chat_quick_replies from anon;
grant select, insert, update, delete on public.chat_quick_replies to authenticated;

insert into public.chat_quick_replies (title, body, sort) values
  ('Salam pembuka', 'Halo, terima kasih sudah menghubungi saya! Boleh ceritakan sedikit tentang proyek yang ingin dibuat?', 1),
  ('Minta detail', 'Supaya estimasinya akurat, boleh dibagikan fitur utama yang dibutuhkan, target waktu, dan kisaran budget?', 2),
  ('Jadwalkan call', 'Bagaimana kalau kita diskusi lewat call/Google Meet? Silakan pilih waktu yang cocok untuk Anda.', 3),
  ('Kirim proposal', 'Terima kasih atas detailnya. Saya siapkan proposal dan estimasi, lalu saya kirim ke email Anda dalam 1–2 hari kerja.', 4);

-- ----------------------------------------------------------- testimonials

create table public.testimonials (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  role text check (role is null or char_length(role) <= 120),
  quote text not null check (char_length(btrim(quote)) between 1 and 1000),
  is_published boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "everyone reads published testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (is_published or (select public.is_chat_admin()));

create policy "admins add testimonials"
  on public.testimonials for insert
  to authenticated
  with check ((select public.is_chat_admin()));

create policy "admins edit testimonials"
  on public.testimonials for update
  to authenticated
  using ((select public.is_chat_admin()))
  with check ((select public.is_chat_admin()));

create policy "admins delete testimonials"
  on public.testimonials for delete
  to authenticated
  using ((select public.is_chat_admin()));

grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;

-- is_chat_admin() is evaluated for signed-out readers too
grant execute on function public.is_chat_admin() to anon;

-- ---------------------------------------------------------- owner presence
-- Private Realtime channel "owner-presence": any signed-in visitor may
-- listen, only admins may track (so nobody can fake the online badge).

create policy "visitors see the owner's presence"
  on realtime.messages for select
  to authenticated
  -- joining a private channel checks read access for broadcast as well
  using (realtime.topic() = 'owner-presence' and realtime.messages.extension in ('broadcast', 'presence'));

create policy "only admins announce presence"
  on realtime.messages for insert
  to authenticated
  with check (
    realtime.topic() = 'owner-presence'
    and realtime.messages.extension = 'presence'
    and (select public.is_chat_admin())
  );
