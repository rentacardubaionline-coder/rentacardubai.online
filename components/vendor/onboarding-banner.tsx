"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, X, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

interface OnboardingBannerProps {
  hasBusiness: boolean;
  hasKyc: boolean;
}

export function OnboardingBanner({ hasBusiness, hasKyc }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Nothing to show if fully complete
  if ((hasBusiness && hasKyc) || dismissed) return null;

  const missingBusiness = !hasBusiness;
  const missingKyc = !hasKyc;

  const incompleteCount = [missingBusiness, missingKyc].filter(Boolean).length;

  return (
    <div className="relative flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-white shadow-sm">
      {/* Icon */}
      <AlertTriangle className="h-4 w-4 shrink-0 opacity-90" />

      {/* Message */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold">
          {incompleteCount === 2
            ? "Complete your setup to go live"
            : missingBusiness
              ? "Set up your business profile"
              : "Verify your identity to go live"}
        </span>

        {/* Inline step badges */}
        <div className="flex items-center gap-1.5">
          {missingBusiness && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
              <Building2 className="h-2.5 w-2.5" />
              Business
            </span>
          )}
          {missingKyc && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
              <ShieldCheck className="h-2.5 w-2.5" />
              KYC
            </span>
          )}
        </div>

        <span className="hidden sm:block text-xs text-white/70">
          Cars won&apos;t show in search until verified.
        </span>

        <Link
          href="/vendor/onboarding"
          className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold hover:bg-white/30 transition-colors shrink-0"
        >
          Complete setup
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100 hover:bg-white/20 transition-all"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
