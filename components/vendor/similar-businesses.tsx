import Link from "next/link";
import { Phone, LayoutGrid, ChevronRight } from "lucide-react";
import { getSimilarBusinesses } from "@/lib/vendor/query";

interface SimilarBusinessesProps {
  businessId: string;
  city: string;
}

export async function SimilarBusinesses({ businessId, city }: SimilarBusinessesProps) {
  const similar = await getSimilarBusinesses(city, businessId);

  if (!similar || similar.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <h2 className="text-lg font-bold text-ink-900 mb-6 font-primary">Similar Businesses</h2>
      
      <div className="space-y-6 divide-y divide-black/5">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {similar.map((b: any) => (
          <div key={b.id} className="pt-6 first:pt-0 group">
            <Link 
              href={`/vendors/${b.slug}`}
              className="text-sm md:text-base font-bold text-brand-600 hover:text-brand-700 transition-colors block leading-snug mb-2 group-hover:underline decoration-brand-200"
            >
              {b.name}
            </Link>
            
            <div className="space-y-1.5">
              <p className="text-xs text-ink-500 leading-normal">
                {b.address_line}, {b.city}
              </p>
              
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center gap-2 text-[11px] font-medium text-ink-700">
                  <Phone className="h-3 w-3 text-ink-400" />
                  {b.phone}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-ink-700">
                  <LayoutGrid className="h-3 w-3 text-ink-400" />
                  Category: <span className="text-ink-500">Car rental</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link 
          href="/vendors"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-600 active:scale-95 shadow-md shadow-brand-500/10"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
