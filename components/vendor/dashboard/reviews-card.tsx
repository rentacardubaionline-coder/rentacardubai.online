import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          className={i < full ? "fill-amber-400 text-amber-400" : "text-ink-300"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewsCard({ rating, reviewsCount, reviews }: Props) {
  const avg = rating ?? 0;
  const count = reviewsCount ?? 0;

  return (
    <Card className="shadow-card">
      <CardHeader className="border-b border-surface-muted pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-500">
          Reviews
        </CardTitle>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
            {avg.toFixed(1)}
          </span>
          <Stars value={avg} size={16} />
          <span className="text-xs text-ink-500">
            {count} review{count === 1 ? "" : "s"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-500">
            No reviews yet — admin-curated reviews will appear here.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="space-y-1 border-b border-surface-muted pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink-900">
                    {r.author_name}
                  </span>
                  <Stars value={r.rating} />
                </div>
                {r.body && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-ink-700">
                    {r.body}
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
