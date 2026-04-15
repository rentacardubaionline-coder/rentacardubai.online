import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar Skeleton */}
        <aside className="hidden space-y-6 md:block">
          <div className="rounded-lg border border-surface-muted bg-white p-4 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="space-y-6 md:col-span-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-full md:hidden" />
            <Skeleton className="ml-auto h-10 w-40" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border p-4">
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
