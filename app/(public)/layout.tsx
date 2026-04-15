import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceShell>{children}</MarketplaceShell>;
}
