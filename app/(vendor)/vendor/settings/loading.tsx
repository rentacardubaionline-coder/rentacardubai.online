export default function Loading() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-3 w-64 animate-pulse rounded-full bg-surface-muted" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-surface-muted">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-28 animate-pulse rounded-md bg-surface-muted"
          />
        ))}
      </div>

      {/* Body cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl bg-white p-6 ring-1 ring-black/5"
          >
            <div className="h-4 w-44 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-72 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
