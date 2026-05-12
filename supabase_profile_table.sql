create table if not exists public.linkedin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text not null,
  industry text,
  website text,
  brand_tone text,
  target_audience text,
  services text[] default '{}',
  company_description text,
  linkedin_company_page_url text,
  linkedin_profile_url text,
  access_token text,
  token_expires_on timestamptz,
  permissions text[] default '{}',
  logo_text text,
  cover_image_url text,
  brand_colors text[] default '{}',
  writing_style text,
  memory_brand_tone text,
  preferred_cta_style text,
  keywords text[] default '{}',
  competitors text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists linkedin_profiles_user_id_idx
  on public.linkedin_profiles(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_linkedin_profiles_updated_at on public.linkedin_profiles;

create trigger set_linkedin_profiles_updated_at
before update on public.linkedin_profiles
for each row
execute function public.set_updated_at();

alter table public.linkedin_profiles enable row level security;

create policy "Users can read their own linkedin profile"
on public.linkedin_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own linkedin profile"
on public.linkedin_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own linkedin profile"
on public.linkedin_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own linkedin profile"
on public.linkedin_profiles
for delete
using (auth.uid() = user_id);
