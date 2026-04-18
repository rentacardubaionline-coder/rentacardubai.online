"use client";

import { Star, User, X, ExternalLink, MessageSquare } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface GoogleReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  googlePlaceId?: string | null;
  rating: number;
  reviewsCount: number;
  reviews: Array<{
    reviewer_name: string;
    reviewer_avatar_url?: string | null;
    rating: number;
    comment?: string | null;
    created_at: string;
  }>;
}

export function GoogleReviewsModal({
  open, onOpenChange, businessName, googlePlaceId,
  rating, reviewsCount, reviews,
}: GoogleReviewsModalProps) {
  // Google reviews popup URL (opens in new tab)
  const googleReviewsUrl = googlePlaceId
    ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(googlePlaceId)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl p-0 gap-0 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="border-b border-black/5 px-6 py-5 flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold text-ink-900 truncate">
              {businessName}
            </DialogTitle>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 font-bold text-ink-900">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {rating.toFixed(1)}
              </div>
              <span className="text-ink-400">•</span>
              <span className="text-ink-500">{reviewsCount} reviews</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-ink-500" />
          </button>
        </DialogHeader>

        {/* Reviews list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <MessageSquare className="h-10 w-10 text-ink-300 mb-3" />
              <p className="text-sm font-semibold text-ink-600">No reviews yet</p>
              <p className="mt-1 text-xs text-ink-400">
                Be the first to share your experience.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((review, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted overflow-hidden border border-black/5">
                    {review.reviewer_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.reviewer_avatar_url}
                        alt={review.reviewer_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-ink-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900">{review.reviewer_name}</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-3 w-3 ${n <= review.rating ? "fill-amber-500" : "text-slate-200"}`}
                          />
                        ))}
                      </span>
                      <span className="text-[11px] text-ink-400">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — See all on Google */}
        {googleReviewsUrl && (
          <div className="border-t border-black/5 bg-surface-muted/30 px-6 py-4">
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-ink-900 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-white transition-colors"
            >
              View all {reviewsCount} reviews on Google
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-center text-[11px] text-ink-400">
              Opens Google Maps reviews in a new tab
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
