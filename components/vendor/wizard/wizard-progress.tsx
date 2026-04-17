import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Features" },
  { n: 3, label: "Pricing" },
  { n: 4, label: "Policies" },
  { n: 5, label: "Photos" },
];

interface WizardProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  listingId?: string;
}

export function WizardProgress({ currentStep, listingId }: WizardProgressProps) {
  const pct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);
  const currentLabel = STEPS[currentStep - 1]?.label ?? "";

  return (
    <div className="mb-6">
      {/* Mobile: slim bar + step count */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-700">Step {currentStep} — {currentLabel}</span>
          <span className="text-ink-400">{currentStep}/{STEPS.length}</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop: circles + connector + labels */}
      <nav className="hidden sm:flex items-center gap-0" aria-label="Listing wizard steps">
        {STEPS.map((step, idx) => {
          const done = step.n < currentStep;
          const active = step.n === currentStep;
          const clickable = !!listingId;

          const circle = (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                done && "border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/30",
                active && "border-brand-500 bg-white text-brand-600 shadow-md shadow-brand-500/20 scale-110",
                !done && !active && "border-surface-muted bg-white text-ink-400",
                clickable && !active && "cursor-pointer hover:border-brand-400"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step.n}
            </div>
          );

          const label = (
            <span
              className={cn(
                "mt-1.5 text-[10px] font-semibold whitespace-nowrap",
                active ? "text-brand-600" : done ? "text-ink-500" : "text-ink-400"
              )}
            >
              {step.label}
            </span>
          );

          return (
            <div key={step.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                {clickable && !active ? (
                  <Link href={`/vendor/listings/${listingId}/edit?step=${step.n}`} className="flex flex-col items-center">
                    {circle}
                    {label}
                  </Link>
                ) : (
                  <>{circle}{label}</>
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-all duration-300",
                    step.n < currentStep ? "bg-brand-500" : "bg-surface-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
