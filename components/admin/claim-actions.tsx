"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveClaimAction, rejectClaimAction } from "@/app/actions/businesses";

export function ClaimActions({ claimId }: { claimId: string }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  function approve() {
    startTransition(async () => {
      const res = await approveClaimAction(claimId, notes || undefined);
      if (res.error) toast.error(res.error);
      else toast.success("Claim approved — vendor can now manage this business");
    });
  }

  function reject() {
    if (!confirm("Reject this claim?")) return;
    startTransition(async () => {
      const res = await rejectClaimAction(claimId, notes || undefined);
      if (res.error) toast.error(res.error);
      else toast.success("Claim rejected");
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Reviewer notes (optional)"
        className="block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={approve} disabled={isPending}>
          Approve
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={reject} disabled={isPending}>
          Reject
        </Button>
      </div>
    </div>
  );
}
