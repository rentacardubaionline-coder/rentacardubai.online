import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddReviewForm } from "@/components/admin/add-review-form";
import { DeleteReviewButton } from "@/components/admin/delete-review-button";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { Star, Building2, FileCheck } from "lucide-react";

const BASE = "/admin/businesses";

const TABS = [
  { href: BASE,            label: "Directory", icon: "building", exact: true },
  { href: `${BASE}/claims`,   label: "Claims",    icon: "filecheck" },
  { href: `${BASE}/reviews`,  label: "Reviews",   icon: "star" },
];

interface BusinessOption {
  id: string;
  name: string;
  city: string;
}

interface ReviewRow {
  id: string;
  business_id: string;
  author_name: string;
  rating: number;
  body: string | null;
  created_at: string;
  business: { name: string } | null;
}

export default async function AdminBusinessReviewsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: businesses } = await (supabase as any)
    .from("businesses")
    .select("id, name, city")
    .order("name", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews } = await (supabase as any)
    .from("vendor_reviews")
    .select("id, business_id, author_name, rating, body, created_at, business:business_id(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink-900">Businesses</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Add and manage customer reviews for each vendor.
        </p>
      </div>

      {/* Section tabs */}
      <AdminTabBar tabs={TABS} />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Add a review</CardTitle>
        </CardHeader>
        <CardContent>
          <AddReviewForm businesses={(businesses as BusinessOption[]) ?? []} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-ink-500">No reviews yet.</p>
          ) : (
            <ul className="divide-y divide-surface-muted">
              {(reviews as ReviewRow[]).map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink-900">{r.author_name}</span>
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {r.rating}
                      </span>
                      <span className="truncate text-xs text-ink-500">
                        → {r.business?.name ?? "—"}
                      </span>
                    </div>
                    {r.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-600">{r.body}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DeleteReviewButton reviewId={r.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
