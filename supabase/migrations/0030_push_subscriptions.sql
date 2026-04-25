-- Web Push subscriptions for PWA lead notifications.
-- One row per (user, device/browser) — endpoint is unique per subscription.

create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  endpoint      text not null unique,
  p256dh        text not null,
  auth_key      text not null,
  user_agent    text,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

do $$ begin
  create policy "Users read own push subscriptions"
    on public.push_subscriptions for select
    using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users delete own push subscriptions"
    on public.push_subscriptions for delete
    using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Service role (admin client) inserts/selects bypass RLS automatically for
-- the /api/push/subscribe endpoint and the server-side push sender.
