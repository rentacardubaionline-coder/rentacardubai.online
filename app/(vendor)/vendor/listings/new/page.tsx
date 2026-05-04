import Link from "next/link";
import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { WizardProgress } from "@/components/vendor/wizard/wizard-progress";
import { Step1Basics } from "@/components/vendor/wizard/step1-basics";
import {
  ArrowLeft,
  Sparkles,
  Camera,
  MessageCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { whatsappUrl, formatPhonePretty } from "@/lib/contact";

export default async function NewListingPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name, city")
    .eq("owner_user_id", profile.id)
    .single();

  if (!business) redirect("/vendor/business");

  const [{ data: makes }, { data: models }, { data: cities }] = await Promise.all([
    supabase.from("makes").select("id, name, slug").order("name"),
    supabase.from("models").select("id, make_id, name, slug, body_type").order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("cities").select("id, name, slug").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="flex min-h-0 flex-col">
      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-surface-muted bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/vendor/listings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to listings</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
            <Sparkles className="size-3.5 text-brand-500" />
            New listing
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
            Step 1 of 5
          </span>
        </div>
      </div>

      {/* ── Hero intro ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-surface-muted bg-gradient-to-br from-brand-50 via-orange-50/60 to-amber-50/40">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-orange-200/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
            {business.name}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
            Add a new vehicle
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-600 sm:text-base">
            Takes about 2 minutes. You can save as draft anytime and finish later — we'll only
            publish once you submit for review.
          </p>
        </div>
      </div>

      {/* ── Main 2-column layout ──────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-28 pt-6 sm:px-6 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Form column */}
        <main className="min-w-0 space-y-5">
          <WizardProgress currentStep={1} />

          <div className="overflow-hidden rounded-none border-0 bg-white sm:rounded-2xl sm:border sm:border-surface-muted sm:shadow-card">
            <header className="border-b border-surface-muted px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-ink-900">Basic details</h2>
                  <p className="text-xs text-ink-500">
                    Make, model, year, and key specs about this vehicle.
                  </p>
                </div>
              </div>
            </header>

            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <Step1Basics
                businessId={business.id}
                makes={makes ?? []}
                models={models ?? []}
                cities={(cities ?? []) as { id: string; name: string; slug: string }[]}
                defaultCity={business.city}
              />
            </div>
          </div>
        </main>

        {/* Tips sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink-900">
                <Sparkles className="size-4 text-brand-500" />
                What gets more leads
              </h3>
              <ul className="space-y-3 text-sm">
                <Tip
                  icon={Camera}
                  title="Upload 5+ photos"
                  body="Listings with a full gallery get up to 3× more inquiries."
                />
                <Tip
                  icon={MessageCircle}
                  title="Respond within 1 hour"
                  body="Customers often book the first agency to reply on WhatsApp."
                />
                <Tip
                  icon={Clock}
                  title="Keep pricing current"
                  body="Accurate daily and weekly rates build trust and reduce haggling."
                />
                <Tip
                  icon={ShieldCheck}
                  title="Set clear policies"
                  body="Mention driver fees, deposit, and mileage limits up-front."
                />
              </ul>
            </div>

            <div className="rounded-2xl bg-ink-900 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Need help?
              </p>
              <p className="mt-1 text-sm text-white/80">
                WhatsApp our vendor support any time — we'll help you build the listing.
              </p>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                <MessageCircle className="size-4 text-green-400" />
                {formatPhonePretty()}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Tip({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-brand-600">
        <Icon className="size-3.5" />
      </div>
      <div>
        <p className="font-bold text-ink-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{body}</p>
      </div>
    </li>
  );
}
