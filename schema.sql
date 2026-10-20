-- Luvkaam Supabase schema
-- Run in Supabase SQL Editor. Keep the service-role key server-side only.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  email text not null,
  phone text not null,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_unique
  on public.profiles (lower(email));

create table if not exists public.consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (
    consent_type in ('privacy_notice_acknowledgement', 'promotional_communications')
  ),
  granted boolean not null,
  consent_version text not null,
  captured_at timestamptz not null default now(),
  source text not null default 'website_registration',
  withdrawn_at timestamptz
);

create index if not exists consent_events_user_type_time
  on public.consent_events (user_id, consent_type, captured_at desc);

alter table public.profiles enable row level security;
alter table public.consent_events enable row level security;

-- Users may read their own profile. Writes are performed by the server-side function.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Users may read their own consent history; consent writes remain server-side.
drop policy if exists "Users can read own consent history" on public.consent_events;
create policy "Users can read own consent history"
  on public.consent_events for select
  to authenticated
  using (auth.uid() = user_id);

-- Do not create public insert/update/delete policies. The server function uses the
-- Supabase service-role key stored as a Cloudflare secret, never in browser code.
