"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveClaimAction, rejectClaimAction } from "@/app/actions/businesses";

interface ClaimReviewPanelProps {
  claimId: string;
  businessName: string;
}

export function ClaimReviewPanel({ claimId, businessName }: ClaimReviewPanelProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const res = await approveClaimAction(claimId, notes || undefined);
      if (res.error) toast.error(res.error);
      else toast.success(`"${businessName}" claim approved — vendor status granted`);
    });
  }

  function reject() {
    if (!confirm(`Reject the claim for "${businessName}"?`)) return;
    startTransition(async () => {
      const res = await rejectClaimAction(claimId, notes || undefined);
      if (res.error) toast.error(res.error);
      else toast.success("Claim rejected");
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? "Hide review form" : "Review this claim"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Reviewer notes <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the vendor…"
              rows={2}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={approve} disabled={pending} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reject}
              disabled={pending}
              className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
