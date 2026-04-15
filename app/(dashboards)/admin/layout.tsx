import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is admin
  await requireRole("admin");

  return children;
}
