import { requireVendorMode } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { KycForm } from "@/components/vendor/kyc-form";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function VendorKycPage() {
  const profile = await requireVendorMode();
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: kyc } = await (admin as any)
    .from("kyc_documents")
    .select("id, status, rejection_reason, created_at")
    .eq("vendor_user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Identity Verification (KYC)</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verify your identity to build trust with renters and unlock full platform features.
        </p>
      </div>

      {kyc?.status === "approved" && (
        <div className="flex items-start gap-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">Identity verified</p>
            <p className="mt-0.5 text-sm text-emerald-700">
              Your KYC has been approved. Your business profile will show a verified badge.
            </p>
          </div>
        </div>
      )}

      {kyc?.status === "pending" && (
        <div className="flex items-start gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <Clock className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Verification under review</p>
            <p className="mt-0.5 text-sm text-amber-700">
              We&apos;ve received your documents and are reviewing them. This typically takes 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {kyc?.status === "rejected" && (
        <div className="flex items-start gap-4 rounded-2xl bg-rose-50 border border-rose-200 p-5">
          <XCircle className="h-6 w-6 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-800">Verification rejected</p>
            {kyc.rejection_reason && (
              <p className="mt-0.5 text-sm text-rose-700">{kyc.rejection_reason}</p>
            )}
            <p className="mt-2 text-sm text-rose-600">
              Please correct the issue and resubmit below.
            </p>
          </div>
        </div>
      )}

      {(!kyc || kyc.status === "rejected") && (
        <KycForm />
      )}
    </div>
  );
}
