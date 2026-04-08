-- Make user_id nullable so anonymous users can create short links
alter table public.short_links alter column user_id drop not null;

-- Drop the old insert policy that required auth
drop policy if exists "Users can insert their own short links" on public.short_links;

-- Allow anyone to insert (user_id can be null for anonymous)
create policy "Anyone can insert short links"
  on public.short_links
  for insert
  with check (true);
