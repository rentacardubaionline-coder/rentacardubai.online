-- SEO reference tables: cities, towns, routes, vehicle_categories
-- These power the 14K+ indexed landing pages (keyword × city × town × model × route combos)

-- ══════════════════════════════════════════════════
-- CITIES
-- ══════════════════════════════════════════════════
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  province text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.cities enable row level security;
create policy "Public can read cities" on public.cities for select using (true);
create policy "Admin can write cities" on public.cities for insert with check (public.is_admin(auth.uid()));
create policy "Admin can update cities" on public.cities for update using (public.is_admin(auth.uid()));

create index idx_cities_slug on public.cities(slug);
create index idx_cities_active on public.cities(is_active) where is_active = true;

-- ══════════════════════════════════════════════════
-- TOWNS
-- ══════════════════════════════════════════════════
create table if not exists public.towns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  city_id uuid not null references public.cities(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(slug, city_id)
);

alter table public.towns enable row level security;
create policy "Public can read towns" on public.towns for select using (true);
create policy "Admin can write towns" on public.towns for insert with check (public.is_admin(auth.uid()));
create policy "Admin can update towns" on public.towns for update using (public.is_admin(auth.uid()));

create index idx_towns_city_id on public.towns(city_id);
create index idx_towns_slug on public.towns(slug);

-- ══════════════════════════════════════════════════
-- ROUTES (intercity)
-- ══════════════════════════════════════════════════
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  origin_city_id uuid not null references public.cities(id) on delete cascade,
  destination_city_id uuid not null references public.cities(id) on delete cascade,
  distance_km int,
  estimated_time text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.routes enable row level security;
create policy "Public can read routes" on public.routes for select using (true);
create policy "Admin can write routes" on public.routes for insert with check (public.is_admin(auth.uid()));
create policy "Admin can update routes" on public.routes for update using (public.is_admin(auth.uid()));

create index idx_routes_slug on public.routes(slug);
create index idx_routes_origin on public.routes(origin_city_id);
create index idx_routes_destination on public.routes(destination_city_id);

-- ══════════════════════════════════════════════════
-- VEHICLE CATEGORIES
-- ══════════════════════════════════════════════════
create table if not exists public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

alter table public.vehicle_categories enable row level security;
create policy "Public can read vehicle_categories" on public.vehicle_categories for select using (true);
create policy "Admin can write vehicle_categories" on public.vehicle_categories for insert with check (public.is_admin(auth.uid()));

create index idx_vehicle_categories_slug on public.vehicle_categories(slug);

-- ══════════════════════════════════════════════════
-- Relax listings city constraint (was hardcoded to 3 cities)
-- ══════════════════════════════════════════════════
alter table public.listings drop constraint if exists listings_city_check;
