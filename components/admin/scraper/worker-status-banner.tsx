import { createAdminClient } from "@/lib/supabase/admin";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

/**
 * Shows whether the worker is healthy (has recently processed or claimed a job)
 * or appears offline (pending jobs sitting idle for >2 minutes).
 */
export async function WorkerStatusBanner() {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: runningJobs }, { data: pendingJobs }, { data: recentJobs }] =
    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from("scrape_jobs")
        .select("id")
        .eq("status", "running")
        .limit(1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from("scrape_jobs")
        .select("id, created_at")
        .eq("status", "pending")
        .order("created_at")
        .limit(1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from("scrape_jobs")
        .select("id, started_at, completed_at")
        .or("started_at.gt." + new Date(Date.now() - 10 * 60 * 1000).toISOString() +
            ",completed_at.gt." + new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .limit(1),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isRunning = (runningJobs as any[])?.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasPending = (pendingJobs as any[])?.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentActivity = (recentJobs as any[])?.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oldestPending = (pendingJobs as any[])?.[0];
  const pendingAgeMs = oldestPending ? Date.now() - new Date(oldestPending.created_at).getTime() : 0;
  const pendingStale = hasPending && pendingAgeMs > 2 * 60 * 1000; // >2 min = worker likely offline

  // Healthy: running, OR recent activity, OR no pending jobs
  if (isRunning || (!pendingStale && recentActivity)) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <div className="flex-1">
          <span className="font-semibold text-emerald-900">Worker is online</span>
          <span className="ml-2 text-emerald-700">
            {isRunning ? "— currently scraping" : "— ready to accept jobs"}
          </span>
        </div>
      </div>
    );
  }

  if (pendingStale) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-amber-900">Worker appears offline</p>
          <p className="mt-0.5 text-amber-800 text-xs">
            {`${Math.floor(pendingAgeMs / 60000)} min old pending job with no activity. Start the worker locally with `}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px]">python scripts/scraper/worker.py</code>
            {" or check your Render deployment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-surface-muted bg-surface-muted/30 px-4 py-2.5 text-sm">
      <Clock className="h-4 w-4 text-ink-400" />
      <span className="text-ink-600">Worker idle — no jobs queued. Start a scrape to begin.</span>
    </div>
  );
}
