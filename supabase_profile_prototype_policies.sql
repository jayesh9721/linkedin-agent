-- Use this only for the current no-login prototype.
-- It lets the browser anon key read and write linkedin_profiles.
-- Replace this with authenticated user policies before production.

drop policy if exists "Prototype anon can read linkedin profiles" on public.linkedin_profiles;
drop policy if exists "Prototype anon can insert linkedin profiles" on public.linkedin_profiles;
drop policy if exists "Prototype anon can update linkedin profiles" on public.linkedin_profiles;
drop policy if exists "Prototype anon can delete linkedin profiles" on public.linkedin_profiles;

create policy "Prototype anon can read linkedin profiles"
on public.linkedin_profiles
for select
to anon
using (true);

create policy "Prototype anon can insert linkedin profiles"
on public.linkedin_profiles
for insert
to anon
with check (true);

create policy "Prototype anon can update linkedin profiles"
on public.linkedin_profiles
for update
to anon
using (true)
with check (true);

create policy "Prototype anon can delete linkedin profiles"
on public.linkedin_profiles
for delete
to anon
using (true);
