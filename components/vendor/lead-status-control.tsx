"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, Sparkle, X, Circle } from "lucide-react";
import { updateLeadStatusAction, type LeadStatus } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

const STATUSES: {
  value: LeadStatus;
  label: string;
  icon: typeof Circle;
  ring: string;
  text: string;
  bg: string;
}[] = [
  {
    value: "new",
    label: "New",
    icon: Sparkle,
    ring: "ring-brand-200",
    text: "text-brand-700",
    bg: "bg-brand-50",
  },
  {
    value: "contacted",
    label: "Contacted",
    icon: MessageSquare,
    ring: "ring-blue-200",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    value: "won",
    label: "Won",
    icon: CheckCircle2,
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    value: "lost",
    label: "Lost",
    icon: X,
    ring: "ring-rose-200",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
];

interface Props {
  leadId: string;
  current: LeadStatus;
}

/**
 * Optimistic pill — flips to the next status the moment the vendor taps.
 * The server call runs inside `startTransition`; on error we surface a toast
 * and `useOptimistic` automatically reverts to the prop value when the
 * transition resolves. No spinner, no waiting — pill is the confirmation.
 */
export function LeadStatusControl({ leadId, current }: Props) {
  const [, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    current,
    (_prev: LeadStatus, next: LeadStatus) => next,
  );

  const idx = STATUSES.findIndex((s) => s.value === optimisticStatus);
  const safe = idx >= 0 ? STATUSES[idx] : STATUSES[0];
  const next = STATUSES[(idx + 1) % STATUSES.length];
  const Icon = safe.icon;

  function cycle() {
    startTransition(async () => {
      setOptimisticStatus(next.value);
      const res = await updateLeadStatusAction(leadId, next.value);
      if (res.error) toast.error(res.error);
    });
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Change to ${next.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition-all",
        safe.bg,
        safe.text,
        safe.ring,
        "hover:brightness-95 active:scale-95",
      )}
    >
      <Icon className="h-3 w-3" />
      {safe.label}
    </button>
  );
}
