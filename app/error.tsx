"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/contact";

/**
 * App-shell-level error boundary. Catches any unhandled error rendered inside
 * a route segment. The layout (header / footer) is preserved — only the page
 * body falls back to this UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console + (in production) any wired error
    // reporter — Next.js logs this automatically server-side.
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 via-white to-surface-muted px-8 py-12 md:py-16 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-black/5">
            <AlertTriangle className="h-10 w-10 text-brand-500" />
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-black tracking-tight text-ink-900">
            Something went sideways.
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm md:text-base text-ink-600 leading-relaxed">
            We hit an unexpected error. Try again — most issues clear themselves
            on a second attempt. If it keeps happening, message us on WhatsApp
            and we&rsquo;ll fix it.
          </p>
          {error?.digest && (
            <p className="mt-2 font-mono text-[11px] text-ink-400">
              Error ID: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition-colors"
            >
              <RotateCcw className="size-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-ink-700 hover:bg-surface-muted transition-colors"
            >
              <Home className="size-4" />
              Back to home
            </Link>
            <a
              href={whatsappUrl("Hi DubaiRentACar, I'm getting an error on the website.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="size-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
