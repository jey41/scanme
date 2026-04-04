create table if not exists public.qr_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('generated', 'decoded', 'scanned', 'downloaded')),
  content text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists qr_history_user_created_at_idx
  on public.qr_history (user_id, created_at desc);

alter table public.qr_history enable row level security;

create policy "Users can read their own qr history"
  on public.qr_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own qr history"
  on public.qr_history
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own qr history"
  on public.qr_history
  for delete
  using (auth.uid() = user_id);
