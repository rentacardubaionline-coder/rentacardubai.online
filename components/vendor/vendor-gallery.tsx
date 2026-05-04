"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

interface VendorGalleryProps {
  business: any;
}

export function VendorGallery({ business }: VendorGalleryProps) {
  const images: { url: string }[] = business.business_images || [];
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxIdx, images.length]);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="space-y-5">
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 border-l-4 border-brand-500 pl-4">
            Business Gallery
          </h2>
          <p className="text-sm text-ink-500 mt-1 pl-4">
            A visual tour of our showroom and service facilities.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-ink-400 bg-surface-sunken px-3 py-1.5 rounded-full">
          <Camera className="h-3.5 w-3.5" /> {images.length} PHOTOS
        </div>
      </div>

      {/* Mobile: edge-to-edge scroll-snap strip — no lightbox, swipe to pan. */}
      <div className="md:hidden -mx-4">
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] w-[88vw] shrink-0 snap-center overflow-hidden bg-surface-muted"
            >
              <Image
                src={img.url}
                alt={`${business.name} gallery ${i + 1}`}
                fill
                sizes="88vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid that opens a full-screen lightbox on click. */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="relative aspect-square rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer border border-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Open photo ${i + 1}`}
          >
            <Image
              src={img.url}
              alt={`${business.name} gallery ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                View Large
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox — desktop only (mobile uses scroll strip, no lightbox). */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[80] hidden md:grid grid-rows-[auto_1fr_auto] bg-black text-white"
          style={{ height: "100dvh", maxHeight: "100dvh" }}
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal
          aria-label="Photo gallery"
        >
          <div className="row-start-1 flex items-center justify-between px-6 py-3 z-10 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex h-10 items-center rounded-full bg-zinc-900/80 px-4 text-sm font-bold backdrop-blur-md ring-1 ring-white/10">
              {lightboxIdx + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close gallery"
            >
              <X className="size-6" />
            </button>
          </div>

          <div
            className="row-start-2 relative min-h-0 min-w-0 overflow-hidden flex items-center justify-center px-12 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIdx].url}
              alt={`${business.name} — ${lightboxIdx + 1}`}
              loading="eager"
              draggable={false}
              className="absolute inset-0 m-auto max-h-full max-w-full object-contain select-none"
            />
          </div>

          {images.length > 1 && (
            <div
              className="row-start-3 w-full bg-zinc-950/90 backdrop-blur-md border-t border-white/10 px-6 pt-3 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar">
                {images.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIdx(i);
                    }}
                    className={
                      "relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors duration-200 " +
                      (i === lightboxIdx ? "border-brand-500" : "border-white/10 opacity-50 hover:opacity-100")
                    }
                    aria-label={`Go to photo ${i + 1}`}
                  >
                    <Image src={m.url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
