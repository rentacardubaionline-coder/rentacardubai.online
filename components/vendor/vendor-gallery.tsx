import Image from "next/image";
import { Camera } from "lucide-react";

interface VendorGalleryProps {
  business: any;
}

export function VendorGallery({ business }: VendorGalleryProps) {
  const images = business.business_images || [];

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="space-y-6">
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 border-l-4 border-brand-500 pl-4">Business Gallery</h2>
          <p className="text-sm text-ink-500 mt-1 pl-4">
            A visual tour of our showroom and service facilities.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-ink-400 bg-surface-sunken px-3 py-1.5 rounded-full">
          <Camera className="h-3.5 w-3.5" /> {images.length} PHOTOS
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img: any, i: number) => (
          <div 
            key={i} 
            className="relative aspect-square rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer border border-black/5"
          >
            <Image
              src={img.url}
              alt={`${business.name} gallery ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                View Large
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
