import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

// Placeholder featured cars
const featuredCars = [
  {
    id: 1,
    slug: "toyota-corolla-2023-abc123",
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    pricePerDay: 4500,
    city: "Karachi",
    image: "https://via.placeholder.com/300x200?text=Toyota+Corolla",
  },
  {
    id: 2,
    slug: "honda-civic-2024-def456",
    make: "Honda",
    model: "Civic",
    year: 2024,
    pricePerDay: 5500,
    city: "Lahore",
    image: "https://via.placeholder.com/300x200?text=Honda+Civic",
  },
  {
    id: 3,
    slug: "suzuki-swift-2023-ghi789",
    make: "Suzuki",
    model: "Swift",
    year: 2023,
    pricePerDay: 3500,
    city: "Islamabad",
    image: "https://via.placeholder.com/300x200?text=Suzuki+Swift",
  },
];

export function FeaturedCarsRow() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="Featured cars"
          description="Popular rentals in high demand"
          action={<Link href="/search" className="text-brand-600 font-medium hover:text-brand-700">View all →</Link>}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="group overflow-hidden rounded-lg border border-border shadow-card transition-all hover:shadow-pop"
            >
              <div className="aspect-video overflow-hidden bg-surface-muted">
                <img
                  src={car.image}
                  alt={`${car.make} ${car.model}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink-900">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-ink-600">{car.year} · {car.city}</p>
                <div className="mt-3 flex items-end justify-between">
                  <Price amount={car.pricePerDay} suffix="/day" size="sm" />
                  <span className="text-xs text-brand-600 font-medium">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
