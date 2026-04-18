import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { TownFormDialog } from "@/components/admin/seo/town-form-dialog";
import { DeleteSeoButton } from "@/components/admin/seo/delete-seo-button";
import { deleteTownAction } from "@/app/actions/seo";
import { CheckCircle2, XCircle, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ q?: string; city?: string; page?: string }>;
}

export default async function AdminSeoTownsPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();

  const { q = "", city: cityFilter = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Load cities for filter + form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cities } = await (db as any)
    .from("cities")
    .select("id, name, slug")
    .order("name");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityList = (cities ?? []) as { id: string; name: string; slug: string }[];

  // Main query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("towns")
    .select("id, name, slug, city_id, is_active, city:city_id(name, slug)", { count: "exact" })
    .order("name")
    .range(offset, offset + PAGE_SIZE - 1);

  if (cityFilter) query = query.eq("city_id", cityFilter);
  if (q.trim()) query = query.ilike("name", `%${q}%`);

  const { data, count } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({ q, city: cityFilter, page: String(page), ...params });
    return `/admin/seo/towns?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">SEO — Towns</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Towns (areas within cities) appear in URLs like <code>/rent-a-car/lahore/clifton</code>.
          </p>
        </div>
        <TownFormDialog cities={cityList} />
      </div>

      <SeoTabs />

      {/* Search + city filter */}
      <form method="GET" action="/admin/seo/towns" className="flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q" defaultValue={q} placeholder="Search town name…"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <select
          name="city" defaultValue={cityFilter}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-amber-400"
        >
          <option value="">All cities</option>
          {cityList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-700">
          Filter
        </button>
      </form>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-ink-500">No towns found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Town</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-ink-300 shrink-0" />
                      <span className="font-medium text-ink-900">{t.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-ink-700">{t.city?.name ?? "—"}</TableCell>
                  <TableCell><code className="text-xs font-mono text-ink-700">{t.slug}</code></TableCell>
                  <TableCell>
                    {t.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-500">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TownFormDialog asEditButton town={t} cities={cityList} />
                      <DeleteSeoButton id={t.id} name={t.name} action={deleteTownAction} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildHref({ page: String(page - 1) })} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted">Previous</Link>
            )}
            {page < totalPages && (
              <Link href={buildHref({ page: String(page + 1) })} className={cn("rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted")}>Next</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
