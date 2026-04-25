import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pass `null` to render without a wrapping link (e.g. inside another anchor). */
  href?: string | null;
  variant?: "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg";
  /** Color theme for the wordmark text — the mark itself stays brand-orange. */
  theme?: "light" | "dark";
  className?: string;
}

const SIZES = {
  xs: { mark: "size-6", radius: "rounded-md", inner: "text-[10px]", line1: "h-[3px] w-4 mt-1", line2: "h-[2px] w-2 mt-[2px]", text: "text-sm" },
  sm: { mark: "size-7", radius: "rounded-md", inner: "text-[11px]", line1: "h-[3px] w-[18px] mt-[5px]", line2: "h-[2px] w-[10px] mt-[2px]", text: "text-base" },
  md: { mark: "size-9", radius: "rounded-lg", inner: "text-[13px]", line1: "h-[3px] w-5 mt-1.5", line2: "h-[2px] w-2.5 mt-0.5", text: "text-lg" },
  lg: { mark: "size-11", radius: "rounded-xl", inner: "text-[15px]", line1: "h-1 w-7 mt-2", line2: "h-[3px] w-3.5 mt-1", text: "text-xl" },
};

/**
 * Single source of truth for the RentNowPK brand mark and wordmark.
 *
 * Mark: vertical brand-orange gradient (brand-500 → brand-700) inside a rounded
 * square, with "RN" set in extra-black weight and a two-bar "road" accent below
 * to suggest motion / a marketplace foundation.
 *
 * Wordmark: same mark + "RentNow" in ink (or white in dark theme) with the "Pk"
 * suffix flipped to brand-orange so the country pill always pops.
 */
export function Logo({
  href = "/",
  variant = "wordmark",
  size = "md",
  theme = "dark",
  className,
}: LogoProps) {
  const sz = SIZES[size];

  const mark = (
    <span
      aria-hidden
      className={cn(
        sz.mark,
        sz.radius,
        "shrink-0 flex flex-col items-center justify-center",
        "bg-gradient-to-b from-brand-500 to-brand-700",
        "shadow-sm shadow-brand-700/30",
        "transition-transform group-hover:scale-[1.04]",
      )}
    >
      <span
        className={cn(
          "font-black text-white leading-none tracking-tighter",
          sz.inner,
        )}
      >
        RN
      </span>
      {/* Road accent */}
      <span className={cn("rounded-full bg-white", sz.line1)} />
      <span className={cn("rounded-full bg-white/55", sz.line2)} />
    </span>
  );

  const wordmark =
    variant === "wordmark" ? (
      <span
        className={cn(
          sz.text,
          "font-black tracking-tight whitespace-nowrap",
          theme === "light" ? "text-white" : "text-ink-900",
        )}
      >
        RentNow<span className="text-brand-500">Pk</span>
      </span>
    ) : null;

  const inner = (
    <span className={cn("group inline-flex items-center gap-2", className)}>
      {mark}
      {wordmark}
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="RentNowPk home"
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-lg"
    >
      {inner}
    </Link>
  );
}
