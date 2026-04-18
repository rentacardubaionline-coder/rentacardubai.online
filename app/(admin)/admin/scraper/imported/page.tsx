import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScraperTabs } from "@/components/admin/scraper/scraper-tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ExternalLink, Search, ArchiveX } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminScraperImportedPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const admin = createAdminClient();
  const { q = "" } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from("scraped_businesses")
    .select(`
      id, name, city_name, imported_at, imported_business_id,
      business:imported_business_id(slug, name, claim_status)
    `)
    .eq("status", "imported")
    .order("imported_at", { ascending: false })
    .limit(200);

  if (q.trim()) query = query.ilike("name", `%${q}%`);

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-900">Scraper — Imported</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Businesses imported from Google Maps scrapes. These are live on the public site.
        </p>
      </div>

      <ScraperTabs />

      <form method="GET" action="/admin/scraper/imported">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q" defaultValue={q} placeholder="Search imported businesses…"
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </form>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <ArchiveX className="mx-auto h-8 w-8 text-ink-300 mb-2" />
            <p className="font-medium text-ink-500">No imported businesses yet</p>
            <p className="mt-1 text-xs text-ink-400">Approve some scraped businesses in the Review tab.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Business</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Claim Status</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-5 font-medium text-ink-900">
                    {r.business?.name ?? r.name}
                  </TableCell>
                  <TableCell className="text-sm text-ink-600">
                    {r.city_name ?? <span className="text-ink-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                      r.business?.claim_status === "claimed"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : r.business?.claim_status === "pending"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-surface-muted text-ink-600"
                    }`}>
                      {r.business?.claim_status ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-ink-500">
                    {r.imported_at ? new Date(r.imported_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {r.business?.slug && (
                      <Link
                        href={`/vendors/${r.business.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View page
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
