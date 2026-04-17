import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [makesCount, modelsCount, featuresCount] = await Promise.all([
    supabase.from("makes").select("id", { count: "exact", head: true }),
    supabase.from("models").select("id", { count: "exact", head: true }),
    supabase.from("vehicle_features").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-900">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Platform configuration and reference data.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">
          Vehicle Reference Data
        </h2>
        <p className="mb-4 text-sm text-ink-500">
          Makes, models, and features synced from external API.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Makes</CardTitle>
              <CardDescription>Car brands</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{makesCount.count ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Models</CardTitle>
              <CardDescription>Car variants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{modelsCount.count ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
              <CardDescription>Car attributes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{featuresCount.count ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Sync from external API</CardTitle>
          <CardDescription>
            Run the sync script to import makes, models, and features from your vehicle data API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-600">
            <strong>Command:</strong>
            <code className="mt-2 block rounded bg-surface-muted p-2 font-mono text-xs">
              npm run db:sync
            </code>
          </p>
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            <p>
              ℹ️ This script reads your <code>CAR_API_KEY</code> from .env and syncs data to
              Supabase. Logos and icons are uploaded to Cloudinary automatically.
            </p>
          </div>
          <p className="text-sm text-ink-600">
            Last synced: <span className="font-mono">—</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
