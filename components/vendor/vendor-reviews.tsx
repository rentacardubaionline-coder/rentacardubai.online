"use client";

import { useState } from "react";
import { Star, User, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorReviewsProps {
  business: any;
}

export function VendorReviews({ business }: VendorReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const allReviews = business.business_reviews || [];
  const averageRating = business.rating || 0;
  const reviewsCount = business.reviews_count || 0;

  // Show only 4 reviews initially on desktop
  const reviews = showAll ? allReviews : allReviews.slice(0, 4);
  const hasMore = allReviews.length > 4;

  if (allReviews.length === 0) {
    return (
      <section id="reviews" className="space-y-8 py-8">
        <div className="px-4 md:px-0">
          <h2 className="text-2xl font-bold text-ink-900 border-l-4 border-brand-500 pl-4 font-primary">Verified Reviews</h2>
        </div>
        <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-ink-900">No reviews yet</h3>
          <p className="text-sm text-ink-500 mt-2 max-w-sm">
            Be the first to share your experience with this vendor.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="space-y-8 py-8 scroll-mt-24">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 border-l-4 border-brand-500 pl-4 font-primary uppercase tracking-tight">Showroom Reputation</h2>
          <p className="text-sm text-ink-500 mt-1 pl-4">
            Real feedback from {reviewsCount}+ verified customers.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm min-w-[220px]">
          <div className="text-4xl font-black text-ink-900 leading-none">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex flex-col border-l border-black/5 pl-4 ml-4">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn("h-3.5 w-3.5", i < Math.floor(averageRating) ? "fill-current" : "text-slate-200")} 
                />
              ))}
            </div>
            <div className="text-[10px] font-black text-ink-400 uppercase tracking-widest mt-1">
              PLATFORM SCORE
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid / Carousel */}
      <div className="relative">
        <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
          {reviews.map((review: any, i: number) => (
            <div 
              key={i} 
              className="min-w-[85vw] md:min-w-0 snap-center bg-white rounded-2xl p-6 border border-black/5 shadow-sm transition-all hover:shadow-md border-b-4 border-b-transparent hover:border-b-brand-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-surface-sunken rounded-full flex items-center justify-center text-ink-400 border border-black/5 overflow-hidden">
                      {review.reviewer_avatar_url ? (
                        <img 
                          src={review.reviewer_avatar_url} 
                          alt={review.reviewer_name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink-900">{review.reviewer_name}</div>
                      <div className="text-[10px] font-medium text-ink-400 uppercase tracking-wider">
                        Verfied Customer • {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-brand-50 px-2.5 py-1.5 rounded-lg text-xs font-black text-brand-600">
                    <Star className="h-3 w-3 fill-brand-600 shrink-0" />
                    {review.rating.toFixed(1)}
                  </div>
                </div>
                
                <p className="text-[15px] text-ink-700 leading-relaxed italic line-clamp-4">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Show More Button */}
        {hasMore && !showAll && (
          <div className="hidden md:flex justify-end mt-8">
            <button 
              onClick={() => setShowAll(true)}
              className="flex items-center gap-3 bg-white border border-black/10 text-ink-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-ink-900 hover:text-white transition-all shadow-sm active:scale-95 group"
            >
              Read More Reviews 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

