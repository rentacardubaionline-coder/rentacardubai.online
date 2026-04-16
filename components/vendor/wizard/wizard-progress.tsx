import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Pricing" },
  { n: 3, label: "Policies" },
  { n: 4, label: "Images" },
];

export function WizardProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-8">
      <nav className="flex items-center gap-0" aria-label="Listing wizard steps">
        {STEPS.map((step, idx) => {
          const done = step.n < currentStep;
          const active = step.n === currentStep;

          return (
            <div key={step.n} className="flex flex-1 items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    done && "border-brand-500 bg-brand-500 text-white",
                    active && "border-brand-500 bg-white text-brand-600",
                    !done && !active && "border-surface-muted bg-white text-ink-400"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.n}
                </div>
                <span
                  className={cn(
                    "mt-1 hidden text-[10px] font-medium sm:block",
                    active ? "text-brand-600" : done ? "text-ink-500" : "text-ink-400"
                  )}
                >
                  {step.label}
                </span>
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
