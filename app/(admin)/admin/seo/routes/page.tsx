import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { RouteFormDialog } from "@/components/admin/seo/route-form-dialog";
import { DeleteSeoButton } from "@/components/admin/seo/delete-seo-button";
import { deleteRouteAction } from "@/app/actions/seo";
import { CheckCircle2, XCircle, Search, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSeoRoutesPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();
  const { q = "" } = await searchParams;

  // Cities for form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cities } = await (db as any)
    .from("cities")
    .select("id, name")
    .order("name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityList = (cities ?? []) as { id: string; name: string }[];

  // Routes query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("routes")
    .select(`
      id, slug, distance_km, estimated_time, is_active,
      origin_city_id, destination_city_id,
      origin:origin_city_id(name, slug),
      destination:destination_city_id(name, slug)
    `)
    .order("slug");

  if (q.trim()) query = query.ilike("slug", `%${q}%`);

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">SEO — Routes</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Intercity routes power URLs like <code>/routes/lahore-to-islamabad</code>.
          </p>
        </div>
        <RouteFormDialog cities={cityList} />
      </div>

      <SeoTabs />

      <form method="GET" action="/admin/seo/routes">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q" defaultValue={q}
            placeholder="Search routes by slug…"
            className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </form>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-ink-500">No routes found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Route</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-5">
                    <div className="inline-flex items-center gap-1.5 text-sm">
                      <span className="font-semibold text-ink-900">{r.origin?.name ?? "—"}</span>
                      <ArrowRight className="h-3 w-3 text-ink-400" />
                      <span className="font-semibold text-ink-900">{r.destination?.name ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs font-mono text-ink-700">{r.slug}</code></TableCell>
                  <TableCell className="text-sm text-ink-600">
                    {r.distance_km ? `${r.distance_km} km` : <span className="text-ink-300">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-ink-600">
                    {r.estimated_time || <span className="text-ink-300">—</span>}
                  </TableCell>
                  <TableCell>
                    {r.is_active ? (
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
                      <RouteFormDialog asEditButton cities={cityList} route={{
                        id: r.id,
                        origin_city_id: r.origin_city_id,
                        destination_city_id: r.destination_city_id,
                        distance_km: r.distance_km,
                        estimated_time: r.estimated_time,
                        is_active: r.is_active,
                      }} />
                      <DeleteSeoButton id={r.id} name={r.slug} action={deleteRouteAction} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-ink-400">{rows.length} routes total</p>
    </div>
  );
}
