"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cancelScrapeJobAction, deleteScrapeJobAction } from "@/app/actions/scraper";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Clock, Loader2, XCircle, AlertCircle, Trash2, X as XIcon,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrapeJob {
  id: string;
  city_name: string;
  city_slug: string | null;
  category: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress_current: number;
  progress_total: number;
  scraped_count: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface JobsTableProps {
  initialJobs: ScrapeJob[];
}

export function JobsTable({ initialJobs }: JobsTableProps) {
  const [jobs, setJobs] = useState<ScrapeJob[]>(initialJobs);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("scrape-jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scrape_jobs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setJobs((prev) => [payload.new as ScrapeJob, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((j) => (j.id === (payload.new as ScrapeJob).id ? (payload.new as ScrapeJob) : j)),
            );
          } else if (payload.eventType === "DELETE") {
            setJobs((prev) => prev.filter((j) => j.id !== (payload.old as ScrapeJob).id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-muted py-16 text-center">
        <p className="text-sm font-semibold text-ink-600">No scrape jobs yet</p>
        <p className="mt-1 text-xs text-ink-400">Click &quot;Start Scrape&quot; to queue a job.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-muted bg-surface-muted/50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500">City</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Progress</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Scraped</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Started</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Duration</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-muted">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobRow({ job }: { job: ScrapeJob }) {
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    if (!confirm(`Cancel scrape job for ${job.city_name}?`)) return;
    startTransition(async () => {
      const res = await cancelScrapeJobAction(job.id);
      if (res.error) toast.error(res.error);
      else toast.success("Job cancelled");
    });
  }

  function handleDelete() {
    if (!confirm(`Delete job history for ${job.city_name}?`)) return;
    startTransition(async () => {
      const res = await deleteScrapeJobAction(job.id);
      if (res.error) toast.error(res.error);
    });
  }

  const duration = computeDuration(job);
  const progressPct =
    job.progress_total > 0 ? Math.round((job.progress_current / job.progress_total) * 100) : 0;

  return (
    <tr className="hover:bg-surface-muted/30">
      {/* City */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-ink-300 shrink-0" />
          <div>
            <p className="font-medium text-ink-900">{job.city_name}</p>
            <p className="text-[11px] text-ink-400">{job.category}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5"><StatusBadge status={job.status} /></td>

      {/* Progress */}
      <td className="px-4 py-3.5 min-w-[180px]">
        {job.status === "running" || job.status === "completed" ? (
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  job.status === "completed" ? "bg-emerald-500" : "bg-sky-500",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-500 tabular-nums">
              {job.progress_current} / {job.progress_total} cells ({progressPct}%)
            </p>
          </div>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </td>

      {/* Scraped count */}
      <td className="px-4 py-3.5">
        <span className="font-semibold tabular-nums text-ink-900">{job.scraped_count}</span>
        <span className="ml-1 text-xs text-ink-400">businesses</span>
      </td>

      {/* Started */}
      <td className="px-4 py-3.5 text-xs text-ink-500 tabular-nums">
        {job.started_at ? relativeTime(job.started_at) : <span className="text-ink-300">—</span>}
      </td>

      {/* Duration */}
      <td className="px-4 py-3.5 text-xs text-ink-500 tabular-nums">
        {duration}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {(job.status === "pending" || job.status === "running") && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={handleCancel}
              className="text-ink-400 hover:text-amber-700 hover:bg-amber-50"
              title="Cancel job"
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          )}
          {(job.status === "completed" || job.status === "failed" || job.status === "cancelled") && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={handleDelete}
              className="text-ink-400 hover:text-rose-600 hover:bg-rose-50"
              title="Delete job history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: ScrapeJob["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
        <Loader2 className="h-3 w-3 animate-spin" /> Running
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600">
        <Clock className="h-3 w-3" /> Queued
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
        <AlertCircle className="h-3 w-3" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
      <XCircle className="h-3 w-3" /> Cancelled
    </span>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function computeDuration(job: ScrapeJob): string {
  if (!job.started_at) return "—";
  const end = job.completed_at ? new Date(job.completed_at).getTime() : Date.now();
  const start = new Date(job.started_at).getTime();
  const secs = Math.floor((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}
