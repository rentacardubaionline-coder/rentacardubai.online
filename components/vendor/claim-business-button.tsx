"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimBusinessAction } from "@/app/actions/businesses";
import { Flag } from "lucide-react";

export function ClaimBusinessButton({ businessId }: { businessId: string }) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await claimBusinessAction(businessId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          "Claim request sent! Our team will contact you on WhatsApp to verify and approve."
        );
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={isPending}>
      <Flag className="mr-2 h-4 w-4" />
      {isPending ? "Sending request…" : "Claim this business"}
    </Button>
  );
}
