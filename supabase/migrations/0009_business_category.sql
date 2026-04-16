-- Add category field to businesses
alter table public.businesses add column if not exists category text;

-- Index for filtering by category
create index if not exists idx_businesses_category on public.businesses(category);
