"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveScrapedBusinessAction,
  rejectScrapedBusinessAction,
  deleteScrapedBusinessAction,
} from "@/app/actions/scraper";

export function DetailActions({ scrapedId, businessName }: { scrapedId: string; businessName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    if (!confirm(`Import "${businessName}" to the main directory?\n\nImages will be uploaded to Cloudinary.`)) return;
    startTransition(async () => {
      const res = await approveScrapedBusinessAction(scrapedId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Business imported successfully!");
        router.push("/admin/scraper/review");
      }
    });
  }

  function handleReject() {
    const reason = prompt("Reason for rejection (optional):") ?? undefined;
    if (!confirm(`Reject "${businessName}"?`)) return;
    startTransition(async () => {
      const res = await rejectScrapedBusinessAction(scrapedId, reason);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Rejected");
        router.push("/admin/scraper/review");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Permanently delete "${businessName}" from staging? Cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteScrapedBusinessAction(scrapedId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Deleted");
        router.push("/admin/scraper/review");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleApprove}
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-sm"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Approve & Import
      </Button>
      <Button
        onClick={handleReject}
        disabled={pending}
        variant="outline"
        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 h-10 text-sm"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </Button>
      <Button
        onClick={handleDelete}
        disabled={pending}
        variant="ghost"
        className="w-full text-ink-500 hover:text-rose-700 hover:bg-rose-50 h-10 text-sm"
      >
        <Trash2 className="h-4 w-4" />
        Delete from staging
      </Button>
    </div>
  );
}
