import Link from "next/link";
import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <WifiOff className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-ink-900">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-ink-500">
          Check your connection and try again. Some recently opened pages may still be
          available from your device cache.
        </p>
        <Link
          href="/vendor"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Retry
        </Link>
      </div>
    </div>
  );
}
