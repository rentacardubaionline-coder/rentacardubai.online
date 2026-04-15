-- Add detailed fields to businesses table
alter table public.businesses 
  add column description text,
  add column logo_url text,
  add column website_url text,
  add column established_year int4,
  add column total_fleet_count int4 default 0,
  add column working_hours jsonb,
  add column languages text[] default '{}',
  add column google_place_id text,
  add column google_maps_url text;

-- Business images: multiple images per business (showroom, office, etc.)
create table public.business_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  cloudinary_public_id text unique,
  url text not null,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Business reviews: separate from car reviews
create table public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reviewer_name text not null,
  reviewer_avatar_url text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.business_images enable row level security;
alter table public.business_reviews enable row level security;

-- RLS Policies: business_images
create policy "Public can read business images" on public.business_images
  for select using (true);

create policy "Owner/Admin can manage business images" on public.business_images
  for all using (
    business_id in (select id from public.businesses where owner_user_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- RLS Policies: business_reviews
create policy "Public can read business reviews" on public.business_reviews
  for select using (true);

create policy "Admin can manage business reviews" on public.business_reviews
  for all using (public.is_admin(auth.uid()));

-- Indexes
create index idx_business_images_business_id on public.business_images(business_id);
create index idx_business_reviews_business_id on public.business_reviews(business_id);
