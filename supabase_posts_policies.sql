-- RLS policies for linkedin_posts (prototype / development)
-- Run this in the Supabase SQL Editor for project mgsdwstoacgkonwyvqpx
-- Covers both anon (logged-out) and authenticated (logged-in) roles.

alter table public.linkedin_posts enable row level security;

drop policy if exists "Prototype anon can read linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype anon can insert linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype anon can update linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype anon can delete linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype authenticated can read linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype authenticated can insert linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype authenticated can update linkedin posts" on public.linkedin_posts;
drop policy if exists "Prototype authenticated can delete linkedin posts" on public.linkedin_posts;

-- Allow all reads (anon + authenticated)
create policy "Prototype anon can read linkedin posts"
on public.linkedin_posts for select to anon using (true);

create policy "Prototype authenticated can read linkedin posts"
on public.linkedin_posts for select to authenticated using (true);

-- Allow all writes (anon + authenticated)
create policy "Prototype anon can insert linkedin posts"
on public.linkedin_posts for insert to anon with check (true);

create policy "Prototype authenticated can insert linkedin posts"
on public.linkedin_posts for insert to authenticated with check (true);

create policy "Prototype anon can update linkedin posts"
on public.linkedin_posts for update to anon using (true) with check (true);

create policy "Prototype authenticated can update linkedin posts"
on public.linkedin_posts for update to authenticated using (true) with check (true);

create policy "Prototype anon can delete linkedin posts"
on public.linkedin_posts for delete to anon using (true);

create policy "Prototype authenticated can delete linkedin posts"
on public.linkedin_posts for delete to authenticated using (true);
