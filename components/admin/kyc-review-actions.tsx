"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveKycAction, rejectKycAction } from "@/app/actions/kyc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function KycReviewActions({ kycId }: { kycId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveKycAction(kycId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("KYC approved");
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!rejecting) {
      setRejecting(true);
      return;
    }
    startTransition(async () => {
      const result = await rejectKycAction(kycId, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("KYC rejected");
        setRejecting(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 border-t border-surface-muted pt-4">
      {rejecting && (
        <div className="space-y-2">
          <Input
            placeholder="Rejection reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
          />
        </div>
      )}
      <div className="flex gap-3">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleApprove}
          disabled={isPending || rejecting}
        >
          {isPending && !rejecting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          )}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`flex-1 ${rejecting ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100" : "text-rose-600 hover:bg-rose-50 hover:border-rose-200"}`}
          onClick={handleReject}
          disabled={isPending && rejecting}
        >
          {isPending && rejecting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
          )}
          {rejecting ? "Confirm Reject" : "Reject"}
        </Button>
        {rejecting && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setRejecting(false); setReason(""); }}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
