import {
  Building2,
  ShieldCheck,
  Car,
  Camera,
  Wallet,
  ScrollText,
  MessageSquare,
  Bell,
  Smartphone,
  TrendingUp,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { GuideTopic } from "@/lib/guides/data";
import { cn } from "@/lib/utils";

const TOPIC_ICON: Record<GuideTopic, LucideIcon> = {
  "business-setup": Building2,
  "kyc": ShieldCheck,
  "add-car": Car,
  "photo": Camera,
  "pricing-guide": Wallet,
  "policies": ScrollText,
  "leads": MessageSquare,
  "notifications": Bell,
  "install": Smartphone,
  "grow-business": TrendingUp,
  "self-drive": Settings2,
};

const TOPIC_EYEBROW: Record<GuideTopic, string> = {
  "business-setup": "Vendor onboarding",
  "kyc": "Identity verification",
  "add-car": "Listing wizard",
  "photo": "Listing photos",
  "pricing-guide": "Pricing playbook",
  "policies": "Vendor policies",
  "leads": "Lead handling",
  "notifications": "Stay alerted",
  "install": "Install the app",
  "grow-business": "Vendor growth",
  "self-drive": "Customer guide",
};

interface GuideHeroProps {
  topic: GuideTopic;
  /** "card" = 16:9 thumbnail used on the index grid.
   *  "detail" = 280px / 420px hero on the article page. */
  size: "card" | "detail";
  title?: string;
}

/**
 * Branded gradient hero. Replaces external photographic hero images for guide
 * cards and article tops — renders entirely from CSS + a Lucide icon, so it
 * never has loading issues. Each topic gets its own icon, but the gradient
 * stays brand-orange across all guides for a coherent set.
 */
export function GuideHero({ topic, size, title }: GuideHeroProps) {
  const Icon = TOPIC_ICON[topic] ?? Settings2;
  const eyebrow = TOPIC_EYEBROW[topic] ?? "Guide";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800",
        size === "card" ? "aspect-[16/9]" : "h-[280px] md:h-[420px]",
      )}
    >
      {/* Decorative orbs for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl md:-right-24 md:-top-24 md:h-80 md:w-80 md:blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-orange-300/25 blur-2xl md:-bottom-24 md:-left-24 md:h-72 md:w-72 md:blur-3xl"
      />

      {/* Diagonal pattern for visual texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, white 0 1px, transparent 1px 16px)",
        }}
      />

      {/* Centered icon */}
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm",
            size === "card" ? "size-14" : "size-20 md:size-28",
          )}
        >
          <Icon
            className={cn(
              "text-white",
              size === "card" ? "size-7" : "size-10 md:size-14",
            )}
            strokeWidth={1.75}
          />
        </div>
        <p
          className={cn(
            "text-center font-extrabold uppercase tracking-[0.2em] text-white/85",
            size === "card" ? "text-[10px]" : "text-xs md:text-sm",
          )}
        >
          {eyebrow}
        </p>
        {size === "detail" && title && (
          <p className="hidden max-w-2xl text-center text-base font-semibold text-white/90 md:block">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
