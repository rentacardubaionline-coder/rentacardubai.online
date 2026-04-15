import Link from "next/link";

const categories = [
  { name: "Luxury", iconSrc: "/icons/luxury.svg", href: "/search?bodyType=luxury" },
  { name: "Economy", iconSrc: "/icons/economy-cars.svg", href: "/search?bodyType=economy" },
  { name: "Sports", iconSrc: "/icons/sports-cars.svg", href: "/search?bodyType=sports" },
  { name: "SUV", iconSrc: "/icons/suv.svg", href: "/search?bodyType=suv" },
  { name: "Convertible", iconSrc: "/icons/convertible.svg", href: "/search?bodyType=convertible" },
  { name: "Business", iconSrc: "/icons/business.svg", href: "/search?bodyType=business" },
  { name: "Electric (EV)", iconSrc: "/icons/electric-ev-cars.svg", href: "/search?fuel=electric" },
  { name: "Van", iconSrc: "/icons/van.svg", href: "/search?bodyType=van" },
];

export function CategoryStrip() {
  return (
    <div className="relative z-10 w-full -mt-8 sm:-mt-12 bg-transparent pb-8 max-w-[1400px] mx-auto overflow-hidden">
      <div className="w-full px-4 sm:px-6">
        {/* Scrollable container for mobile, centered on desktop */}
        <div className="flex w-full overflow-x-auto pb-4 gap-2 sm:gap-4 justify-start lg:justify-center no-scrollbar items-center px-2">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px] rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 p-3 sm:p-4 text-center transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <div className="relative w-10 h-6 sm:w-14 sm:h-8 mb-2 flex items-center justify-center">
                <img
                  src={cat.iconSrc}
                  alt={cat.name}
                  className="w-full h-full object-contain brightness-0 invert pointer-events-none"
                />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-white whitespace-nowrap">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
