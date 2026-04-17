"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Rocket,
  ArrowLeft,
  X,
  CheckCircle2,
  Car,
  FileText,
} from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import { skipOnboardingAction } from "@/app/actions/onboarding";
import { StepBusiness, type BusinessFormState } from "./step-business";
import { StepKyc } from "./step-kyc";
import { StepTerms } from "./step-terms";
import { StepComplete } from "./step-complete";

type Step = {
  id: number;
  key: "business" | "kyc" | "terms" | "done";
  title: string;
  description: string;
  icon: typeof Building2;
  color: string;
};

const STEPS: Step[] = [
  {
    id: 0,
    key: "business",
    title: "Business Setup",
    description: "Your rental business profile",
    icon: Building2,
    color: "brand",
  },
  {
    id: 1,
    key: "kyc",
    title: "Verify Identity",
    description: "CNIC verification for trust",
    icon: ShieldCheck,
    color: "violet",
  },
  {
    id: 2,
    key: "terms",
    title: "Terms & Agreement",
    description: "Read and accept platform terms",
    icon: FileText,
    color: "amber",
  },
  {
    id: 3,
    key: "done",
    title: "Launch",
    description: "Start listing cars",
    icon: Rocket,
    color: "emerald",
  },
];

interface OnboardingWizardProps {
  profile: { full_name: string | null; email: string };
  initialStep: number;
  hasBusiness: boolean;
  hasKyc: boolean;
  kycStatus: string | null;
  hasTerms: boolean;
}

