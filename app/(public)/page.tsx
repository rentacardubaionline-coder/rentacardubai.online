import { HeroSearch } from "@/components/home/hero-search";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedCarsRow } from "@/components/home/featured-cars-row";
import { HowItWorks } from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSearch />
      <CategoryStrip />
      <FeaturedCarsRow />
      <HowItWorks />
    </div>
  );
}
