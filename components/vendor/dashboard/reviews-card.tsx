import { Star, MessageSquareDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toTitleCase } from "@/lib/utils";

export type ReviewRow = {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  created_at: string | null;
};

type Props = {
  rating: number | null;
  reviewsCount: number | null;
  reviews: ReviewRow[];
};

function Stars({ value, size = 12 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < full ? "fill-amber-400 text-amber-400" : "fill-ink-100 text-ink-100"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewsCard({ rating, reviewsCount, reviews }: Props) {
  const count = reviewsCount ?? 0;
  // Only use the stored rating if there are actual reviews — prevent stale/default DB values showing
  const avg = count > 0 ? (rating ?? 0) : 0;
  const hasReviews = count > 0;

  return (
    <Card className="shadow-card flex flex-col">
      <CardHeader className="border-b border-surface-muted pb-4">
        <CardTitle className="text-sm font-semibold text-ink-700">
          Reviews
        </CardTitle>

        <div className="mt-3 flex items-center gap-3">
          {hasReviews ? (
            <>
              <span className="text-4xl font-extrabold tracking-tight text-ink-900 tabular-nums leading-none">
                {avg.toFixed(1)}
              </span>
              <div className="space-y-1">
                <Stars value={avg} size={15} />
                <p className="text-xs text-ink-500">
                  {count} review{count === 1 ? "" : "s"}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-ink-400">
              <Stars value={0} size={15} />
              <span className="text-sm text-ink-400">No reviews yet</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 sm:p-5">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <MessageSquareDashed className="h-8 w-8 text-ink-200" />
            <p className="text-sm text-ink-400">
              No reviews yet
            </p>
            <p className="text-xs text-ink-300">
              Reviews from customers will appear here
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="space-y-1.5 border-b border-surface-muted pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink-900">
                    {toTitleCase(r.author_name)}
                  </span>
                  <Stars value={r.rating} size={11} />
                </div>
                {r.body && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-ink-600">
                    {r.body}
                  </p>
                )}
                {r.created_at && (
                  <p className="text-[10px] text-ink-400">
                    {new Date(r.created_at).toLocaleDateString("en-PK", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