export function OnboardingWizard({
  profile,
  initialStep,
  hasBusiness: initialHasBusiness,
  hasKyc: initialHasKyc,
  kycStatus,
  hasTerms: initialHasTerms,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [hasBusiness, setHasBusiness] = useState(initialHasBusiness);
  const [hasKyc, setHasKyc] = useState(initialHasKyc);
  const [hasTerms, setHasTerms] = useState(initialHasTerms);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [skipping, setSkipping] = useState(false);

  // Persist business form state across step navigation
  const [bizForm, setBizForm] = useState<BusinessFormState>({
    name: "", phone: "", whatsapp: "", email: profile.email ?? "",
    website: "", description: "", city: "", location: null,
  });

  const firstName = toTitleCase(profile.full_name?.split(" ")[0] ?? "there");
  const currentStepData = STEPS[step];

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleSkipAll = async () => {
    setSkipping(true);
    await skipOnboardingAction();
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ── Left panel — brand + progress ──────────────────────────────────── */}
      <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col bg-gradient-to-b from-brand-700 via-brand-600 to-brand-800 relative overflow-hidden h-dvh sticky top-0">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-32 h-48 w-48 rounded-full bg-brand-900/40 blur-2xl" />
        <div className="pointer-events-none absolute right-8 bottom-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex flex-1 flex-col p-8 pt-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-12 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <span className="text-white font-black text-sm tracking-tighter">RN</span>
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              RentNow<span className="text-brand-200">Pk</span>
            </span>
          </Link>

          {/* Greeting */}
          <div className="mb-10 space-y-2">
            <p className="text-brand-200 text-sm font-medium">Welcome aboard,</p>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {firstName} 👋
            </h1>
            <p className="text-brand-200/80 text-sm leading-relaxed">
              Let&apos;s get your rental business set up in just a few minutes.
            </p>
          </div>

          {/* Step indicator */}
          <nav className="space-y-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = s.id < step || (s.id === 0 && hasBusiness) || (s.id === 1 && hasKyc) || (s.id === 2 && hasTerms);
              const isCurrent = s.id === step;

              return (
                <div
                  key={s.id}
                  className={[
                    "flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200",
                    isCurrent
                      ? "bg-white/15 backdrop-blur-sm"
                      : isDone
                        ? "opacity-70"
                        : "opacity-40",
                  ].join(" ")}
                >
                  {/* Step icon */}
                  <div
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                      isDone
                        ? "bg-emerald-400 text-white"
                        : isCurrent
                          ? "bg-white text-brand-600 shadow-md"
                          : "bg-white/10 text-white/60",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Step text */}
                  <div className="min-w-0">
                    <p
                      className={[
                        "text-sm font-semibold leading-tight",
                        isCurrent ? "text-white" : "text-white/70",
                      ].join(" ")}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">{s.description}</p>
                  </div>

                  {/* Current indicator */}
                  {isCurrent && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom info */}
          <div className="mt-auto pt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
              <Car className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Cars won&apos;t go live yet</p>
                <p className="text-xs text-brand-200/70 leading-relaxed">
                  You can list cars now, but they&apos;ll only appear in search after your
                  business and identity are verified.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSkipAll}
              disabled={skipping}
              className="w-full rounded-xl border border-white/20 px-4 py-2.5 text-center text-xs font-medium text-white/60 transition-all hover:border-white/40 hover:text-white/80 disabled:opacity-50"
            >
              {skipping ? "Redirecting…" : "Skip setup, go to dashboard →"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right panel — form content ──────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-surface-muted bg-white px-4 py-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-white font-black text-xs tracking-tighter">RN</span>
            </div>
            <span className="font-black text-base text-ink-900">
              RentNow<span className="text-brand-600">Pk</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleSkipAll}
            disabled={skipping}
            className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700 transition-colors"
          >
            <X className="h-4 w-4" />
            Skip
          </button>
        </div>

        {/* Mobile step indicator */}
        <div className="flex items-center gap-2 bg-white border-b border-surface-muted px-4 py-3 lg:hidden">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={[
                "h-1.5 flex-1 rounded-full transition-all",
                s.id < step || (s.id === step)
                  ? "bg-brand-500"
                  : "bg-surface-muted",
              ].join(" ")}
            />
          ))}
          <span className="ml-2 text-xs font-medium text-ink-500 shrink-0">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-lg px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {/* Step header */}
                {step < 3 && (
                  <div className="mb-8 space-y-2">
                    <div className="flex items-center gap-2">
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={() => goTo(step - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted hover:text-ink-700 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}
                      <div
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                          step === 0
                            ? "bg-brand-50 text-brand-700"
                            : step === 1
                              ? "bg-violet-50 text-violet-700"
                              : "bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {(() => { const Icon = currentStepData.icon; return <Icon className="h-3 w-3" />; })()}
                        Step {step + 1} of {STEPS.length - 1}
                      </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-ink-900">
                      {step === 0
                        ? "Set up your business"
                        : step === 1
                          ? "Verify your identity"
                          : "Terms & Platform Agreement"}
                    </h2>
                    <p className="text-sm text-ink-500 leading-relaxed">
                      {step === 0
                        ? "Tell us about your rental business. You can always edit this later."
                        : step === 1
                          ? "Upload your CNIC to unlock full listing visibility on the platform."
                          : "Please read the full agreement below. Scroll to the bottom to unlock the acceptance checkbox."}
                    </p>
                  </div>
                )}

                {/* Step content */}
                {step === 0 && (
                  <StepBusiness
                    formState={bizForm}
                    onFormChange={setBizForm}
                    onComplete={() => {
                      setHasBusiness(true);
                      goTo(1);
                    }}
                    onSkip={() => goTo(1)}
                  />
                )}

                {step === 1 && (
                  <StepKyc
                    kycStatus={kycStatus}
                    onComplete={() => {
                      setHasKyc(true);
                      goTo(2);
                    }}
                    onSkip={() => goTo(2)}
                  />
                )}

                {step === 2 && (
                  <StepTerms
                    onComplete={() => {
                      setHasTerms(true);
                      goTo(3);
                    }}
                    onBack={() => goTo(1)}
                  />
                )}

                {step === 3 && (
                  <StepComplete
                    hasBusiness={hasBusiness}
                    hasKyc={hasKyc}
                    firstName={firstName}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
