import { requireVendorMode } from "@/lib/auth/guards";

export default async function VendorDashboard() {
  const profile = await requireVendorMode();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        Vendor Dashboard
      </h1>
      <p className="text-ink-500">
        Logged in as: <strong>{profile.email}</strong>
      </p>
      <p className="text-sm text-ink-400">Vendor mode — coming soon.</p>
    </div>
  );
}
