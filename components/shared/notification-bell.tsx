"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, Car, ShieldCheck, Building2, MessageSquare, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getNotificationsAction, markNotificationsReadAction, type NotificationRow } from "@/app/actions/notifications";

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 86400 * 7) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
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

interface NotificationBellProps {
  initialCount: number;
}

export function NotificationBell({ initialCount }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [marking, setMarking] = useState(false);

  const handleOpen = useCallback(async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !loaded) {
      setLoading(true);
      const result = await getNotificationsAction();
      setLoading(false);
      setLoaded(true);
      if (result.data) setNotifications(result.data);
    }
  }, [loaded]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    await markNotificationsReadAction();
    setMarking(false);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 shadow-pop rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-muted px-4 py-3">
          <span className="text-sm font-bold text-ink-900">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
            >
              {marking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-ink-300" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Bell className="h-8 w-8 text-ink-200" />
              <p className="text-sm font-medium text-ink-400">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const isUnread = !n.read_at;
                const inner = (
                  <li
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60 ${
                      isUnread ? "bg-brand-50/40 border-l-2 border-brand-400" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColor(n.type)}`}>
                      <NotificationIcon type={n.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-ink-900" : "font-medium text-ink-700"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-xs text-ink-400 line-clamp-2">{n.body}</p>
                      )}
                      <p className="mt-1 text-[11px] text-ink-300">{timeAgo(n.created_at)}</p>
                    </div>
                  </li>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
