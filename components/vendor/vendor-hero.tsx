import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Phone, MessageCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorHeroProps {
  business: any;
  fleetCount: number;
}

export function VendorHero({ business, fleetCount }: VendorHeroProps) {
  // Extract images and ensure we have at least 4
  const rawImages = business.business_images || [];
  const placeholders = [
    "https://images.unsplash.com/photo-1562233237-10d744a7759d?w=800&q=80",
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
    "https://images.unsplash.com/photo-1552083974-5dbb6b1d3504?w=800&q=80",
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
  ];

  const images = [...rawImages];
  if (images.length < 5) {
    const diff = 5 - images.length;
    for (let i = 0; i < diff; i++) {
      images.push({ 
        url: placeholders[i % placeholders.length] 
      });
    }
  }

  const rating = business.rating || 0;
  const reviewsCount = business.reviews_count || 0;

  return (
    <div className="bg-surface-muted/40 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-ink-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/vendors" className="hover:text-brand-600 transition-colors">Rentals</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink-900 font-medium truncate">{business.name}</span>
        </nav>

        {/* Desktop: Premium 4-Column Layout (3-3-2-2 Grid) */}
        <div className="hidden md:grid grid-cols-10 gap-2.5 h-[460px] mb-8">
          {/* Column 1: Main (Left) */}
          <div className="relative col-span-3 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
            <Image
              src={images[0].url}
              alt={business.name}
              fill
              sizes="30vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-600 shadow-sm border border-brand-100">
                <span className="text-sm">📣</span> Special Offer
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600 shadow-sm border border-purple-100">
                <span className="text-sm">💎</span> Premium
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="relative col-span-3 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
            <Image
              src={images[1].url}
              alt={`${business.name} gallery 2`}
              fill
              sizes="30vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Column 3: Stacked */}
          <div className="col-span-2 flex flex-col gap-2.5">
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
              <Image
                src={images[2].url}
                alt={`${business.name} gallery 3`}
                fill
                sizes="20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
              <Image
                src={images[3].url}
                alt={`${business.name} gallery 4`}
                fill
                sizes="20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Column 4 */}
          <div className="relative col-span-2 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
            <Image
              src={images[4]?.url || images[0].url}
              alt={`${business.name} gallery 5`}
              fill
              sizes="20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Show All Photos Button */}
            <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink-900 shadow-lg ring-1 ring-black/5 hover:bg-surface-sunken transition-all active:scale-95">
              Show all photos
            </button>
          </div>
        </div>

        {/* Mobile View (Simple Carousel/Strip) */}
        <div className="md:hidden flex snap-x snap-mandatory overflow-x-auto gap-3 py-4 -mx-4 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
          {images.slice(0, 5).map((img, i) => (
            <div key={i} className="relative aspect-[4/3] w-[85vw] shrink-0 snap-center rounded-xl overflow-hidden shadow-md">
              <Image src={img.url} alt={`${business.name} ${i}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Identity Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Rectangular Logo with Light Grey Border */}
            <div className="h-20 w-20 md:h-20 md:w-20 bg-white p-2 border border-slate-300 rounded-lg shrink-0 overflow-hidden shadow-sm">
              <div className="relative h-full w-full rounded-xl bg-surface-muted overflow-hidden">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold text-3xl">
                    {business.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-2">
                {business.name}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5 font-medium text-brand-600">
                  <MapPin className="h-4 w-4" /> {business.city}
                </div>
                
                <Link href="#reviews" className="flex items-center gap-2 group cursor-pointer">
                  <div className="relative inline-flex">
                    {/* Empty Stars */}
                    <div className="flex text-slate-200">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    {/* Filled Stars */}
                    <div 
                      className="absolute top-0 left-0 flex overflow-hidden text-amber-500 whitespace-nowrap" 
                      style={{ width: `${(business.rating || 0) * 20}%` }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current shrink-0" />
                      ))}
                    </div>
                  </div>
                  <span className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors">{rating.toFixed(1)}</span>
                  <span className="text-ink-500 group-hover:text-brand-600 underline decoration-slate-200 decoration-1 underline-offset-4 transition-colors">({reviewsCount} reviews)</span>
                </Link>

                {business.established_year && (
                  <span className="text-ink-500">
                    Est. {business.established_year}
                  </span>
                )}
                <span className="text-ink-500">•</span>
                <span className="font-semibold text-ink-700">{fleetCount} Cars Available</span>
              </div>
            </div>
          </div>


          {/* Action Button - WhatsApp Only */}
          <div className="w-full md:w-auto">
            <a
              href={business.whatsapp_phone ? `https://wa.me/${business.whatsapp_phone.replace(/[^\d]/g, "")}` : "#"}
              target="_blank"
              rel="nofollow noopener"
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-xl px-10 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-[#25D366]/20",
                !business.whatsapp_phone ? "pointer-events-none opacity-50 bg-slate-300" : "bg-[#25D366]"
              )}
            >
              <MessageCircle className="h-5 w-5 fill-white/20" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


