import Link from "next/link";
import { CheckCircle2, Clock, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  firstName: string;
  businessName: string;
  city: string;
  claimStatus: string | null;
};

export function WelcomeBanner({ firstName, businessName, city, claimStatus }: Props) {
  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const isVerified = claimStatus === "claimed";
  const isPending = claimStatus === "pending";

  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-card sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-brand-100/50 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-20 top-16 h-28 w-28 rounded-full bg-brand-200/30 blur-xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-600">
            <Sparkles className="h-3 w-3" />
            <time dateTime={new Date().toISOString()}>{today}</time>
          </p>
          <h1
            id="welcome-heading"
            className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl"
          >
            Welcome back, {firstName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm font-medium text-ink-700">{businessName}</span>
            <span className="text-ink-300" aria-hidden="true">
              ·
            </span>
            <span className="text-sm text-ink-500">{city}</span>

            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Verified
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Under review
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            render={<Link href="/vendor/listings/new" />}
            size="lg"
            className="shadow-pop/40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New listing
          </Button>
        </div>
      </div>
    </section>
  );
}
