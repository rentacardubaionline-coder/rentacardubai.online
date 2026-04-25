export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-3 w-72 animate-pulse rounded-full bg-surface-muted" />
      </div>

      {/* Total leads card */}
      <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <div className="h-3 w-28 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-9 w-16 animate-pulse rounded-full bg-surface-muted" />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 border-b border-surface-muted">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-md bg-surface-muted"
          />
        ))}
      </div>

      {/* Leads table */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-surface-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-40 animate-pulse rounded-full bg-surface-muted" />
                <div className="h-3 w-28 animate-pulse rounded-full bg-surface-muted" />
              </div>
              <div className="h-7 w-24 animate-pulse rounded-full bg-surface-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
