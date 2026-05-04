import Link from "next/link";
import { Building2, Car, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toTitleCase } from "@/lib/utils";

type Step = { icon: typeof Building2; title: string; description: string };

const steps: Step[] = [
  {
    icon: Building2,
    title: "Create your business",
    description: "Name, city, phone, and a quick description — takes 2 minutes.",
  },
  {
    icon: Car,
    title: "Add your first listing",
    description: "Upload photos, set price, and pick transmission / fuel details.",
  },
  {
    icon: ShieldCheck,
    title: "Wait for approval",
    description: "Our team reviews submissions within 24 hours.",
  },
  {
    icon: MessageCircle,
    title: "Start receiving leads",
    description: "Renters contact you via WhatsApp and Call — tracked on this dashboard.",
  },
];

export function NoBusinessState({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="onboarding-heading"
        className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-8 shadow-card sm:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-100/50 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-brand-200/30 blur-2xl"
        />

        <div className="relative max-w-2xl space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
            Welcome, {toTitleCase(firstName)}
          </p>
          <h1
            id="onboarding-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl"
          >
            Let&rsquo;s get your business on RentNow
          </h1>
          <p className="text-base text-ink-700">
            Four quick steps between you and your first rental lead. Start by setting up your
            business profile.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button render={<Link href="/vendor/business/new" />} size="lg">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Set up business
            </Button>
            <Button
              render={<Link href="/search" />}
              variant="outline"
              size="lg"
            >
              Explore the marketplace
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="onboarding-steps">
        <h2 id="onboarding-steps" className="sr-only">
          Onboarding steps
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <Card className="h-full shadow-card transition-shadow hover:shadow-pop/10">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        aria-hidden="true"
                        className="text-[10px] font-bold uppercase tracking-widest text-ink-300 tabular-nums"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-ink-900">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-ink-500">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
