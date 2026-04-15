import type { Transition, Variants } from "framer-motion";

/** Wraps every route transition in app/template.tsx. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const pageTransition: Transition = {
  duration: 0.18,
  ease: [0.2, 0, 0.2, 1],
};

/** Mobile sticky CTA bar appearing on scroll-past-hero. */
export const stickyAppear: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

/** Card hover preset — spread onto a motion.div. */
export const cardHover = {
  whileHover: {
    y: -3,
    boxShadow: "0 10px 30px rgba(237,106,42,0.18)",
  },
  transition: { duration: 0.18 },
} as const;

/** Accordion-like open/close. */
export const accordionOpen: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.22, ease: [0.2, 0, 0.2, 1] },
  },
};

/** Stagger helper for search-results first paint. Caps at 20 items. */
export const listItemStagger = (i: number): Transition => ({
  delay: Math.min(i, 19) * 0.05,
  duration: 0.2,
});
