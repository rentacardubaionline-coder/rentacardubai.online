import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/vendor/profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function VendorProfilePage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          Update your personal information visible to RentNowPk.
        </p>
      </div>

      <ProfileForm
        defaultValues={{
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
        }}
        email={user?.email ?? ""}
        memberSince={profile.created_at ?? null}
      />
    </div>
  );
}
