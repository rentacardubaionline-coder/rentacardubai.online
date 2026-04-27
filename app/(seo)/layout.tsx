import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { getCities } from "@/lib/seo/data";

export default async function SeoLayout({ children }: { children: React.ReactNode }) {
  const cities = await getCities();
  return <MarketplaceShell cities={cities}>{children}</MarketplaceShell>;
}
