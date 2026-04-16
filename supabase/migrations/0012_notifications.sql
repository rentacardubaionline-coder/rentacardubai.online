-- In-app notification history for vendors and admins
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- Fast index for unread badge count
create index if not exists notifications_user_unread
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

do $$ begin
  create policy "Users read own notifications"
    on public.notifications for select
    using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users mark own read"
    on public.notifications for update
    using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Service-role (admin client) inserts bypass RLS automatically.
-- No explicit insert policy needed for service role.
