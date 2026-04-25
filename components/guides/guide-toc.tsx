"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GuideTocProps {
  items: { id: string; text: string }[];
}

/**
 * Sticky table of contents for guide articles. Highlights the current section
 * via IntersectionObserver. Hidden on mobile (where it would just be noise);
 * sticks to the left rail on desktop.
 */
export function GuideToc({ items }: GuideTocProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
        On this page
      </p>
      <ul className="mt-3 space-y-2 border-l-2 border-surface-muted pl-4">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "-ml-[18px] block border-l-2 pl-4 text-sm leading-snug transition-colors",
                  isActive
                    ? "border-brand-500 font-bold text-brand-700"
                    : "border-transparent text-ink-500 hover:text-ink-800",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
