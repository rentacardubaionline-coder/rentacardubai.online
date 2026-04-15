"use client";

import { type SearchParams } from "@/lib/search/params";
import { FilterContent } from "./filter-content";

interface FiltersSidebarProps {
  initialParams: SearchParams;
}

export function FiltersSidebar({ initialParams }: FiltersSidebarProps) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-full overflow-y-auto pr-2 md:block custom-scrollbar">
      <div className="rounded-2xl border border-surface-muted bg-white p-6 shadow-sm ring-1 ring-black/5">
        <FilterContent initialParams={initialParams} />
      </div>
    </aside>
  );
}
