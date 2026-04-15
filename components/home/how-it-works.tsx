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
    <div className="bg-surface-muted py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="How it works"
          description="Three simple steps to rent your car"
          className="text-center"
        />

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                  <Icon className="size-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
