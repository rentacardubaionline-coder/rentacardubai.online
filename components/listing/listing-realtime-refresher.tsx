"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  listingId: string;
  businessId?: string | null;
  /** Pass when the listing was imported from OneClickDrive — we'll subscribe to
   *  the staging row so re-scrapes flow live to the page. */
  ocdImported?: boolean;
}

/**
 * Subscribes to every Supabase realtime channel that affects what's rendered
 * on the public car detail page and calls `router.refresh()` on change. Shows
 * a small "Live · {elapsed}" pill matching the vendor dashboard's pattern.
 */
export function ListingRealtimeRefresher({
  listingId,
  businessId,
  ocdImported,
}: Props) {
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
    // Unique per-mount channel name so React Strict Mode's double-invoke
    // doesn't re-attach to a channel that has already been subscribed.
    const channelName = `listing-rt-${listingId}-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(channelName);

    const subs: { table: string; filter: string }[] = [
      { table: "listings", filter: `id=eq.${listingId}` },
      { table: "listing_pricing", filter: `listing_id=eq.${listingId}` },
      { table: "listing_policies", filter: `listing_id=eq.${listingId}` },
      { table: "listing_features", filter: `listing_id=eq.${listingId}` },
      { table: "listing_images", filter: `listing_id=eq.${listingId}` },
    ];
    if (businessId) {
      subs.push({ table: "businesses", filter: `id=eq.${businessId}` });
    }
    if (ocdImported) {
      subs.push({
        table: "ocd_scraped_listings",
        filter: `imported_listing_id=eq.${listingId}`,
      });
    }

    // Attach every listener BEFORE calling subscribe — supabase-js disallows
    // adding postgres_changes callbacks once a channel is subscribed.
    for (const sub of subs) {
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: sub.table, filter: sub.filter },
        () => triggerRefresh(),
      );
    }

    let cancelled = false;
    channel.subscribe((status) => {
      if (cancelled && status === "SUBSCRIBED") {
        supabase.removeChannel(channel);
      }
    });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [listingId, businessId, ocdImported, triggerRefresh]);

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
