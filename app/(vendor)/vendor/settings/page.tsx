import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/vendor/settings-form";

export default async function VendorSettingsPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your account security and preferences.
        </p>
      </div>

      <SettingsForm
        email={user?.email ?? ""}
        role={profile.role}
        isVendor={profile.is_vendor ?? false}
        memberSince={profile.created_at ?? null}
      />
    </div>
  );
}
