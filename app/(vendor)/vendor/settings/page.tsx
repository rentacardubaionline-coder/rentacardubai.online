import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsTabs } from "@/components/vendor/settings-tabs";

export default async function VendorSettingsPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [
    { data: { user } },
    { data: business },
    kycRes,
  ] = await Promise.all([
    supabase.auth.getUser(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("businesses")
      .select("id, name, logo_url")
      .eq("owner_user_id", profile.id)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from("kyc_documents")
      .select("status")
      .eq("vendor_user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const kycStatus = (kycRes?.data?.status ?? null) as
    | "approved" | "pending" | "rejected" | null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your profile, security, and account preferences.
        </p>
      </div>

      <SettingsTabs
        profile={{
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
        }}
        email={user?.email ?? ""}
        memberSince={profile.created_at ?? null}
        role={profile.role}
        isVendor={profile.is_vendor ?? false}
        kycStatus={kycStatus}
        business={
          business
            ? { id: business.id, name: business.name, logo_url: business.logo_url ?? null }
            : null
        }
      />
    </div>
  );
}
