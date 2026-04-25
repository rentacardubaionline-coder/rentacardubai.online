import Image from "next/image";

interface BrandedBannerProps {
  /** Photo URL — landscape Unsplash photo works best. */
  imageUrl: string;
  /** Pre-title, all-caps eyebrow text (e.g. "City Guide", "Route Guide"). */
  eyebrow: string;
  /** Main headline shown over the image. */
  title: string;
  /** Optional subheadline. */
  subtitle?: string;
}

/**
 * Photographic hero banner with brand-orange gradient overlay. Used at the top
 * of the long-form content section on city / route / vehicle SEO landings —
 * gives every page a visual anchor while keeping the brand front and centre.
 */
export function BrandedBanner({
  imageUrl,
  eyebrow,
  title,
  subtitle,
}: BrandedBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Photographic background */}
      <div className="relative aspect-[16/7] w-full md:aspect-[16/5]">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      {/* Brand-orange gradient + dark veil for text legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-700/85 via-brand-600/55 to-ink-900/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent"
      />

      {/* Brand mark in the top-right corner */}
      <div
        aria-hidden
        className="absolute right-5 top-5 flex size-12 flex-col items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur md:right-8 md:top-8 md:size-14"
      >
        <span className="text-[14px] font-black leading-none tracking-tighter text-white md:text-base">
          RN
        </span>
        <span className="mt-1 h-[2px] w-4 rounded-full bg-white" />
        <span className="mt-[2px] h-[2px] w-2 rounded-full bg-white/55" />
      </div>

      {/* Copy block */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-7 md:px-10 md:pb-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/80 md:text-xs">
          {eyebrow}
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-black leading-tight text-white md:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/85 md:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
