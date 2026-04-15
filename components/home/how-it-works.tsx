import { Search, MessageCircle, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    number: 1,
    title: "Search",
    description: "Find cars by city, dates, and budget",
    icon: Search,
  },
  {
    number: 2,
    title: "Contact",
    description: "Message vendors directly via WhatsApp",
    icon: MessageCircle,
  },
  {
    number: 3,
    title: "Rent",
    description: "Finalize details and hit the road",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface-muted py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          title="How it works"
          description="Three simple steps to rent your car"
          className="text-center"
        />

        {/* Mobile: horizontal scroll with snap-start */}
        <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="w-[85%] shrink-0 snap-start last:pr-4 last:-mr-4"
              >
                <div className="flex flex-col items-center rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-black/5">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                    <Icon className="size-8 text-brand-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                      Step {step.number}
                    </span>
                    <h3 className="text-xl font-bold text-ink-900">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet & Desktop: grid */}
        <div className="mt-10 hidden grid-cols-3 gap-8 sm:grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 transition-colors group-hover:bg-brand-100">
                  <Icon className="size-8 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {step.description}
                </p>
                {/* Visual connector for desktop */}
                {step.number < 3 && (
                  <div className="absolute left-[calc(50%+4rem)] top-8 hidden w-[calc(100%-8rem)] border-t-2 border-dashed border-ink-100 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
