/**
 * Dashboard skeleton — renders instantly between navigation click and data
 * arrival. The vendor sidebar + header stay put (they're in the layout);
 * only this content area swaps in/out.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className="h-32 rounded-2xl bg-white/70 ring-1 ring-black/5">
        <div className="space-y-3 p-6">
          <div className="h-4 w-40 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-7 w-72 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-3 w-56 animate-pulse rounded-full bg-surface-muted" />
        </div>
      </div>

      {/* Stat tiles row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-black/5"
          >
            <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-muted" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-7 w-16 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-surface-muted" />
          </div>
        ))}
      </div>

      {/* Two-column row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-64 rounded-2xl bg-white animate-pulse ring-1 ring-black/5 lg:col-span-3" />
        <div className="h-64 rounded-2xl bg-white animate-pulse ring-1 ring-black/5 lg:col-span-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-2xl bg-white animate-pulse ring-1 ring-black/5 lg:col-span-2" />
        <div className="h-72 rounded-2xl bg-white animate-pulse ring-1 ring-black/5" />
      </div>
    </div>
  );
}
