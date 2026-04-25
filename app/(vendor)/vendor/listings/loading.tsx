export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-surface-muted" />
      </div>

      {/* Listing rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5"
          >
            <div className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-surface-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded-full bg-surface-muted" />
              <div className="h-3 w-32 animate-pulse rounded-full bg-surface-muted" />
            </div>
            <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-surface-muted sm:block" />
            <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
