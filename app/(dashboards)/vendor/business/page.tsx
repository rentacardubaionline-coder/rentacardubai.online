import Link from "next/link";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessProfileForm } from "@/components/vendor/business-profile-form";
import { Building2, Search } from "lucide-react";

export default async function VendorBusinessPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name, phone, whatsapp_phone, email, address_line, city, claim_status, rating, reviews_count")
    .eq("owner_user_id", profile.id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Business Profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your rental business details visible to customers.
        </p>
      </div>

      {!business ? (
        /* No business yet → show setup options */
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Building2 className="h-5 w-5 text-brand-600" />
              </div>
              <CardTitle className="mt-3 text-base">Create your business</CardTitle>
              <CardDescription>
                Register a new rental business. A admin will review and publish it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/vendor/business/new" />} className="w-full">
                Get started
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                <Search className="h-5 w-5 text-ink-500" />
              </div>
              <CardTitle className="mt-3 text-base">Claim existing business</CardTitle>
              <CardDescription>
                Your business is already on RentNowPk? Search for it and send a claim request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/search" />} variant="outline" className="w-full">
                Search businesses
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Status banner */}
          {business.claim_status === "pending" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⏳ Your business is <strong>under review</strong>. Admin will approve it shortly. You can still add listings in the meantime.
            </div>
          )}
          {business.claim_status === "claimed" && (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Verified</Badge>
            </div>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Edit profile</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessProfileForm business={business} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
