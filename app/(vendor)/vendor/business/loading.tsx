export default function Loading() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-44 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-3 w-72 animate-pulse rounded-full bg-surface-muted" />
      </div>

      {/* Cover + logo card */}
      <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <div className="h-44 w-full animate-pulse rounded-xl bg-surface-muted" />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-64 animate-pulse rounded-full bg-surface-muted" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="space-y-3 rounded-2xl bg-white p-6 ring-1 ring-black/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
