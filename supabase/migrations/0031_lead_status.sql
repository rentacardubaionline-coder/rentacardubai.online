-- Lead lifecycle: vendor can move a lead through new → contacted → won/lost.
alter table public.leads
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost'));

create index if not exists leads_vendor_status_created
  on public.leads (vendor_user_id, status, created_at desc);
