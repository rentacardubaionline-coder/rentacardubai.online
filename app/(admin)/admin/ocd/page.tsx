import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Globe, Building2, Car, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { OcdStartScrapeButton } from "@/components/admin/ocd/start-scrape-button";

export default async function OCDDashboardPage() {
  await requireRole("admin");
  const db = createAdminClient();

  const [
    { count: totalDealers },
    { count: pendingDealers },
    { count: contactedDealers },
    { count: agreedDealers },
    { count: importedDealers },
    { count: rejectedDealers },
    { count: totalListings },
    { count: importedListings },
    { data: recentJobs },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }).eq("status", "contacted"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }).eq("status", "agreed"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }).eq("status", "imported"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_listings").select("*", { count: "exact", head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("ocd_scraped_listings").select("*", { count: "exact", head: true }).eq("status", "imported"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .from("ocd_scrape_jobs")
      .select("id, source_city, status, listings_scraped, dealers_found, created_at, started_at, completed_at, error_message")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Total Dealers",
      value: totalDealers ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Listings",
      value: totalListings ?? 0,
      icon: Car,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Pending Outreach",
      value: (pendingDealers ?? 0) + (contactedDealers ?? 0),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Agreed",
      value: agreedDealers ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Imported",
      value: importedDealers ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rejected",
      value: rejectedDealers ?? 0,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
              <Globe className="h-5 w-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-black text-ink-900">OCD Scraper</h1>
          </div>
          <p className="mt-1.5 text-sm text-ink-500">
            OneClickDrive lead pipeline — scrape dealers, track outreach, import with one click.
          </p>
        </div>
        <OcdStartScrapeButton />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-ink-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-ink-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Conversion progress bar */}
      {(totalDealers ?? 0) > 0 && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-700">Dealer Conversion Pipeline</p>
            <p className="text-xs text-ink-500">
              {importedDealers ?? 0} of {totalDealers ?? 0} activated
            </p>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
            {/* Pending */}
            <div
              className="bg-ink-200 transition-all"
              style={{ width: `${(((pendingDealers ?? 0) / (totalDealers ?? 1)) * 100).toFixed(1)}%` }}
              title={`Pending: ${pendingDealers ?? 0}`}
            />
            {/* Contacted */}
            <div
              className="bg-amber-300 transition-all"
              style={{ width: `${(((contactedDealers ?? 0) / (totalDealers ?? 1)) * 100).toFixed(1)}%` }}
              title={`Contacted: ${contactedDealers ?? 0}`}
            />
            {/* Agreed */}
            <div
              className="bg-sky-400 transition-all"
              style={{ width: `${(((agreedDealers ?? 0) / (totalDealers ?? 1)) * 100).toFixed(1)}%` }}
              title={`Agreed: ${agreedDealers ?? 0}`}
            />
            {/* Imported */}
            <div
              className="bg-emerald-400 transition-all"
              style={{ width: `${(((importedDealers ?? 0) / (totalDealers ?? 1)) * 100).toFixed(1)}%` }}
              title={`Imported: ${importedDealers ?? 0}`}
            />
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-ink-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ink-200" />Pending</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300" />Contacted</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" />Agreed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Imported</span>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/ocd/dealers"
          className="group rounded-xl border border-border bg-white p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-900 group-hover:text-amber-700 transition-colors">
                Browse Dealers
              </p>
              <p className="mt-0.5 text-sm text-ink-500">
                {totalDealers ?? 0} companies · search, filter, update status
              </p>
            </div>
            <Building2 className="h-6 w-6 text-ink-300 group-hover:text-amber-500 transition-colors" />
          </div>
        </Link>

        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink-900">Listings Coverage</p>
              <p className="mt-0.5 text-sm text-ink-500">
                {importedListings ?? 0} / {totalListings ?? 0} listings imported
              </p>
            </div>
            <Car className="h-6 w-6 text-ink-300" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${totalListings ? (((importedListings ?? 0) / totalListings) * 100).toFixed(1) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent scrape jobs */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold text-ink-900">Recent Scrape Jobs</p>
        </div>
        {!recentJobs || recentJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-ink-300" />
            <p className="text-sm text-ink-500">No scrape jobs yet. Click &ldquo;Start Scrape&rdquo; to begin.</p>
            <p className="text-xs text-ink-400">
              Then run:{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px]">
                ts-node scripts/scrape-ocd.ts [job_id]
              </code>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(recentJobs as any[]).map((job) => (
              <div key={job.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="font-medium text-ink-900 capitalize">{job.source_city}</p>
                  <p className="text-xs text-ink-500">
                    {job.listings_scraped ?? 0} listings · {job.dealers_found ?? 0} dealers
                  </p>
                  {job.error_message && (
                    <p className="mt-0.5 text-xs text-rose-600 truncate max-w-xs">{job.error_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-[10px] text-ink-400 font-mono hidden sm:block">
                    {job.id.slice(0, 8)}
                  </code>
                  <JobStatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run command hint */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-semibold text-amber-800 mb-1">How to run the scraper</p>
        <p className="text-amber-700 text-xs mb-2">
          1. Click <strong>Start Scrape</strong> above to create a job record<br />
          2. Copy the Job ID<br />
          3. Run on your machine or a server:
        </p>
        <code className="block rounded-lg bg-amber-100 px-3 py-2 font-mono text-[12px] text-amber-900">
          npm run scrape:ocd -- [JOB_ID]
        </code>
        <p className="mt-2 text-xs text-amber-600">
          The scraper saves progress in real-time. You can close and rerun anytime — it will resume.
        </p>
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:   { cls: "bg-ink-100 text-ink-600",       label: "Pending" },
    running:   { cls: "bg-sky-100 text-sky-700",        label: "Running" },
    completed: { cls: "bg-emerald-100 text-emerald-700", label: "Done" },
    failed:    { cls: "bg-rose-100 text-rose-700",      label: "Failed" },
    cancelled: { cls: "bg-ink-100 text-ink-500",        label: "Cancelled" },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
