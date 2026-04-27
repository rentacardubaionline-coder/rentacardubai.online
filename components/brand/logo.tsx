import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pass `null` to render without a wrapping link (e.g. inside another anchor). */
  href?: string | null;
  /**
   * `mark` shows just the logo image at a square aspect ratio; `wordmark` is
   * the same image since the artwork already includes the rentnowpk wordmark.
   * Kept as a prop for API compatibility with prior callers.
   */
  variant?: "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Retained for API compatibility; the transparent PNG works on both themes. */
  theme?: "light" | "dark";
  className?: string;
}

const SIZES: Record<NonNullable<LogoProps["size"]>, { h: number; w: number }> = {
  // The artwork is roughly square, so width ≈ height. Tuned so the wordmark
  // sits comfortably next to nav text at md and reads at a glance at sm/xs.
  xs: { h: 24, w: 24 },
  sm: { h: 32, w: 32 },
  md: { h: 40, w: 40 },
  lg: { h: 64, w: 64 },
  xl: { h: 72, w: 72 },
};

/**
 * Single source of truth for the RentNowPK brand mark. Renders the
 * transparent-PNG logo from /public so the brand can be swapped centrally.
 */
export function Logo({
  href = "/",
  variant: _variant = "wordmark",
  size = "md",
  theme: _theme,
  className,
}: LogoProps) {
  const sz = SIZES[size];

  const inner = (
    <Image
      src="/logo-transparent.png"
      alt="RentNowPK"
      width={sz.w}
      height={sz.h}
      priority
      className={cn("h-auto w-auto select-none", className)}
      style={{ height: sz.h, width: "auto" }}
    />
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="RentNowPK home"
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-lg"
    >
      {inner}
    </Link>
  );
}
