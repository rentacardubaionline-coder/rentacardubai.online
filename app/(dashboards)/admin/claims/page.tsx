import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClaimActions } from "@/components/admin/claim-actions";

interface ClaimRow {
  id: string;
  status: string;
  created_at: string;
  reviewer_notes: string | null;
  business: { id: string; name: string; city: string; slug: string } | null;
  claimant: { id: string; email: string; full_name: string | null } | null;
}

export default async function AdminClaimsPage() {
  await requireRole("admin");
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClaims } = await (supabase as any)
    .from("business_claims")
    .select(
      `id, status, created_at, reviewer_notes,
       business:business_id(id, name, city, slug),
       claimant:claimant_user_id(id, email, full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const claims = (rawClaims ?? []) as ClaimRow[];
  const pending = claims.filter((c) => c.status === "pending");
  const resolved = claims.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Business Claims</h1>
        <p className="mt-2 text-ink-600">
          Review vendor requests to claim their business on RentNowPk.
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Pending ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-ink-500">No pending claims.</p>
          ) : (
            <ul className="divide-y divide-surface-muted">
              {pending.map((claim) => (
                <li key={claim.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-900">
                        {claim.business?.name ?? "—"}{" "}
                        <span className="font-normal text-ink-500">· {claim.business?.city}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-ink-500">
                        Claimant:{" "}
                        <strong>{claim.claimant?.full_name ?? claim.claimant?.email ?? "—"}</strong>
                        {" "}({claim.claimant?.email})
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        Submitted {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 shrink-0">Pending</Badge>
                  </div>
                  <ClaimActions claimId={claim.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {resolved.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-surface-muted">
              {resolved.map((claim) => (
                <li key={claim.id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">{claim.business?.name ?? "—"}</p>
                    <p className="text-xs text-ink-400">{claim.claimant?.email}</p>
                  </div>
                  <Badge
                    className={
                      claim.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }
                  >
                    {claim.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
