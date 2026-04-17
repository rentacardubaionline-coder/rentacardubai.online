import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return <MarketplaceShell>{children}</MarketplaceShell>;
}
