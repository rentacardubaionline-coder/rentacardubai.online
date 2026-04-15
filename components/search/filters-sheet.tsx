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
}

export function FiltersSheet({ trigger, initialParams }: FiltersSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-[2.5rem] p-0 border-none shadow-2xl">
        <SheetHeader className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-surface-muted/50">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-surface-muted" />
          <SheetTitle className="text-left font-black text-2xl tracking-tight text-ink-900">Filters</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-12 pt-4">
          <FilterContent 
            initialParams={initialParams} 
            // Optional: Auto-close on interaction if you prefer, but the user asked for auto-apply.
            // Usually on mobile we keep it open so they can change multiple things.
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
