"use client";

import Link from "next/link";
import { CheckCircle2, Car, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepCompleteProps {
  hasBusiness: boolean;
  hasKyc: boolean;
  firstName: string;
}

export function StepComplete({ hasBusiness, hasKyc, firstName }: StepCompleteProps) {
  const allDone = hasBusiness && hasKyc;

  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-md"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3 max-w-sm"
      >
        <h2 className="text-2xl font-extrabold text-ink-900">
          {allDone ? `You're all set, ${firstName}!` : `Great start, ${firstName}!`}
        </h2>
        <p className="text-base text-ink-600 leading-relaxed">
          {allDone
            ? "Your business profile and identity are submitted for review. You can start listing cars right now!"
            : "You've completed the first step. Finish the remaining setup to go live — your cars won't appear in search until everything is verified."}
        </p>
      </motion.div>

      {/* Status checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-sm space-y-2"
      >
        <StatusItem
          done={hasBusiness}
          label="Business profile"
          doneText="Submitted for review"
          pendingText="Set up your business"
          pendingHref="/vendor/onboarding"
        />
        <StatusItem
          done={hasKyc}
          label="Identity verification"
          doneText="Under review (1–2 business days)"
          pendingText="Upload your CNIC"
          pendingHref="/vendor/onboarding"
        />
        <StatusItem
          done={false}
          label="First car listing"
          doneText="Listed"
          pendingText="Add your first car"
          pendingHref="/vendor/listings/new"
          isOptional
        />
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button
          render={<Link href="/vendor/listings/new" />}
          size="lg"
          className="w-full shadow-lg shadow-brand-500/25 justify-center gap-2"
        >
          <Car className="h-5 w-5" />
          Add my first car
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          render={<Link href="/vendor" />}
          variant="outline"
          size="lg"
          className="w-full justify-center"
        >
          Go to dashboard
        </Button>
      </motion.div>
    </div>
  );
}

function StatusItem({
  done,
  label,
  doneText,
  pendingText,
  pendingHref,
  isOptional,
}: {
  done: boolean;
  label: string;
  doneText: string;
  pendingText: string;
  pendingHref: string;
  isOptional?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-3 text-left",
        done
          ? "border-emerald-200 bg-emerald-50"
          : isOptional
            ? "border-surface-muted bg-white"
            : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          done
            ? "bg-emerald-500 text-white"
            : isOptional
              ? "bg-surface-muted text-ink-400"
              : "bg-amber-100 text-amber-600",
        ].join(" ")}
      >
        <CheckCircle2 className="h-4 w-4" strokeWidth={done ? 2.5 : 1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-700">{label}</p>
        <p
          className={[
            "text-xs",
            done ? "text-emerald-600" : isOptional ? "text-ink-400" : "text-amber-700",
          ].join(" ")}
        >
          {done ? doneText : pendingText}
        </p>
      </div>
      {isOptional && !done && (
        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
          optional
        </span>
      )}
    </div>
  );
}
