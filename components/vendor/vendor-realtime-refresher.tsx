"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  table: string;
  /** Postgres-changes event filter — e.g. `vendor_user_id=eq.${id}` for leads,
   *  or `business_id=eq.${id}` for listings. */
  filter?: string;
  /** Defaults to "*" — every insert/update/delete triggers a refresh. */
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
}

interface Props {
  /** One or more table subscriptions, all filtered to this vendor. */
  subscriptions: Subscription[];
  /** Cosmetic — unique key for the channel name. Pass the user id. */
  channelKey: string;
}

/**
 * Vendor-side realtime refresher. Subscribes to filtered Supabase realtime
 * events for the current vendor and calls `router.refresh()` when anything
 * matching changes — the server re-renders the page with fresh data, the
 * vendor doesn't have to reload.
 *
 * The "Live · {elapsed}" pill is identical to the admin variant so the two
 * dashboards feel consistent.
 */
export function VendorRealtimeRefresher({ subscriptions, channelKey }: Props) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [flash, setFlash] = useState(false);
  const [elapsed, setElapsed] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerRefresh = useCallback(() => {
    router.refresh();
    setLastUpdated(new Date());
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`vendor-rt-${channelKey}`);

    for (const sub of subscriptions) {
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        },
        () => triggerRefresh(),
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    channelKey,
    subscriptions.map((s) => `${s.table}:${s.filter ?? ""}:${s.event ?? "*"}`).join("|"),
  ]);

  // "Updated X ago" ticker
  useEffect(() => {
    if (!lastUpdated) return;
    const update = () => {
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secs < 5) setElapsed("just now");
      else if (secs < 60) setElapsed(`${secs}s ago`);
      else setElapsed(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    timerRef.current = setInterval(update, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastUpdated]);

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span
        className={`text-xs font-medium transition-colors duration-300 ${
          flash ? "text-emerald-600" : "text-ink-400"
        }`}
      >
        {flash && lastUpdated
          ? `Updated ${elapsed}`
          : lastUpdated
            ? `Live · ${elapsed}`
            : "Live"}
      </span>
    </div>
  );
}
