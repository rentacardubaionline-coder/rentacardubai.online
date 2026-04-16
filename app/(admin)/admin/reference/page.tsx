import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export default async function ReferenceDataPage() {
  await requireRole("admin");

  const supabase = await createClient();

  // Fetch counts
  const [makesCount, modelsCount, featuresCount] = await Promise.all([
    supabase.from("makes").select("id", { count: "exact" }),
    supabase.from("models").select("id", { count: "exact" }),
    supabase.from("vehicle_features").select("id", { count: "exact" }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Reference Data</h1>
        <p className="mt-2 text-ink-600">
          Vehicle taxonomy: makes, models, and features synced from external API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Makes</CardTitle>
            <CardDescription>Car brands</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-600">{makesCount.count || 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Models</CardTitle>
            <CardDescription>Car variants</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-600">{modelsCount.count || 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
            <CardDescription>Car attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-600">{featuresCount.count || 0}</p>
          </CardContent>
        </Card>
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
            <br />
            <code className="block bg-surface-muted p-2 rounded mt-2 font-mono text-xs">
              npm run db:sync
            </code>
          </p>

          <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
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
