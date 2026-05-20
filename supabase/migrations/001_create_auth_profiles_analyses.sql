create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  company_name text not null default '',
  role text not null default 'Diger',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_login_at timestamptz
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  analysis_type text not null,
  title text not null default '',
  customer_name text,
  customer_tax_number text,
  customer_nace_code text,
  customer_sector text,
  status text not null default 'Taslak',
  form_data jsonb not null default '{}'::jsonb,
  extracted_categories jsonb,
  results jsonb not null default '{"uygun":[],"potansiyel":[],"riskli":[]}'::jsonb,
  scores jsonb,
  eligible_count integer not null default 0,
  potential_count integer not null default 0,
  risky_count integer not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz
);

create table if not exists public.analysis_notes (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null,
  module text not null,
  entity_type text,
  entity_id uuid,
  description text not null,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analysis_documents (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null default 0,
  document_category text,
  created_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists analyses_set_updated_at on public.analyses;
create trigger analyses_set_updated_at
before update on public.analyses
for each row
execute function public.set_updated_at();

drop trigger if exists analysis_notes_set_updated_at on public.analysis_notes;
create trigger analysis_notes_set_updated_at
before update on public.analysis_notes
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    company_name,
    role,
    last_login_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'Diger'),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    company_name = excluded.company_name,
    role = excluded.role,
    last_login_at = excluded.last_login_at;

  return new;
end;
$$;

revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.analysis_notes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.analysis_documents enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.analyses to authenticated;
grant select, insert, update, delete on public.analysis_notes to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select, insert, update, delete on public.analysis_documents to authenticated;

create index if not exists analyses_user_id_updated_at_idx on public.analyses (user_id, updated_at desc);
create index if not exists analysis_notes_analysis_id_created_at_idx on public.analysis_notes (analysis_id, created_at desc);
create index if not exists analysis_notes_user_id_created_at_idx on public.analysis_notes (user_id, created_at desc);
create index if not exists activity_logs_user_id_created_at_idx on public.activity_logs (user_id, created_at desc);
create index if not exists analysis_documents_analysis_id_idx on public.analysis_documents (analysis_id);
create index if not exists analysis_documents_user_id_idx on public.analysis_documents (user_id);

create policy "Users can view own profile"
on public.profiles
for select
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
using ((select auth.uid()) = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check ((select auth.uid()) = id);

create policy "Users can view own analyses"
on public.analyses
for select
using ((select auth.uid()) = user_id);

create policy "Users can insert own analyses"
on public.analyses
for insert
with check ((select auth.uid()) = user_id);

create policy "Users can update own analyses"
on public.analyses
for update
using ((select auth.uid()) = user_id);

create policy "Users can delete own analyses"
on public.analyses
for delete
using ((select auth.uid()) = user_id);

create policy "Users can view own analysis notes"
on public.analysis_notes
for select
using ((select auth.uid()) = user_id);

create policy "Users can insert own analysis notes"
on public.analysis_notes
for insert
with check ((select auth.uid()) = user_id);

create policy "Users can update own analysis notes"
on public.analysis_notes
for update
using ((select auth.uid()) = user_id);

create policy "Users can delete own analysis notes"
on public.analysis_notes
for delete
using ((select auth.uid()) = user_id);

create policy "Users can view own activity logs"
on public.activity_logs
for select
using ((select auth.uid()) = user_id);

create policy "Users can insert own activity logs"
on public.activity_logs
for insert
with check ((select auth.uid()) = user_id);

create policy "Users can view own documents"
on public.analysis_documents
for select
using ((select auth.uid()) = user_id);

create policy "Users can insert own documents"
on public.analysis_documents
for insert
with check ((select auth.uid()) = user_id);

create policy "Users can update own documents"
on public.analysis_documents
for update
using ((select auth.uid()) = user_id);

create policy "Users can delete own documents"
on public.analysis_documents
for delete
using ((select auth.uid()) = user_id);
