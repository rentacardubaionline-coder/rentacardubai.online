import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { CategoryFormDialog } from "@/components/admin/seo/category-form-dialog";
import { DeleteSeoButton } from "@/components/admin/seo/delete-seo-button";
import { deleteCategoryAction } from "@/app/actions/seo";
import { Layers } from "lucide-react";

export default async function AdminSeoCategoriesPage() {
  await requireRole("admin");
  const db = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (db as any)
    .from("vehicle_categories")
    .select("id, name, slug")
    .order("name");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink-900">SEO — Vehicle Categories</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            Categories power URLs like <code>/vehicles/sedan</code>, <code>/vehicles/suv</code>.
          </p>
        </div>
        <CategoryFormDialog />
      </div>

      <SeoTabs />

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-ink-500">No categories yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-ink-300 shrink-0" />
                      <span className="font-medium text-ink-900">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs font-mono text-ink-700">{c.slug}</code></TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CategoryFormDialog asEditButton category={c} />
                      <DeleteSeoButton id={c.id} name={c.name} action={deleteCategoryAction} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-ink-400">{rows.length} categories total</p>
    </div>
  );
}
