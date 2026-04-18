import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { KeywordFormDialog } from "@/components/admin/seo/keyword-form-dialog";
import { DeleteSeoButton } from "@/components/admin/seo/delete-seo-button";
import { deleteKeywordAction } from "@/app/actions/seo";
import { CheckCircle2, XCircle, Globe, Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSeoKeywordsPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();
  const { q = "" } = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("seo_keywords")
    .select("id, slug, label, is_active, include_in_sitemap_towns, template_overrides, sort_order")
    .order("sort_order");

  if (q.trim()) {
    query = query.or(`slug.ilike.%${q}%,label.ilike.%${q}%`);
  }

  const { data: keywords } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (keywords ?? []) as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">SEO</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Manage keywords, cities, towns, routes, and vehicle categories. Adding or removing
            any of these automatically creates or removes landing pages.
          </p>
        </div>
        <KeywordFormDialog />
      </div>

      <SeoTabs />

      {/* Search */}
      <form method="GET" action="/admin/seo/keywords">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by slug or label…"
            className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-ink-500">No keywords found</p>
            {q && <p className="mt-1 text-sm text-ink-400">No results for &ldquo;{q}&rdquo;</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Slug / URL</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>In Town Sitemap</TableHead>
                <TableHead>Overrides</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((kw) => {
                const hasOverrides = !!kw.template_overrides &&
                  (kw.template_overrides.city || kw.template_overrides.model || kw.template_overrides.route);
                const overrideTypes: string[] = [];
                if (kw.template_overrides?.city) overrideTypes.push("city");
                if (kw.template_overrides?.model) overrideTypes.push("model");
                if (kw.template_overrides?.route) overrideTypes.push("route");
                return (
                  <TableRow key={kw.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-ink-300 shrink-0" />
                        <code className="text-xs font-mono font-semibold text-ink-800">/{kw.slug}</code>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-ink-700">{kw.label}</TableCell>
                    <TableCell>
                      {kw.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-500">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {kw.include_in_sitemap_towns ? (
                        <span className="text-xs font-semibold text-emerald-700">Yes</span>
                      ) : (
                        <span className="text-xs text-ink-400">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasOverrides ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                          {overrideTypes.join(", ")}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <KeywordFormDialog asEditButton keyword={kw} />
                        <DeleteSeoButton
                          id={kw.id}
                          name={kw.label}
                          action={deleteKeywordAction}
                          confirmText={`Delete keyword "${kw.label}"? All /${kw.slug}/* pages will return 404. This cannot be undone.`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-ink-400">
        {rows.length} keyword{rows.length === 1 ? "" : "s"} total
      </p>
    </div>
  );
}
