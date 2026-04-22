import { ListingCard } from "@/components/listing/listing-card";
import { getBusinessListings } from "@/lib/vendor/query";

interface VendorFleetProps {
  business: any;
}

export async function VendorFleet({ business }: VendorFleetProps) {
  const rawListings = await getBusinessListings(business.id);

  if (!rawListings || rawListings.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-6 border border-black/5 text-center">
        <p className="text-sm font-medium text-ink-600">
          Please contact directly via whatsapp to agency to get cars details.
        </p>
      </section>
    );
  }

  // Map database listings to ListingCard interface
  const listings = rawListings.map((l: any) => {
    const dailyPrice = l.pricing?.find((p: any) => p.tier === "daily")?.price_pkr;
    
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      city: l.city,
      primaryImageUrl: l.primary_image_url,
      pricePerDayPkr: dailyPrice,
      business: {
        name: business.name,
        rating: business.rating,
        reviewsCount: business.reviews_count,
        whatsappPhone: business.whatsapp_phone,
        phone: business.phone
      }
    };
  });

  return (
    <section id="fleet" className="space-y-6">
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Available Cars</h2>
          <p className="text-sm text-ink-500 mt-1">
            Browse through our current fleet of {listings.length} vehicles.
          </p>
        </div>
      
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
            source="vendor_profile" 
          />
        ))}
      </div>
    </section>
  );
}
