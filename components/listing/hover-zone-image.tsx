"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HoverZoneImageProps {
  images: string[];
  alt: string;
  /** "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" etc. */
  sizes: string;
  className?: string;
}

/**
 * Card-level image with hover-zone preview. The image area is divided into
 * N equal vertical zones (one per image, capped at 3). Moving the mouse
 * across the card switches the visible image to that zone — a classifieds /
 * Airbnb-style preview that lets vendors flick through 3 photos without
 * leaving the grid.
 *
 * On touch devices (no hover), only the primary image shows — a tap on the
 * card opens the detail page where the full gallery lives.
 */
export function HoverZoneImage({
  images,
  alt,
  sizes,
  className,
}: HoverZoneImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Cap the hover-zone preview at 3 — beyond that the zones become too narrow
  // to be useful and the indicator strip gets cluttered.
  const previewImages = images.slice(0, 3);
  const zoneCount = Math.max(1, previewImages.length);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el || zoneCount === 1) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    const idx = Math.min(zoneCount - 1, Math.floor(ratio * zoneCount));
    if (idx !== activeIdx) setActiveIdx(idx);
  }

  function handleMouseLeave() {
    setActiveIdx(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative h-full w-full bg-surface-muted",
        className,
      )}
    >
      {/* All preview images stacked; only the active one is visible. Crossfade
          via opacity transition keeps the swap smooth instead of janky. */}
      {previewImages.map((src, i) => (
        <Image
          key={src + i}
          src={src}
          alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
          fill
          sizes={sizes}
          className={cn(
            "absolute inset-0 object-cover transition-opacity duration-200",
            i === activeIdx ? "opacity-100" : "opacity-0",
          )}
          priority={i === 0}
        />
      ))}

      {/* Bottom indicator strip — only renders when there's more than one
          image to preview. Active segment widens slightly for emphasis. */}
      {previewImages.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 bottom-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {previewImages.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] flex-1 rounded-full transition-all",
                i === activeIdx ? "bg-white shadow-sm" : "bg-white/55",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
