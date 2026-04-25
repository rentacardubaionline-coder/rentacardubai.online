import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * `smooth`   — 280ms fade + 14px rise + subtle 0.995→1 scale. Used for the
   *              public marketplace + onboarding where users are exploring.
   * `snappy`   — 160ms fade + 4px rise. Used for vendor / admin dashboards
   *              where every navigation should feel instant.
   */
  variant?: "smooth" | "snappy";
}

/**
 * Server-component wrapper for App Router `template.tsx` files. Applies a CSS
 * keyframe animation on mount — Next re-instantiates templates on every
 * navigation, so the animation plays without any AnimatePresence dance.
 *
 * SSR-safe: the keyframe `from` state is only relevant during the animation;
 * the final paint is the `to` state, so direct loads never show empty pages.
 * Respects `prefers-reduced-motion: reduce` via the CSS media query.
 */
export function PageTransition({
  children,
  variant = "smooth",
}: PageTransitionProps) {
  return (
    <div
      className={cn(
        "min-h-full",
        variant === "smooth" ? "animate-page-smooth" : "animate-page-snappy",
      )}
    >
      {children}
    </div>
  );
}
