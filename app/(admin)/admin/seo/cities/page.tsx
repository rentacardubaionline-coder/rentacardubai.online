import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { CityFormDialog } from "@/components/admin/seo/city-form-dialog";
import { DeleteSeoButton } from "@/components/admin/seo/delete-seo-button";
import { deleteCityAction } from "@/app/actions/seo";
import { CheckCircle2, XCircle, Search, MapPin } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSeoCitiesPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();
  const { q = "" } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("cities")
    .select("id, name, slug, province, is_active")
    .order("name");

  if (q.trim()) {
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,province.ilike.%${q}%`);
  }

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">SEO — Cities</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Cities are part of URLs like <code>/rent-a-car/lahore</code>.
          </p>
        </div>
        <CityFormDialog />
      </div>

      <SeoTabs />

      <form method="GET" action="/admin/seo/cities">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q" defaultValue={q}
            placeholder="Search cities by name, slug, or province…"
            className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </form>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-ink-500">No cities found</p>
            {q && <p className="mt-1 text-sm text-ink-400">No results for &ldquo;{q}&rdquo;</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">City</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-ink-300 shrink-0" />
                      <span className="font-medium text-ink-900">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs font-mono text-ink-700">{c.slug}</code></TableCell>
                  <TableCell className="text-sm text-ink-600">{c.province ?? <span className="text-ink-300">—</span>}</TableCell>
                  <TableCell>
                    {c.is_active ? (
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
                      <CityFormDialog asEditButton city={c} />
                      <DeleteSeoButton
                        id={c.id} name={c.name}
                        action={deleteCityAction}
                        confirmText={`Delete "${c.name}"? All its towns and routes will also be deleted. This cannot be undone.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-ink-400">{rows.length} cities total</p>
    </div>
  );
}
