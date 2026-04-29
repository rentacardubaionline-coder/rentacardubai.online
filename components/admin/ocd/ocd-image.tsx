"use client";

import { useState } from "react";
import { Car } from "lucide-react";

interface OcdImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  href?: string;
}

export function OcdImage({ src, alt, className, placeholderClassName, href }: OcdImageProps) {
  const [broken, setBroken] = useState(false);

  const placeholder = (
    <div className={placeholderClassName ?? "flex h-full w-full items-center justify-center bg-surface-muted rounded-lg"}>
      <Car className="h-8 w-8 text-ink-300" />
    </div>
  );

  if (broken) return placeholder;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
