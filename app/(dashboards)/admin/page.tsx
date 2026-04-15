import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  const profile = await requireRole("admin");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        Admin Dashboard
      </h1>
      <p className="text-ink-500">
        Logged in as: <strong>{profile.email}</strong> (admin)
      </p>
      <p className="text-sm text-ink-400">Admin panel — coming soon.</p>
    </div>
  );
}
