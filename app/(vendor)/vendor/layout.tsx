import { requireVendorMode } from "@/lib/auth/guards";
import { VendorShell } from "@/components/layout/vendor-shell";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const db = createAdminClient();

  const [{ data: authUser }, { data: business }, { count: unreadCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("businesses")
      .select("id, name, city, claim_status")
      .eq("owner_user_id", profile.id)
      .maybeSingle(),
    (db as any)
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-muted">
      <VendorShell
        profile={{
          full_name: profile.full_name,
          email: authUser.user?.email ?? profile.email ?? "",
        }}
        business={business ?? null}
        notificationCount={unreadCount ?? 0}
      >
        {children}
      </VendorShell>
    </div>
  );
}
