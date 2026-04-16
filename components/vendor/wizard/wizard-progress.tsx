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
  /** When editing an existing listing, pass its id so steps become clickable links. */
  listingId?: string;
}

export function WizardProgress({ currentStep, listingId }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <nav className="flex items-center gap-0" aria-label="Listing wizard steps">
        {STEPS.map((step, idx) => {
          const done = step.n < currentStep;
          const active = step.n === currentStep;
          const clickable = !!listingId;

          const circle = (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                done && "border-brand-500 bg-brand-500 text-white",
                active && "border-brand-500 bg-white text-brand-600",
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
                "mt-1 hidden text-[10px] font-medium sm:block",
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
                  <>
                    {circle}
                    {label}
                  </>
                )}
              </div>

              {/* Connector line (not after last step) */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
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
