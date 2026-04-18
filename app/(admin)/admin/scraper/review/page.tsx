import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScraperTabs } from "@/components/admin/scraper/scraper-tabs";
import { ReviewGrid } from "@/components/admin/scraper/review-grid";
import { ChevronDown, Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; city?: string }>;
}

export default async function AdminScraperReviewPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const admin = createAdminClient();
  const { q = "", city = "" } = await searchParams;

  // Fetch pending scraped businesses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from("scraped_businesses")
    .select("id, name, category, city_name, rating, total_ratings, normalised_phone, website, image_urls, review_count, working_hours")
    .eq("status", "pending")
    .order("scraped_at", { ascending: false })
    .limit(200);

  if (city.trim()) query = query.ilike("city_name", `%${city}%`);
  if (q.trim()) query = query.ilike("name", `%${q}%`);

  const { data: businesses, count } = await query;

  // All cities for filter dropdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: citiesRaw } = await (admin as any)
    .from("cities")
    .select("name")
    .eq("is_active", true)
    .order("name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cities = ((citiesRaw ?? []) as any[]).map((c) => c.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (businesses ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-900">Scraper — Review</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {rows.length} business{rows.length === 1 ? "" : "es"} pending review.
          Select and bulk-approve to import to the main directory.
        </p>
      </div>

      <ScraperTabs />

      {/* Filters */}
      <form method="GET" action="/admin/scraper/review" className="flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q" defaultValue={q} placeholder="Search business name…"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div className="relative">
          <select
            name="city" defaultValue={city}
            className="h-10 appearance-none rounded-xl border border-border bg-white pl-3 pr-9 text-sm outline-none focus:border-amber-400"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
        </div>
        <button type="submit" className="h-10 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-700">
          Filter
        </button>
      </form>

      <ReviewGrid businesses={rows} />
    </div>
  );
}
