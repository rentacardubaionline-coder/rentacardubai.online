"use client";

import { useState } from "react";
import { cn, toTitleCase } from "@/lib/utils";
import { BusinessProfileForm } from "@/components/vendor/business-profile-form";
import { BusinessImagesGrid } from "@/components/vendor/business-images-grid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutList, Camera, Star, User, MessageSquareDashed } from "lucide-react";

type Tab = "details" | "photos" | "reviews";

interface BusinessImage {
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

interface BusinessReview {
  id: string;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  address_line: string | null;
  city: string;
}

interface BusinessPageTabsProps {
  business: Business;
  images: BusinessImage[];
  reviews: BusinessReview[];
}

export function BusinessPageTabs({ business, images, reviews }: BusinessPageTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const tabs: { id: Tab; label: string; Icon: typeof LayoutList; count?: number }[] = [
    { id: "details", label: "Details",  Icon: LayoutList },
    { id: "photos",  label: "Photos",   Icon: Camera,  count: images.length },
    { id: "reviews", label: "Reviews",  Icon: Star,    count: reviews.length },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex border-b border-surface-muted">
        {tabs.map(({ id, label, Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {typeof count === "number" && count > 0 && (
                <span className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  active ? "bg-brand-100 text-brand-700" : "bg-surface-muted text-ink-500",
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Details ──────────────────────────────────────────────────────────── */}
      {activeTab === "details" && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Business Information</CardTitle>
            <CardDescription>
              Update your business contact details and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm business={business} />
          </CardContent>
        </Card>
      )}

      {/* ── Photos ───────────────────────────────────────────────────────────── */}
      {activeTab === "photos" && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Photos</CardTitle>
            <CardDescription>
              Upload up to 5 photos. The first (cover) photo appears in search results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessImagesGrid businessId={business.id} initialImages={images} />
          </CardContent>
        </Card>
      )}

      {/* ── Reviews ──────────────────────────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Customer Reviews</CardTitle>
                <CardDescription className="mt-1">
                  Reviews left by customers after renting from your business.
                </CardDescription>
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 border border-amber-100 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-ink-900">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-ink-400">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                  <MessageSquareDashed className="h-6 w-6 text-ink-300" />
                </div>
                <p className="text-sm font-semibold text-ink-500">No reviews yet</p>
                <p className="mt-1 text-xs text-ink-400">
                  Reviews will appear here once customers rate your service.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-surface-muted bg-surface-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted border border-black/5 overflow-hidden">
                          {review.reviewer_avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.reviewer_avatar_url}
                              alt={review.reviewer_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-ink-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {toTitleCase(review.reviewer_name)}
                          </p>
                          <p className="text-[11px] text-ink-400">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-surface-muted text-surface-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-ink-600 leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
