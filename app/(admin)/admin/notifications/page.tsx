import Link from "next/link";
import { Bell, Car, ShieldCheck, Building2, MessageSquare, AlertCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkAllReadButton } from "@/components/admin/mark-all-read-button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
] as const;

type StatusKey = (typeof STATUS_FILTERS)[number]["key"];

function isStatus(s: string | undefined): s is StatusKey {
  return s === "all" || s === "unread" || s === "read";
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 86400 * 7) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  if (type.startsWith("listing")) return <Car className={cls} />;
  if (type.startsWith("kyc")) return <ShieldCheck className={cls} />;
  if (type.startsWith("claim")) return <Building2 className={cls} />;
  if (type === "new_lead") return <MessageSquare className={cls} />;
  return <AlertCircle className={cls} />;
}

function iconColor(type: string): string {
  if (type.includes("approved")) return "text-emerald-600 bg-emerald-50";
  if (type.includes("rejected")) return "text-rose-600 bg-rose-50";
  if (type === "new_lead") return "text-brand-600 bg-brand-50";
  return "text-amber-600 bg-amber-50";
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminNotificationsPage({ searchParams }: PageProps) {
  const profile = await requireRole("admin");
  const { status: statusParam, page: pageParam } = await searchParams;

  const status: StatusKey = isStatus(statusParam) ? statusParam : "all";
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at", { count: "exact" })
    .eq("user_id", profile.id);

  if (status === "unread") query = query.is("read_at", null);
  else if (status === "read") query = query.not("read_at", "is", null);

  const { data: notifications, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  // Counts for the tabs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ count: totalCount }, { count: unreadCount }, { count: readCount }] = await Promise.all([
    (db as any).from("notifications").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    (db as any).from("notifications").select("*", { count: "exact", head: true }).eq("user_id", profile.id).is("read_at", null),
    (db as any).from("notifications").select("*", { count: "exact", head: true }).eq("user_id", profile.id).not("read_at", "is", null),
  ]);

  const counts: Record<StatusKey, number> = {
    all: totalCount ?? 0,
    unread: unreadCount ?? 0,
    read: readCount ?? 0,
  };

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  function buildHref(patch: { status?: StatusKey; page?: number }): string {
    const sp = new URLSearchParams();
    const next = { status: patch.status ?? status, page: patch.page ?? 1 };
    if (next.status !== "all") sp.set("status", next.status);
    if (next.page > 1) sp.set("page", String(next.page));
    const qs = sp.toString();
    return qs ? `/admin/notifications?${qs}` : "/admin/notifications";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Full archive of admin alerts. Use the bell in the top bar for the latest few.
          </p>
        </div>
        {(unreadCount ?? 0) > 0 && <MarkAllReadButton />}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-surface-muted">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Link
              key={f.key}
              href={buildHref({ status: f.key, page: 1 })}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface-muted text-ink-400",
                )}
              >
                {counts[f.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-white shadow-card">
        {!notifications || notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-9 w-9" />}
            title={
              status === "unread"
                ? "No unread notifications"
                : status === "read"
                  ? "No read notifications"
                  : "No notifications yet"
            }
            description="As alerts come in for KYC, listings, claims, and new leads, they'll appear here."
            className="py-16"
          />
        ) : (
          <ul className="divide-y divide-surface-muted">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(notifications as any[]).map((n) => {
              const isUnread = !n.read_at;
              const inner = (
                <div
                  className={cn(
                    "flex gap-3 px-5 py-4 transition-colors hover:bg-surface-muted/40",
                    isUnread && "bg-brand-50/40 border-l-2 border-brand-400",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      iconColor(n.type),
                    )}
                  >
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        isUnread ? "font-bold text-ink-900" : "font-medium text-ink-700",
                      )}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-1 text-xs text-ink-500 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] font-medium text-ink-400">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              );

              return n.link ? (
                <li key={n.id}>
                  <Link href={n.link}>{inner}</Link>
                </li>
              ) : (
                <li key={n.id}>{inner}</li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, count ?? 0)} of {count ?? 0}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: page - 1 })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: page + 1 })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
