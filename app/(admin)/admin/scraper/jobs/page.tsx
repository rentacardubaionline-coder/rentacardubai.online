import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScraperTabs } from "@/components/admin/scraper/scraper-tabs";
import { StartScrapeDialog } from "@/components/admin/scraper/start-scrape-dialog";
import { JobsTable } from "@/components/admin/scraper/jobs-table";
import { WorkerStatusBanner } from "@/components/admin/scraper/worker-status-banner";

export default async function AdminScraperJobsPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [jobsRes, citiesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from("scrape_jobs")
      .select("id, city_name, city_slug, category, status, progress_current, progress_total, scraped_count, error_message, started_at, completed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from("cities")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs = (jobsRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cities = (citiesRes.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">Scraper</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Queue scrape jobs per city. The worker (running on Render or your laptop) picks them
            up automatically. Results appear in the Review tab as they come in.
          </p>
        </div>
        <StartScrapeDialog cities={cities} />
      </div>

      <ScraperTabs />

      <WorkerStatusBanner />

      <JobsTable initialJobs={jobs} />
    </div>
  );
}
