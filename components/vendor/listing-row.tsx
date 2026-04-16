"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { MoreVertical, Pencil, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  submitForApprovalAction,
  deleteListingAction,
  markUnavailableAction,
} from "@/app/actions/listings";
import { formatPkr } from "@/lib/utils";

type ListingStatus = "draft" | "pending" | "approved" | "rejected" | "unavailable";

interface ListingRowData {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: ListingStatus;
  rejection_reason: string | null;
  primary_image_url: string | null;
  created_at: string;
  pricing: { tier: string; price_pkr: number }[];
}

const STATUS_BADGE: Record<ListingStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-surface-muted text-ink-500" },
  pending: { label: "Under review", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Live", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-600" },
  unavailable: { label: "Unavailable", className: "bg-surface-muted text-ink-400" },
};

export function ListingRow({ listing }: { listing: ListingRowData }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const badge = STATUS_BADGE[listing.status] ?? STATUS_BADGE.draft;
  const dailyPrice = listing.pricing?.find((p) => p.tier === "daily")?.price_pkr;

  function runAction(fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5">
        {/* Thumbnail */}
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          {listing.primary_image_url ? (
            <Image src={listing.primary_image_url} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-300">No photo</div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-ink-900">{listing.title}</p>
            <Badge className={badge.className}>{badge.label}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-ink-500">
            {listing.city}
            {dailyPrice ? ` · ${formatPkr(dailyPrice)}/day` : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Base UI Button: use render prop for link-as-button */}
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/vendor/listings/${listing.id}/edit?step=1`} />}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="icon" variant="ghost" disabled={isPending} />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {listing.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => runAction(() => submitForApprovalAction(listing.id))}
                >
                  Submit for approval
                </DropdownMenuItem>
              )}
              {listing.status === "approved" && (
                <DropdownMenuItem
                  onClick={() => {
                    window.open(`/cars/${listing.slug}`, "_blank");
                  }}
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  View on site
                </DropdownMenuItem>
              )}
              {listing.status === "approved" && (
                <DropdownMenuItem
                  onClick={() => runAction(() => markUnavailableAction(listing.id))}
                  className="text-amber-600"
                >
                  Mark unavailable
                </DropdownMenuItem>
              )}
              {listing.status === "draft" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (!confirm("Delete this draft? This cannot be undone.")) return;
                      runAction(() => deleteListingAction(listing.id));
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete draft
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Rejection reason */}
      {listing.status === "rejected" && listing.rejection_reason && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Rejection reason: </span>
            {listing.rejection_reason}
          </div>
        </div>
      )}
    </div>
  );
}
