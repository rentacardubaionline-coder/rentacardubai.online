"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVendorReviewAction } from "@/app/actions/reviews";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteVendorReviewAction(reviewId);
      if (res.error) toast.error(res.error);
      else toast.success("Review deleted");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isPending}
      aria-label="Delete review"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}
