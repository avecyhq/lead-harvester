-- Create scrape_batches table
create table if not exists public.scrape_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  category text,
  cities text[],
  pages int
);

-- Add user_id and batch_id to leads table if not present
alter table public.leads
  add column if not exists user_id uuid references auth.users not null,
  add column if not exists batch_id uuid references public.scrape_batches(id);

-- Enable RLS
alter table public.leads enable row level security;
alter table public.scrape_batches enable row level security;

-- Policy: Only allow users to access their own leads
create policy "Users can access their own leads"
on public.leads for all
using (user_id = auth.uid());

-- Policy: Only allow users to access their own batches
create policy "Users can access their own batches"
on public.scrape_batches for all
using (user_id = auth.uid());
