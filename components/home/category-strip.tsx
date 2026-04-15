import Link from "next/link";
import { Zap, Users, DollarSign } from "lucide-react";

const categories = [
  {
    name: "Economy",
    description: "Budget-friendly cars",
    icon: DollarSign,
    href: "/search?priceMax=7000",
  },
  {
    name: "SUV",
    description: "Space & comfort",
    icon: Users,
    href: "/search?seats=7",
  },
  {
    name: "Luxury",
    description: "Premium vehicles",
    icon: Zap,
    href: "/search?priceMin=15000",
  },
];

export function CategoryStrip() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="group rounded-lg border border-border p-4 text-center transition-all hover:border-brand-300 hover:shadow-card sm:p-6"
              >
                <Icon className="mx-auto mb-3 size-8 text-brand-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-ink-900">{cat.name}</h3>
                <p className="mt-1 text-sm text-ink-600">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
