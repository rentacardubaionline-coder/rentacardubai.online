import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { KycReviewActions } from "@/components/admin/kyc-review-actions";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { Users, ShieldCheck } from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

const BASE = "/admin/users";

const TABS = [
  { href: BASE,            label: "All Users",   icon: "users", exact: true },
  { href: `${BASE}/kyc`,  label: "KYC Review",  icon: "shield" },
];

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

type KycRow = {
  id: string;
  cnic_number: string;
  front_url: string;
  back_url: string;
  selfie_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  vendor: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 ring-rose-600/20" },
};

export default async function AdminUsersKycPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status: statusFilter = "pending" } = await searchParams;
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (admin as any)
    .from("kyc_documents")
    .select(
      `id, cnic_number, front_url, back_url, selfie_url, status, rejection_reason, created_at,
       vendor:vendor_user_id (full_name, email)`
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query.eq("status", statusFilter);
  }

  const { data: rows } = await query;
  const kyc: KycRow[] = (rows ?? []) as unknown as KycRow[];

  const statusTabs = [
    { key: "pending",  label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all",      label: "All" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink-900">Users</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Review vendor identity documents — CNIC and selfie submissions.
        </p>
      </div>

      {/* Section tabs (Users / KYC) */}
      <AdminTabBar tabs={TABS} />

      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-muted p-1 w-fit">
        {statusTabs.map((t) => (
          <a
            key={t.key}
            href={`?status=${t.key}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === t.key
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {kyc.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center text-ink-400">
          No {statusFilter !== "all" ? statusFilter : ""} KYC submissions found.
        </div>
      ) : (
        <div className="space-y-4">
          {kyc.map((k) => {
            const badge = STATUS_BADGE[k.status] ?? STATUS_BADGE.pending;
            return (
              <div
                key={k.id}
                className="rounded-2xl border border-surface-muted bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink-900">{k.vendor?.full_name ?? "—"}</p>
                    <p className="text-sm text-ink-500">{k.vendor?.email ?? "—"}</p>
                    <p className="mt-1 font-mono text-sm text-ink-700">{k.cnic_number}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-ink-400">{timeAgo(k.created_at)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { src: k.front_url, label: "CNIC Front" },
                    { src: k.back_url,  label: "CNIC Back" },
                    { src: k.selfie_url, label: "Selfie" },
                  ].map(({ src, label }) => (
                    <a key={label} href={src} target="_blank" rel="noopener noreferrer" className="group space-y-1">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-surface-muted bg-surface-muted">
                        <Image
                          src={src}
                          alt={label}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <p className="text-center text-xs text-ink-400">{label}</p>
                    </a>
                  ))}
                </div>

                {k.rejection_reason && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    Rejection reason: {k.rejection_reason}
                  </p>
                )}

                {k.status === "pending" && <KycReviewActions kycId={k.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
