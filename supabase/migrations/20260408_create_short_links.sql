create table if not exists public.short_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  original_url text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists short_links_slug_idx
  on public.short_links (slug);

create index if not exists short_links_user_created_at_idx
  on public.short_links (user_id, created_at desc);

alter table public.short_links enable row level security;

-- Anyone can look up a slug (needed for redirect)
create policy "Anyone can read short links by slug"
  on public.short_links
  for select
  using (true);

create policy "Users can insert their own short links"
  on public.short_links
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own short links"
  on public.short_links
  for delete
  using (auth.uid() = user_id);
