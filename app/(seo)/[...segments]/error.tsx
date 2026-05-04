"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Search } from "lucide-react";
import Link from "next/link";

export default function SeoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[seo/error.tsx]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-16 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100 mb-5">
        <AlertTriangle className="h-8 w-8 text-brand-500" />
      </div>
      <h1 className="text-2xl font-black text-ink-900">This page didn&rsquo;t load.</h1>
      <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto">
        A temporary issue stopped the listings from loading. Try again, or
        browse all available cars.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600 transition-colors"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
        <Link
          href="/search"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-ink-700 hover:bg-surface-muted transition-colors"
        >
          <Search className="size-4" /> Browse all cars
        </Link>
      </div>
    </div>
  );
}
