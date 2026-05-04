import { Car, MessageCircle, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Car,
    step: "01",
    title: "Pick Your Car",
    desc: "Browse vehicles by area, model, or budget. Every listing has real photos, AED pricing, and verified dealer reviews.",
    color: "bg-brand-600 text-white",
  },
  {
    icon: MessageCircle,
    step: "02",
    title: "WhatsApp the Dealer",
    desc: "Tap WhatsApp to message the dealer directly. Share your dates, ask any question, and confirm availability in minutes.",
    color: "bg-emerald-600 text-white",
  },
  {
    icon: Zap,
    step: "03",
    title: "Pay a Small Advance & Go",
    desc: "Lock your booking with a small advance. The rest is paid at pickup. No hidden charges — Salik billed transparently.",
    color: "bg-amber-500 text-white",
  },
];

/**
 * Home-page "How Booking Works" — mirrors the template-page treatment from
 * `components/seo/pages/keyword-landing.tsx` so the booking flow looks
 * consistent across the marketplace.
 */
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="rounded-2xl bg-gradient-to-br from-brand-50/80 to-brand-100/40 border border-brand-100 p-6 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900">
            How Booking Works
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            No sign-up needed. No app download. Just WhatsApp and go.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl bg-white p-6 shadow-card"
            >
              <span className="absolute top-4 right-5 text-5xl font-black text-surface-muted/80 select-none leading-none">
                {item.step}
              </span>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4 shadow-sm`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
