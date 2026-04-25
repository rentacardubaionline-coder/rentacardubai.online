"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { approveListingAction, rejectListingAction } from "@/app/actions/admin-listings";
import { toast } from "sonner";

interface Props {
  id: string;
  title: string;
  /** True when vendor's KYC is already approved. Used to warn before gating a listing. */
  vendorKycApproved?: boolean;
}

export function ListingReviewActions({ id, title, vendorKycApproved = true }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    // Warn admin up-front: approving a listing of a KYC-unverified vendor
    // marks it reviewed but keeps it off the public site until KYC is OK.
    if (!vendorKycApproved) {
      const ok = confirm(
        `Vendor KYC is not yet approved.\n\n` +
          `Approving "${title}" will mark it as content-reviewed, but it will NOT go live on the public site until you approve the vendor's KYC.\n\n` +
          `Once KYC is approved, this listing (and any others pending) auto-publish.\n\n` +
          `Proceed?`,
      );
      if (!ok) return;
    }

    setLoading("approve");
    const res = await approveListingAction(id);
    if (res.error) {
      toast.error(res.error);
    } else if (res.kycPending) {
      toast.warning(`"${title}" approved — held until KYC is verified`);
    } else {
      toast.success(`"${title}" approved and live`);
    }
    setLoading(null);
  }

  async function handleReject() {
    if (!showReject) { setShowReject(true); return; }
    setLoading("reject");
    const res = await rejectListingAction(id, reason);
    if (res.error) toast.error(res.error);
    else { toast.success(`"${title}" rejected`); setShowReject(false); setReason(""); }
    setLoading(null);
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1">
        <button
          onClick={handleApprove}
          disabled={!!loading}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={loading === "approve"}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors"
        >
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Reject
          {showReject ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {showReject && (
        <div className="flex items-center gap-1 w-full max-w-xs">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (optional)"
            className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-xs text-ink-900 placeholder:text-ink-400 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20"
          />
          <button
            onClick={handleReject}
            disabled={!!loading}
            className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
