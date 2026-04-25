"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  ExternalLink,
  Trash2,
  AlertCircle,
  MapPin,
  TrendingUp,
  EyeOff,
  Send,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  submitForApprovalAction,
  deleteListingAction,
  markUnavailableAction,
} from "@/app/actions/listings";
import { formatPkr } from "@/lib/utils";

export type ListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "unavailable";

export interface VendorListing {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: ListingStatus;
  rejection_reason: string | null;
  primary_image_url: string | null;
  created_at: string;
  pricing: { tier: string; price_pkr: number }[];
  leads_this_month: number;
}

const STATUS: Record<
  ListingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  pending: { label: "Under review", bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  approved: { label: "Live", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
  unavailable: { label: "Unavailable", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

export function VendorListingCard({ listing }: { listing: VendorListing }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const badge = STATUS[listing.status] ?? STATUS.draft;
  const dailyPrice = listing.pricing?.find((p) => p.tier === "daily")?.price_pkr;

  function runAction(fn: () => Promise<{ error?: string }>, successMsg?: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else {
        if (successMsg) toast.success(successMsg);
        router.refresh();
      }
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200">
      {/* Cover */}
      <Link
        href={`/vendor/listings/${listing.id}/edit?step=1`}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-surface-muted to-surface-sunken"
      >
        {listing.primary_image_url ? (
          <Image
            src={listing.primary_image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-300">
            No photo uploaded
          </div>
        )}

        {/* Status pill */}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text} shadow-sm ring-1 ring-black/5`}
        >
          <span className={`size-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>

        {/* Leads badge */}
        {listing.leads_this_month > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-900/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            <TrendingUp className="size-3 text-brand-300" />
            {listing.leads_this_month} {listing.leads_this_month === 1 ? "lead" : "leads"}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[15px] font-extrabold text-ink-900 group-hover:text-brand-600">
              {listing.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
              <MapPin className="size-3.5 text-brand-500" />
              {listing.city}
            </div>
          </div>
          {dailyPrice && (
            <div className="shrink-0 text-right">
              <div className="text-sm font-extrabold text-ink-900">
                {formatPkr(dailyPrice)}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                per day
              </div>
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {listing.status === "rejected" && listing.rejection_reason && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <div>
              <span className="font-bold">Reason: </span>
              {listing.rejection_reason}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/vendor/listings/${listing.id}/edit?step=1`} />}
          >
            <Pencil className="mr-1.5 size-3.5" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isPending}
                  aria-label="More actions"
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {listing.status === "approved" && (
                <DropdownMenuItem
                  onClick={() => window.open(`/cars/${listing.slug}`, "_blank")}
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  View on site
                </DropdownMenuItem>
              )}
              {(listing.status === "draft" || listing.status === "rejected") && (
                <DropdownMenuItem
                  onClick={() =>
                    runAction(() => submitForApprovalAction(listing.id), "Submitted for review")
                  }
                >
                  <Send className="mr-2 size-3.5" />
                  Submit for approval
                </DropdownMenuItem>
              )}
              {listing.status === "approved" && (
                <DropdownMenuItem
                  onClick={() =>
                    runAction(() => markUnavailableAction(listing.id), "Marked unavailable")
                  }
                  className="text-amber-600"
                >
                  <EyeOff className="mr-2 size-3.5" />
                  Mark unavailable
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/cars/${listing.slug}`,
                  );
                  toast.success("Link copied");
                }}
              >
                <Copy className="mr-2 size-3.5" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
                  runAction(() => deleteListingAction(listing.id), "Listing deleted");
                }}
                className="text-rose-600"
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
