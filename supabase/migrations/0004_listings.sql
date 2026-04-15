-- Listings schema: businesses, listings, and related tables
-- Core data model for the marketplace. Supports multiple rental modes, pricing tiers, and policies per listing.

-- Businesses table: vendor organizations that own listings
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id) on delete set null,
  name text not null unique,
  slug text not null unique,
  phone text, -- E.164 format
  whatsapp_phone text, -- E.164 format, may differ from phone
  email text,
  address_line text,
  city text not null, -- 'Karachi', 'Lahore', 'Islamabad'
  lat float8,
  lng float8,
  cover_url text, -- Cloudinary URL
  rating float4 default 4.0,
  reviews_count int default 0,
  claim_status text default 'unclaimed' check (claim_status in ('unclaimed', 'pending', 'claimed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Listings table: individual vehicles for rent
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  model_id uuid references public.models(id) on delete set null, -- foreign key to reference data
  slug text not null unique, -- format: <make>-<model>-<year>-<6char-hash>
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
  primary_image_url text, -- Cloudinary URL
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Listing images: multiple images per listing
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  cloudinary_public_id text unique,
  url text not null,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Listing features: junction table between listings and vehicle_features
create table public.listing_features (
  listing_id uuid not null references public.listings(id) on delete cascade,
  feature_id uuid not null references public.vehicle_features(id) on delete cascade,
  primary key (listing_id, feature_id),
  created_at timestamp with time zone default now()
);

-- Listing pricing: daily/weekly/monthly rates
create table public.listing_pricing (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  tier text not null check (tier in ('daily', 'weekly', 'monthly')),
  price_pkr int not null,
  min_hours int, -- minimum rental period in hours
  included_km_per_day int default 100,
  extra_km_rate_pkr int, -- cost per extra km
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(listing_id, tier)
);

-- Listing modes: rental modes (self-drive vs with-driver) and any surcharges
create table public.listing_modes (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  mode text not null check (mode in ('with_driver', 'self_drive')),
  surcharge_pkr int default 0,
  created_at timestamp with time zone default now()
);

-- Listing policies: deposit, age requirement, cancellation policy, etc.
create table public.listing_policies (
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

-- Enable RLS on all tables
alter table public.businesses enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_features enable row level security;
alter table public.listing_pricing enable row level security;
alter table public.listing_modes enable row level security;
alter table public.listing_policies enable row level security;

-- RLS Policies: businesses
-- Public can read all businesses
create policy "Public can read businesses" on public.businesses
  for select using (true);

-- Owner or admin can update their business
create policy "Owner can update business" on public.businesses
  for update using (
    auth.uid() = owner_user_id or public.is_admin(auth.uid())
  );

-- Admin can insert businesses (for CSV import)
create policy "Admin can insert businesses" on public.businesses
  for insert with check (public.is_admin(auth.uid()));

-- Only admin can update claim_status
create policy "Admin can update claim status" on public.businesses
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- RLS Policies: listings
-- Public can read only approved listings
create policy "Public can read approved listings" on public.listings
  for select using (status = 'approved');

-- Vendor can read their own listings (regardless of status)
create policy "Vendor can read own listings" on public.listings
  for select using (
    business_id in (
      select b.id from public.businesses b where b.owner_user_id = auth.uid()
    )
  );

-- Admin can read all listings
create policy "Admin can read all listings" on public.listings
  for select using (public.is_admin(auth.uid()));

-- Vendor can create listings for their business
create policy "Vendor can insert listings" on public.listings
  for insert with check (
    business_id in (
      select b.id from public.businesses b where b.owner_user_id = auth.uid()
    )
    and status != 'approved' -- vendor cannot directly approve
  );

-- Vendor can update their own listings (except status)
create policy "Vendor can update own listings" on public.listings
  for update using (
    business_id in (
      select b.id from public.businesses b where b.owner_user_id = auth.uid()
    )
  ) with check (
    business_id in (
      select b.id from public.businesses b where b.owner_user_id = auth.uid()
    )
    and status != 'approved' -- vendor cannot change to approved
  );

-- Admin has full access to listings
create policy "Admin can crud listings" on public.listings
  for all using (public.is_admin(auth.uid()));

-- RLS Policies: listing_images (inherit from parent listing)
-- Public can read images of approved listings
create policy "Public can read images of approved listings" on public.listing_images
  for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );

-- Vendor can read/write images of their own listings
create policy "Vendor can read own listing images" on public.listing_images
  for select using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

create policy "Vendor can write own listing images" on public.listing_images
  for insert with check (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

-- Admin has full access
create policy "Admin can crud listing images" on public.listing_images
  for all using (public.is_admin(auth.uid()));

-- RLS Policies: listing_features (inherit from parent listing)
create policy "Public can read features of approved listings" on public.listing_features
  for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );

create policy "Vendor can manage features of own listings" on public.listing_features
  for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

create policy "Admin can manage all features" on public.listing_features
  for all using (public.is_admin(auth.uid()));

-- RLS Policies: listing_pricing (inherit from parent listing)
create policy "Public can read pricing of approved listings" on public.listing_pricing
  for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );

create policy "Vendor can manage pricing of own listings" on public.listing_pricing
  for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

create policy "Admin can manage all pricing" on public.listing_pricing
  for all using (public.is_admin(auth.uid()));

-- RLS Policies: listing_modes (inherit from parent listing)
create policy "Public can read modes of approved listings" on public.listing_modes
  for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );

create policy "Vendor can manage modes of own listings" on public.listing_modes
  for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

create policy "Admin can manage all modes" on public.listing_modes
  for all using (public.is_admin(auth.uid()));

-- RLS Policies: listing_policies (inherit from parent listing)
create policy "Public can read policies of approved listings" on public.listing_policies
  for select using (
    listing_id in (select id from public.listings where status = 'approved')
  );

create policy "Vendor can manage policies of own listings" on public.listing_policies
  for all using (
    listing_id in (
      select l.id from public.listings l
      join public.businesses b on l.business_id = b.id
      where b.owner_user_id = auth.uid()
    )
  );

create policy "Admin can manage all policies" on public.listing_policies
  for all using (public.is_admin(auth.uid()));

-- Indexes for search performance
create index idx_businesses_city on public.businesses(city);
create index idx_businesses_slug on public.businesses(slug);
create index idx_businesses_owner_user_id on public.businesses(owner_user_id);

create index idx_listings_business_id on public.listings(business_id);
create index idx_listings_city on public.listings(city);
create index idx_listings_status on public.listings(status);
create index idx_listings_status_city on public.listings(status, city);
create index idx_listings_model_id on public.listings(model_id);
create index idx_listings_slug on public.listings(slug);

create index idx_listing_images_listing_id on public.listing_images(listing_id);
create index idx_listing_pricing_listing_id on public.listing_pricing(listing_id);
create index idx_listing_modes_listing_id on public.listing_modes(listing_id);
create index idx_listing_policies_listing_id on public.listing_policies(listing_id);
