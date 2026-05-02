import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      {/* breadcrumb */}
      <Skeleton className="h-4 w-64 mb-4" />

      {/* gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:h-[400px] aspect-[4/3] md:aspect-auto">
        <Skeleton className="rounded-2xl md:col-span-1 h-full w-full min-h-[200px]" />
        <Skeleton className="rounded-2xl hidden md:block h-full w-full" />
        <Skeleton className="rounded-2xl hidden md:block h-full w-full" />
      </div>

      {/* title block */}
      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* two-column body */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="md:col-span-4 space-y-4">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
