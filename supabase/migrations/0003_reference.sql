-- Reference data tables: makes, models, vehicle_features
-- These are populated via scripts/sync-reference-data.ts from an external API

create table public.makes (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamp with time zone default now()
);

create table public.models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid not null references public.makes(id) on delete cascade,
  external_id text unique,
  name text not null,
  slug text not null,
  body_type text,
  created_at timestamp with time zone default now(),
  unique(make_id, name)
);

create table public.vehicle_features (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null unique,
  slug text not null unique,
  icon_url text,
  "group" text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.makes enable row level security;
alter table public.models enable row level security;
alter table public.vehicle_features enable row level security;

-- RLS: public can read; only admin can write
create policy "Public can read makes" on public.makes
  for select using (true);

create policy "Admin can write makes" on public.makes
  for insert
  with check (public.is_admin(auth.uid()));

create policy "Admin can update makes" on public.makes
  for update
  using (public.is_admin(auth.uid()));

create policy "Public can read models" on public.models
  for select using (true);

create policy "Admin can write models" on public.models
  for insert
  with check (public.is_admin(auth.uid()));

create policy "Admin can update models" on public.models
  for update
  using (public.is_admin(auth.uid()));

create policy "Public can read features" on public.vehicle_features
  for select using (true);

create policy "Admin can write features" on public.vehicle_features
  for insert
  with check (public.is_admin(auth.uid()));

create policy "Admin can update features" on public.vehicle_features
  for update
  using (public.is_admin(auth.uid()));

-- Indexes
create index idx_makes_slug on public.makes(slug);
create index idx_models_make_id on public.models(make_id);
create index idx_models_slug on public.models(slug);
create index idx_features_slug on public.vehicle_features(slug);
