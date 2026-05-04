import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pass `null` to render without a wrapping link (e.g. inside another anchor). */
  href?: string | null;
  /**
   * `mark` shows just the logo image at a square aspect ratio; `wordmark` is
   * the same image since the artwork already includes the brand wordmark.
   * Kept as a prop for API compatibility with prior callers.
   */
  variant?: "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Retained for API compatibility; the transparent PNG works on both themes. */
  theme?: "light" | "dark";
  className?: string;
}

const SIZE_PX: Record<NonNullable<LogoProps["size"]>, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 72,
};

/**
 * Single source of truth for the DubaiRentACar brand mark. Renders the
 * transparent-PNG logo from /public so the brand can be swapped centrally.
 *
 * Uses a plain <img> rather than next/image: this is a small, frequently
 * repeated logo where the optimisation pipeline (and its variant URLs) is
 * actively unhelpful — a direct request to /logo-transparent.png is cached
 * by the CDN once and served instantly forever after.
 */
export function Logo({
  href = "/",
  variant: _variant = "wordmark",
  size = "md",
  theme: _theme,
  className,
}: LogoProps) {
  const px = SIZE_PX[size];

  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-transparent.png"
      alt="DubaiRentACar"
      width={px}
      height={px}
      className={cn("select-none", className)}
      style={{ height: px, width: "auto" }}
      decoding="async"
      fetchPriority="high"
    />
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      aria-label="DubaiRentACar home"
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-lg"
    >
      {inner}
    </Link>
  );
}
