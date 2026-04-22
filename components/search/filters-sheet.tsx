"use client";

import { useState } from "react";
import { type SearchParams } from "@/lib/search/params";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterContent } from "./filter-content";

interface FiltersSheetProps {
  trigger: React.ReactElement;
  initialParams: SearchParams;
  availableCities: { city: string; count: number }[];
}

export function FiltersSheet({ trigger, initialParams, availableCities }: FiltersSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col h-full border-none">
        <SheetHeader className="px-6 py-4 border-b border-surface-muted text-left">
          <SheetTitle className="text-lg font-bold text-ink-900">Filters</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <FilterContent 
            initialParams={initialParams} 
            availableCities={availableCities}
            onFilterChange={() => setOpen(false)} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
