import { requireVendorMode } from "@/lib/auth/guards";
import { VendorShell } from "@/components/layout/vendor-shell";
import { createClient } from "@/lib/supabase/server";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <VendorShell
      profile={{
        full_name: profile.full_name,
        email: user?.email ?? profile.email ?? "",
      }}
    >
      {children}
    </VendorShell>
  );
}
