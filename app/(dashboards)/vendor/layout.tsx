import { requireVendorMode } from "@/lib/auth/guards";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is in vendor mode
  await requireVendorMode();

  return children;
}
