"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  CheckCircle2,
  Banknote,
  Clock,
  ShieldAlert,
  MessageCircle,
  ListChecks,
  ChevronDown,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptTermsAction } from "@/app/actions/onboarding";
import { toast } from "sonner";
import type { PricingTier } from "@/lib/pricing/tiers";
import { formatAed } from "@/lib/utils";

interface StepTermsProps {
  /** Live per-category pricing — pulled from pricing_tiers in the parent
   *  page so admin updates flow through without a code change. */
  pricingTiers: PricingTier[];
  onComplete: () => void;
  onBack: () => void;
}

export function StepTerms({
  pricingTiers,
  onComplete,
  onBack,
}: StepTermsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasReadAll, setHasReadAll] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrolled = el.scrollTop + el.clientHeight;
    const total = el.scrollHeight;
    const progress = Math.min(100, Math.round((scrolled / total) * 100));
    setScrollProgress(progress);
    if (!hasReadAll && scrolled >= total - 40) {
      setHasReadAll(true);
    }
  }, [hasReadAll]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const handleAgree = async () => {
    if (!agreed || !hasReadAll || submitting) return;
    setSubmitting(true);
    const result = await acceptTermsAction();
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-4">
      {/* ── Scrollable document ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[360px] lg:h-[460px] overflow-y-auto rounded-2xl border border-surface-muted bg-white"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Sticky document header inside scroll box */}
        <div className="sticky top-0 z-10 border-b border-surface-muted bg-white/95 backdrop-blur-sm px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
            RentNow — Vendor Agreement
          </p>
          <p className="text-xs text-ink-400 mt-0.5">
            April 2026 · Read fully before accepting
          </p>
        </div>

        <div className="px-5 py-5 space-y-1">
          {/* ── KEY FACTS — read these first ── */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <KeyFact
              icon={Banknote}
              color="brand"
              label="Lead charge"
              value="By car category — see below"
            />
            <KeyFact
              icon={Clock}
              color="amber"
              label="Billed"
              value="Last day of month"
            />
            <KeyFact
              icon={MessageCircle}
              color="violet"
              label="Response time"
              value="Within 24 hours"
            />
            <KeyFact
              icon={Mail}
              color="emerald"
              label="Payment"
              value="Bank Transfer · Stripe · Card"
            />
          </div>

          {/* ── PER-CATEGORY PRICING TABLE — pulled live from admin pricing ── */}
          <div className="mb-6 overflow-hidden rounded-xl border-2 border-brand-200 bg-brand-50/40">
            <div className="flex items-center gap-2 border-b border-brand-200 bg-brand-100/60 px-4 py-2.5">
              <Banknote className="h-3.5 w-3.5 text-brand-700" />
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-800">
                Per-lead charge by car category
              </p>
            </div>
            <div className="divide-y divide-brand-100">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.code}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900">
                      {tier.label}
                    </p>
                    {tier.description && (
                      <p className="line-clamp-1 text-[11px] text-ink-500">
                        {tier.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-brand-700 ring-1 ring-brand-200">
                    {formatAed(tier.price_pkr)} / lead
                  </span>
                </div>
              ))}
            </div>
            <p className="border-t border-brand-100 bg-brand-50/60 px-4 py-2 text-[11px] text-ink-500">
              Rates are set by RentNow and may change with 30 days&apos; notice.
              The category for each car is decided when you list it.
            </p>
          </div>

          {/* ── Section 1: How it works ── */}
          <DocSection icon={ListChecks} title="How It Works">
            <p>
              When a customer is interested in your car, they submit an{" "}
              <strong>enquiry (lead)</strong>. You receive the customer&apos;s
              contact details, dates, and requirements instantly. You then
              negotiate and confirm the booking directly with the customer —
              RentNow does not handle the booking transaction.
            </p>
          </DocSection>

          {/* ── Section 2: Billing — HIGHLIGHTED ── */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-4 mb-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                <Banknote className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-extrabold text-brand-900">
                Billing & Charges
              </h3>
            </div>
            <ul className="space-y-2.5 text-sm text-ink-700">
              <BulletItem>
                <strong>Per-lead charge by car category</strong> (see table
                above) — charged regardless of whether it converts to a booking.
                The fee is for delivery of a genuine customer enquiry, not the
                outcome.
              </BulletItem>
              <BulletItem>
                <strong>Monthly invoice</strong> on the last calendar day of
                each month. You will receive a full breakdown by email.
              </BulletItem>
              <BulletItem>
                <strong>First-month proration</strong> — your first invoice
                covers only from your activation date to month end.
              </BulletItem>
              <BulletItem>
                <strong>No refunds</strong> for leads that don&apos;t convert
                into bookings.
              </BulletItem>
            </ul>
          </div>

          {/* ── Section 3: Payment ── */}
          <DocSection icon={Banknote} title="Payment">
            <p>
              Invoices are issued manually by our admin team. You must pay
              within <strong>7 days</strong> of the invoice date via bank
              transfer, Stripe, or Card (details on each invoice). Accounts
              overdue beyond <strong>14 days</strong> are suspended until the
              balance is cleared.
            </p>
          </DocSection>

          {/* ── Section 4: Your obligations ── */}
          <DocSection icon={ListChecks} title="Your Obligations">
            <ul className="space-y-2 mt-1">
              <BulletItem>
                <strong>Respond within 24 hours</strong> to every lead. Repeated
                non-responses trigger an account review.
              </BulletItem>
              <BulletItem>
                <strong>Honour confirmed bookings.</strong> Once you confirm —
                by call, WhatsApp, or message — you are obligated to fulfil it.
              </BulletItem>
              <BulletItem>
                <strong>Keep listings accurate.</strong> Real photos, correct
                specs, genuine availability. No stock images.
              </BulletItem>
              <BulletItem>
                <strong>Keep contact details reachable.</strong> Unreachable
                phone or WhatsApp is a suspension trigger.
              </BulletItem>
            </ul>
          </DocSection>

          {/* ── Section 5: Suspension ── */}
          <DocSection icon={ShieldAlert} title="Account Suspension">
            <p className="mb-2">
              We may suspend or terminate your account for:
            </p>
            <ul className="space-y-1.5">
              <BulletItem>
                3+ unresolved customer complaints within 60 days
              </BulletItem>
              <BulletItem>Fraudulent listings or fake reviews</BulletItem>
              <BulletItem>Invoice overdue beyond 14 days</BulletItem>
              <BulletItem>False identity or business information</BulletItem>
              <BulletItem>
                Repeatedly ignoring leads or cancelling confirmed bookings
              </BulletItem>
            </ul>
            <p className="mt-2 text-xs text-ink-400">
              You will be notified by email and given 7 days to respond before
              permanent removal.
            </p>
          </DocSection>

          {/* ── Section 6: Disputes & Rate changes ── */}
          <DocSection icon={MessageCircle} title="Disputes & Rate Changes">
            <p className="mb-2">
              <strong>Disputes:</strong> Raise within 7 days of invoice date at{" "}
              <strong>help@rentacardubai.online</strong> with your invoice
              number. Our decision is final.
            </p>
            <p>
              <strong>Rate changes:</strong> We will give 30 days&apos; email
              notice before changing the per-lead rate. Continued use =
              acceptance of new rates.
            </p>
          </DocSection>

          {/* ── Document footer ── */}
          <div className="mt-5 rounded-xl border border-surface-muted bg-surface-muted/30 px-4 py-3.5 text-center">
            <p className="text-xs text-ink-500 leading-relaxed">
              Clicking{" "}
              <strong className="text-ink-700">
                &ldquo;I Agree &amp; Continue&rdquo;
              </strong>{" "}
              creates a legally binding agreement. A confirmation email will be
              sent to your registered address as your record.
            </p>
          </div>
        </div>
      </div>

      {/* ── Scroll progress ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-medium">
          <span className="text-ink-400">
            {hasReadAll ? "" : "Scroll down to read the full agreement"}
          </span>
          <span className={hasReadAll ? "text-emerald-600" : "text-ink-400"}>
            {hasReadAll ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Fully read
              </span>
            ) : (
              `${scrollProgress}%`
            )}
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className={[
              "h-full rounded-full transition-all duration-200",
              hasReadAll ? "bg-emerald-500" : "bg-brand-500",
            ].join(" ")}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        {!hasReadAll && (
          <button
            type="button"
            onClick={() => {
              const el = scrollRef.current;
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-muted py-1.5 text-[11px] font-medium text-ink-400 hover:text-ink-600 transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
            Scroll to bottom
          </button>
        )}
      </div>

      {/* ── Agreement checkbox ── */}
      <div
        className={[
          "rounded-xl border p-4 transition-all duration-300",
          hasReadAll
            ? "border-brand-200 bg-brand-50/60"
            : "border-surface-muted bg-surface-muted/20 opacity-40 pointer-events-none select-none",
        ].join(" ")}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-brand-600 cursor-pointer shrink-0"
            disabled={!hasReadAll}
          />
          <span className="text-sm text-ink-700 leading-relaxed">
            I have read the full agreement and I understand and accept the{" "}
            <strong className="text-brand-700">
              per-lead pricing by car category
            </strong>
            , monthly invoicing, and all obligations above.
          </span>
        </label>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-4 border-t border-surface-muted pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-500 underline-offset-4 hover:underline hover:text-ink-700 transition-colors"
        >
          ← Back
        </button>
        <Button
          type="button"
          onClick={handleAgree}
          disabled={!hasReadAll || !agreed || submitting}
          className="min-w-44 shadow-md shadow-brand-500/20 h-12 rounded-2xl sm:h-10 sm:rounded-xl"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "I Agree & Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function KeyFact({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: "brand" | "amber" | "violet" | "emerald";
  label: string;
  value: string;
}) {
  const colors = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-surface-muted bg-white p-3">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </p>
        <p className="text-xs font-bold text-ink-900 leading-tight mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function DocSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-surface-muted pt-4 pb-1">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="h-3.5 w-3.5 text-ink-400 shrink-0" />
        <h3 className="text-sm font-bold text-ink-900">{title}</h3>
      </div>
      <div className="text-sm text-ink-600 leading-relaxed pl-[1.375rem]">
        {children}
      </div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 list-none">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
      <span>{children}</span>
    </li>
  );
}
