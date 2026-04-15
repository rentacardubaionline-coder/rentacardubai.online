import { requireUser } from "@/lib/auth/guards";

export default async function CustomerDashboard() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">
        Welcome back, {user.email}
      </h1>
      <p className="text-ink-500">Customer dashboard — coming soon.</p>
    </div>
  );
}
