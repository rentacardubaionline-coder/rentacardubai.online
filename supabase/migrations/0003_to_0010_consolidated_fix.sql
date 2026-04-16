-- =============================================================================
-- CONSOLIDATED MIGRATION FIX: 0001 → 0010
-- Safe to run multiple times (idempotent).
-- Run this entire block in the Supabase SQL Editor.
-- =============================================================================


-- =============================================================================
-- 0001: Enums, profiles table, new-user trigger
-- =============================================================================

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'vendor', 'admin');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'active_mode') then
    create type public.active_mode as enum ('customer', 'vendor');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  active_mode public.active_mode,
  is_vendor boolean not null default false,
  lead_rate_pkr integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "Users can read own profile" on public.profiles
    for select using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update any profile" on public.profiles
    for update using ((select role from public.profiles where id = auth.uid()) = 'admin');
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, active_mode, is_vendor)
  values (new.id, new.email, 'customer'::public.user_role, 'customer'::public.active_mode, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================================
-- 0002: Helper functions (is_admin / is_vendor) + extra profiles policy
-- =============================================================================

create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select (select role from public.profiles where id = user_id) = 'admin'::public.user_role;
$$ language sql;

create or replace function public.is_vendor(user_id uuid)
returns boolean as $$
  select coalesce((select is_vendor from public.profiles where id = user_id), false);
$$ language sql;

do $$ begin
  create policy "Users can update own active_mode" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 0003: Reference data tables
-- =============================================================================

create table if not exists public.makes (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid not null references public.makes(id) on delete cascade,
  external_id text unique,
  name text not null,
  slug text not null,
  body_type text,
  created_at timestamp with time zone default now(),
  unique(make_id, name)
);

create table if not exists public.vehicle_features (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null unique,
  slug text not null unique,
  icon_url text,
  "group" text,
  created_at timestamp with time zone default now()
);

alter table public.makes enable row level security;
alter table public.models enable row level security;
alter table public.vehicle_features enable row level security;

do $$ begin
  create policy "Public can read makes" on public.makes for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can write makes" on public.makes for insert with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update makes" on public.makes for update using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read models" on public.models for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can write models" on public.models for insert with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update models" on public.models for update using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read features" on public.vehicle_features for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can write features" on public.vehicle_features for insert with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update features" on public.vehicle_features for update using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

create index if not exists idx_makes_slug on public.makes(slug);
create index if not exists idx_models_make_id on public.models(make_id);
create index if not exists idx_models_slug on public.models(slug);
create index if not exists idx_features_slug on public.vehicle_features(slug);


-- =============================================================================
-- 0004: Businesses, listings, and related tables
-- =============================================================================

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id) on delete set null,
  name text not null unique,
  slug text not null unique,
  phone text,
  whatsapp_phone text,
  email text,
  address_line text,
  city text not null,
  lat float8,
  lng float8,
  cover_url text,
  rating float4 default 4.0,
  reviews_count int default 0,
  claim_status text default 'unclaimed' check (claim_status in ('unclaimed', 'pending', 'claimed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  model_id uuid references public.models(id) on delete set null,
  slug text not null unique,
  year int,
  title text not null,
  description text,
  city text not null check (city in ('Karachi', 'Lahore', 'Islamabad')),
  transmission text check (transmission in ('manual', 'automatic')),
  fuel text check (fuel in ('petrol', 'diesel', 'hybrid')),
  seats int,
  color text,
  mileage_km int,
  status text default 'approved' check (status in ('draft', 'pending', 'approved', 'rejected', 'unavailable')),
  rejection_reason text,
  primary_image_url text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  cloudinary_public_id text unique,
  url text not null,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.listing_features (
  listing_id uuid not null references public.listings(id) on delete cascade,
  feature_id uuid not null references public.vehicle_features(id) on delete cascade,
  primary key (listing_id, feature_id),
  created_at timestamp with time zone default now()
);

create table if not exists public.listing_pricing (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  tier text not null check (tier in ('daily', 'weekly', 'monthly')),
  price_pkr int not null,
  min_hours int,
  included_km_per_day int default 100,
  extra_km_rate_pkr int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(listing_id, tier)
);

create table if not exists public.listing_modes (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  mode text not null check (mode in ('with_driver', 'self_drive')),
  surcharge_pkr int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.listing_policies (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  deposit_pkr int,
  min_age int default 21,
  license_required boolean default true,
  cancellation_text text,
  delivery_available boolean default false,
  delivery_fee_pkr int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.businesses enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_features enable row level security;
alter table public.listing_pricing enable row level security;
alter table public.listing_modes enable row level security;
alter table public.listing_policies enable row level security;

-- businesses policies
do $$ begin
  create policy "Public can read businesses" on public.businesses for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owner can update business" on public.businesses for update
    using (auth.uid() = owner_user_id or public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can insert businesses" on public.businesses for insert
    with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update claim status" on public.businesses for update
    using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listings policies
do $$ begin
  create policy "Public can read approved listings" on public.listings
    for select using (status = 'approved');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can read own listings" on public.listings for select using (
    business_id in (select b.id from public.businesses b where b.owner_user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can read all listings" on public.listings
    for select using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can insert listings" on public.listings for insert with check (
    business_id in (select b.id from public.businesses b where b.owner_user_id = auth.uid())
    and status != 'approved'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can update own listings" on public.listings for update
    using (business_id in (select b.id from public.businesses b where b.owner_user_id = auth.uid()))
    with check (
      business_id in (select b.id from public.businesses b where b.owner_user_id = auth.uid())
      and status != 'approved'
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can crud listings" on public.listings
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listing_images policies
do $$ begin
  create policy "Public can read images of approved listings" on public.listing_images for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can read own listing images" on public.listing_images for select using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can write own listing images" on public.listing_images for insert with check (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can crud listing images" on public.listing_images
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listing_features policies
do $$ begin
  create policy "Public can read features of approved listings" on public.listing_features for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can manage features of own listings" on public.listing_features for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage all features" on public.listing_features
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listing_pricing policies
do $$ begin
  create policy "Public can read pricing of approved listings" on public.listing_pricing for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can manage pricing of own listings" on public.listing_pricing for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage all pricing" on public.listing_pricing
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listing_modes policies
do $$ begin
  create policy "Public can read modes of approved listings" on public.listing_modes for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can manage modes of own listings" on public.listing_modes for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage all modes" on public.listing_modes
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- listing_policies policies
do $$ begin
  create policy "Public can read policies of approved listings" on public.listing_policies for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can manage policies of own listings" on public.listing_policies for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage all policies" on public.listing_policies
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- Indexes
create index if not exists idx_businesses_city on public.businesses(city);
create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_businesses_owner_user_id on public.businesses(owner_user_id);
create index if not exists idx_listings_business_id on public.listings(business_id);
create index if not exists idx_listings_city on public.listings(city);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_status_city on public.listings(status, city);
create index if not exists idx_listings_model_id on public.listings(model_id);
create index if not exists idx_listings_slug on public.listings(slug);
create index if not exists idx_listing_images_listing_id on public.listing_images(listing_id);
create index if not exists idx_listing_pricing_listing_id on public.listing_pricing(listing_id);
create index if not exists idx_listing_modes_listing_id on public.listing_modes(listing_id);
create index if not exists idx_listing_policies_listing_id on public.listing_policies(listing_id);


-- =============================================================================
-- 0005: Vendor reviews + rating trigger
-- =============================================================================

create table if not exists public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_vendor_reviews_business_id on public.vendor_reviews(business_id);
create index if not exists idx_vendor_reviews_created_at on public.vendor_reviews(created_at desc);

alter table public.vendor_reviews enable row level security;

do $$ begin
  create policy "Public can read vendor reviews" on public.vendor_reviews
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can insert vendor reviews" on public.vendor_reviews
    for insert with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update vendor reviews" on public.vendor_reviews
    for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can delete vendor reviews" on public.vendor_reviews
    for delete using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

create or replace function public.recompute_business_rating(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count int;
begin
  select coalesce(avg(rating), 0), count(*)
    into v_avg, v_count
    from public.vendor_reviews
    where business_id = p_business_id;

  update public.businesses
    set rating = round(v_avg::numeric, 1),
        reviews_count = v_count,
        updated_at = now()
    where id = p_business_id;
end;
$$;

create or replace function public.vendor_reviews_sync_business()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_business_rating(old.business_id);
    return old;
  else
    perform public.recompute_business_rating(new.business_id);
    if tg_op = 'UPDATE' and old.business_id is distinct from new.business_id then
      perform public.recompute_business_rating(old.business_id);
    end if;
    return new;
  end if;
end;
$$;

drop trigger if exists trg_vendor_reviews_sync on public.vendor_reviews;
create trigger trg_vendor_reviews_sync
  after insert or update or delete on public.vendor_reviews
  for each row execute function public.vendor_reviews_sync_business();


-- =============================================================================
-- 0006: Business detail columns + business_images + business_reviews
-- =============================================================================

alter table public.businesses
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists website_url text,
  add column if not exists established_year int4,
  add column if not exists total_fleet_count int4 default 0,
  add column if not exists working_hours jsonb,
  add column if not exists languages text[] default '{}',
  add column if not exists google_place_id text,
  add column if not exists google_maps_url text;

create table if not exists public.business_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  cloudinary_public_id text unique,
  url text not null,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reviewer_name text not null,
  reviewer_avatar_url text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table public.business_images enable row level security;
alter table public.business_reviews enable row level security;

do $$ begin
  create policy "Public can read business images" on public.business_images
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Owner/Admin can manage business images" on public.business_images for all using (
    business_id in (select id from public.businesses where owner_user_id = auth.uid())
    or public.is_admin(auth.uid())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read business reviews" on public.business_reviews
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage business reviews" on public.business_reviews
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

create index if not exists idx_business_images_business_id on public.business_images(business_id);
create index if not exists idx_business_reviews_business_id on public.business_reviews(business_id);


-- =============================================================================
-- 0007: Leads table
-- =============================================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  vendor_user_id uuid references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'call')),
  source text,
  created_at timestamp with time zone default now()
);

alter table public.leads enable row level security;

do $$ begin
  create policy "Vendor can read own leads" on public.leads
    for select using (vendor_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can read all leads" on public.leads
    for select using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Anyone can insert a lead" on public.leads
    for insert with check (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_leads_vendor_user_id on public.leads(vendor_user_id);
create index if not exists idx_leads_listing_id on public.leads(listing_id);
create index if not exists idx_leads_created_at on public.leads(created_at desc);


-- =============================================================================
-- 0008: Business claims + extra business policies for vendors
-- =============================================================================

do $$ begin
  create policy "Vendor can insert own business" on public.businesses for insert with check (
    owner_user_id = auth.uid()
    and claim_status = 'pending'
    and public.is_vendor(auth.uid())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can update own business" on public.businesses for update
    using (owner_user_id = auth.uid() and public.is_vendor(auth.uid()))
    with check (owner_user_id = auth.uid());
exception when duplicate_object then null; end $$;

create table if not exists public.business_claims (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  claimant_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(business_id, claimant_user_id)
);

alter table public.business_claims enable row level security;

do $$ begin
  create policy "Claimant can read own claims" on public.business_claims
    for select using (claimant_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Claimant can insert claim" on public.business_claims
    for insert with check (claimant_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can manage all claims" on public.business_claims
    for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

create index if not exists idx_business_claims_business_id on public.business_claims(business_id);
create index if not exists idx_business_claims_claimant on public.business_claims(claimant_user_id);
create index if not exists idx_business_claims_status on public.business_claims(status);


-- =============================================================================
-- 0009: Category column on businesses
-- =============================================================================

alter table public.businesses add column if not exists category text;
create index if not exists idx_businesses_category on public.businesses(category);


-- =============================================================================
-- 0010: Enable Realtime
-- =============================================================================

do $$ begin
  alter publication supabase_realtime add table public.businesses;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.business_claims;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.listings;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.vendor_reviews;
exception when others then null; end $$;
