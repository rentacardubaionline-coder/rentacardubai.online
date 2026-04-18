import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScraperTabs } from "@/components/admin/scraper/scraper-tabs";
import { ReviewGrid } from "@/components/admin/scraper/review-grid";
import { ChevronDown, Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    minReviews?: string;
    minImages?: string;
    minRating?: string;
  }>;
}

export default async function AdminScraperReviewPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const admin = createAdminClient();
  const {
    q = "",
    city = "",
    minReviews = "",
    minImages = "",
    minRating = "",
  } = await searchParams;

  // Fetch pending scraped businesses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from("scraped_businesses")
    .select("id, name, category, city_name, rating, total_ratings, normalised_phone, website, image_urls, review_count, working_hours")
    .eq("status", "pending")
    .order("scraped_at", { ascending: false })
    .limit(500);

  if (city.trim()) query = query.ilike("city_name", `%${city}%`);
  if (q.trim()) query = query.ilike("name", `%${q}%`);

  // Server-side filters for numeric columns
  const minReviewsNum = minReviews ? parseInt(minReviews, 10) : NaN;
  const minImagesNum = minImages ? parseInt(minImages, 10) : NaN;
  const minRatingNum = minRating ? parseFloat(minRating) : NaN;

  if (!Number.isNaN(minReviewsNum)) {
    query = query.gte("review_count", minReviewsNum);
  }
  if (!Number.isNaN(minRatingNum)) {
    query = query.gte("rating", minRatingNum);
  }

  const { data: businesses } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows = (businesses ?? []) as any[];

  // Image count is derived from array length — filter client-side (Supabase can't
  // directly filter on jsonb/array length without a view/function)
  if (!Number.isNaN(minImagesNum)) {
    rows = rows.filter((b) => (b.image_urls?.length ?? 0) >= minImagesNum);
  }

  // All cities for filter dropdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: citiesRaw } = await (admin as any)
    .from("cities")
    .select("name")
    .eq("is_active", true)
    .order("name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cities = ((citiesRaw ?? []) as any[]).map((c) => c.name);

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
      <form method="GET" action="/admin/scraper/review" className="space-y-2">
        <div className="flex flex-wrap gap-2 items-stretch">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search business name…"
              className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {/* City */}
          <FilterSelect
            name="city"
            defaultValue={city}
            placeholder="All cities"
            options={cities.map((c) => ({ value: c, label: c }))}
            widthClass="w-40"
          />

          {/* Min reviews */}
          <FilterSelect
            name="minReviews"
            defaultValue={minReviews}
            placeholder="Min reviews"
            options={[
              { value: "1", label: "≥ 1 review" },
              { value: "3", label: "≥ 3 reviews" },
              { value: "5", label: "≥ 5 reviews" },
              { value: "10", label: "≥ 10 reviews" },
              { value: "15", label: "15 reviews (max)" },
            ]}
            widthClass="w-40"
          />

          {/* Min images */}
          <FilterSelect
            name="minImages"
            defaultValue={minImages}
            placeholder="Min photos"
            options={[
              { value: "1", label: "≥ 1 photo" },
              { value: "2", label: "≥ 2 photos" },
              { value: "3", label: "≥ 3 photos" },
              { value: "5", label: "5 photos (max)" },
            ]}
            widthClass="w-40"
          />

          {/* Min rating */}
          <FilterSelect
            name="minRating"
            defaultValue={minRating}
            placeholder="Min rating"
            options={[
              { value: "3", label: "★ 3.0+" },
              { value: "3.5", label: "★ 3.5+" },
              { value: "4", label: "★ 4.0+" },
              { value: "4.5", label: "★ 4.5+" },
              { value: "5", label: "★ 5.0" },
            ]}
            widthClass="w-32"
          />

          <button
            type="submit"
            className="h-10 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-700 transition-colors"
          >
            Apply
          </button>

          {(q || city || minReviews || minImages || minRating) && (
            <a
              href="/admin/scraper/review"
              className="inline-flex items-center justify-center h-10 rounded-xl border border-border bg-white px-3 text-xs font-medium text-ink-500 hover:bg-surface-muted"
            >
              Reset
            </a>
          )}
        </div>
      </form>

      <ReviewGrid businesses={rows} />
    </div>
  );
}

/* ── Styled select with icon ─────────────────────────────────────────────── */

function FilterSelect({
  name,
  defaultValue,
  placeholder,
  options,
  widthClass = "w-40",
}: {
  name: string;
  defaultValue: string;
  placeholder: string;
  options: { value: string; label: string }[];
  widthClass?: string;
}) {
  return (
    <div className={`relative ${widthClass}`}>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full appearance-none rounded-xl border border-border bg-white pl-3 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
    </div>
  );
}
