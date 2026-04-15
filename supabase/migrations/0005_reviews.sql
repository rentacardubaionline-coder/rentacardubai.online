-- Vendor reviews: admin-curated reviews attached to a business (vendor).
-- v1: only admins can create/edit/delete reviews; public can read reviews for claimed businesses.
-- A trigger keeps businesses.rating and businesses.reviews_count in sync so the search/card
-- UI stays fast (no join needed for aggregates).

create table public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_name text not null,         -- shown publicly, e.g. "Ahmed K."
  rating int not null check (rating between 1 and 5),
  body text,                         -- review content (nullable, short blurbs ok)
  created_by uuid references public.profiles(id) on delete set null, -- admin who added it
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_vendor_reviews_business_id on public.vendor_reviews(business_id);
create index idx_vendor_reviews_created_at on public.vendor_reviews(created_at desc);

alter table public.vendor_reviews enable row level security;

-- Public can read all reviews (they're admin-curated, safe to expose).
create policy "Public can read vendor reviews" on public.vendor_reviews
  for select using (true);

-- Only admins can write/update/delete reviews.
create policy "Admin can insert vendor reviews" on public.vendor_reviews
  for insert with check (public.is_admin(auth.uid()));

create policy "Admin can update vendor reviews" on public.vendor_reviews
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Admin can delete vendor reviews" on public.vendor_reviews
  for delete using (public.is_admin(auth.uid()));

-- Recompute aggregate rating + count for a business.
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

-- Trigger wrapper: after each change to vendor_reviews, re-sync the parent business.
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
    -- If the review was moved between businesses (rare), also recompute old parent.
    if tg_op = 'UPDATE' and old.business_id is distinct from new.business_id then
      perform public.recompute_business_rating(old.business_id);
    end if;
    return new;
  end if;
end;
$$;

create trigger trg_vendor_reviews_sync
  after insert or update or delete on public.vendor_reviews
  for each row execute function public.vendor_reviews_sync_business();
