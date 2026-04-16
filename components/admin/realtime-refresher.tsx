"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeRefresherProps {
  /** Tables to subscribe to for live updates */
  tables: string[];
  /** Auto-refresh interval in seconds. Defaults to 30. Set to 0 to disable. */
  pollInterval?: number;
}

export function RealtimeRefresher({ tables, pollInterval = 30 }: RealtimeRefresherProps) {
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

  // Realtime subscriptions
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`admin-rt-${tables.sort().join("-")}`);

    tables.forEach((table) => {
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => triggerRefresh()
      );
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tables.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh fallback
  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(triggerRefresh, pollInterval * 1000);
    return () => clearInterval(id);
  }, [pollInterval, triggerRefresh]);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lastUpdated]);

  return (
    <div className="inline-flex items-center gap-2 select-none">
      {/* Pulsing live dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className={`text-xs font-medium transition-colors duration-300 ${flash ? "text-emerald-600" : "text-ink-400"}`}>
        {flash && lastUpdated
          ? `Updated ${elapsed}`
          : lastUpdated
          ? `Live · ${elapsed}`
          : "Live"}
      </span>
    </div>
  );
}
