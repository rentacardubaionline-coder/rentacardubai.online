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

  const [{ data: authUser }, { data: business }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("businesses")
      .select("id, name, city, claim_status")
      .eq("owner_user_id", profile.id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-muted">
      <VendorShell
        profile={{
          full_name: profile.full_name,
          email: authUser.user?.email ?? profile.email ?? "",
        }}
        business={business ?? null}
      >
        {children}
      </VendorShell>
    </div>
  );
}
