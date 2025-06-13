-- Migration: Initial schema for users, leads, and batches tables with RLS policies

-- 1. Users table (extends Supabase Auth)
create table if not exists users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  credits integer default 0,
  created_at timestamp with time zone default now()
);

-- 2. Leads table
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  batch_id uuid not null,
  business_name text not null,
  business_type text,
  address text,
  city text,
  state text,
  phone text,
  website text,
  google_rating numeric,
  review_count integer,
  google_maps_link text,
  owner_name text,
  personal_email text,
  generic_email text,
  linkedin_url text,
  facebook_url text,
  instagram_url text,
  email_verified boolean default false,
  verification_source text,
  enrichment_source text,
  created_at timestamp with time zone default now()
);

-- 3. Batches table
create table if not exists batches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  business_category text not null,
  location text not null,
  lead_count integer default 0,
  created_at timestamp with time zone default now()
);

-- 4. Enable Row Level Security (RLS)
alter table users enable row level security;
alter table leads enable row level security;
alter table batches enable row level security;

-- 5. RLS Policies
-- Users can only read/update their own user row
create policy "Users can manage own row" on users
  for all using (auth.uid() = id);

-- Users can only read/write their own leads
create policy "Users can manage own leads" on leads
  for all using (auth.uid() = user_id);

-- Users can only read/write their own batches
create policy "Users can manage own batches" on batches
  for all using (auth.uid() = user_id); 