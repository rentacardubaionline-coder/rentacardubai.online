import Link from "next/link";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  Plus,
  Building2,
} from "lucide-react";

export default async function VendorDashboardPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Vendor's business
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name, city, claim_status")
    .eq("owner_user_id", profile.id)
    .single();

  // Listing stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listings } = business
    ? await (supabase as any)
        .from("listings")
        .select("id, status")
        .eq("business_id", business.id)
    : { data: [] };

  const listingStats = {
    total: listings?.length ?? 0,
    approved: listings?.filter((l: { status: string }) => l.status === "approved").length ?? 0,
    pending: listings?.filter((l: { status: string }) => l.status === "pending").length ?? 0,
  };

  // Recent leads (last 5)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentLeads } = await (supabase as any)
    .from("leads")
    .select("id, channel, created_at, listing:listing_id(title)")
    .eq("vendor_user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // This month's lead count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: monthLeads } = await (supabase as any)
    .from("leads")
    .select("id", { count: "exact" })
    .eq("vendor_user_id", profile.id)
    .gte("created_at", startOfMonth.toISOString());

  const greeting = profile.full_name
    ? `Welcome back, ${profile.full_name.split(" ")[0]}!`
    : "Welcome back!";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{greeting}</h1>
          {business && (
            <p className="mt-1 text-sm text-ink-500">
              {business.name} · {business.city}
            </p>
          )}
        </div>
        {business && (
          <Button render={<Link href="/vendor/listings/new" />} size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> New listing
          </Button>
        )}
      </div>

      {/* No business banner */}
      {!business && (
        <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-6">
          <div className="flex items-start gap-4">
            <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-500" />
            <div>
              <p className="font-semibold text-ink-900">Set up your business profile</p>
              <p className="mt-1 text-sm text-ink-600">
                You need a business profile before you can add listings and receive leads.
              </p>
              <Button render={<Link href="/vendor/business" />} size="sm" className="mt-3">
                Get started
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Car} label="Total listings" value={listingStats.total} color="brand" />
        <StatCard icon={CheckCircle2} label="Live listings" value={listingStats.approved} color="green" />
        <StatCard icon={Clock} label="Pending review" value={listingStats.pending} color="amber" />
        <StatCard icon={MessageCircle} label="Leads this month" value={monthLeads ?? 0} color="brand" />
      </div>

      {/* Recent leads */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent leads</CardTitle>
          <Link href="/vendor/leads" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {!recentLeads || recentLeads.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">
              No leads yet. Leads appear here when customers tap WhatsApp or Call on your listings.
            </p>
          ) : (
            <ul className="divide-y divide-surface-muted">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(recentLeads as any[]).map((lead) => (
                <li key={lead.id} className="flex items-center gap-3 py-3">
                  {lead.channel === "whatsapp" ? (
                    <MessageCircle className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <Phone className="h-4 w-4 shrink-0 text-brand-500" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-700">
                    {lead.listing?.title ?? "Deleted listing"}
                  </span>
                  <Badge
                    className={
                      lead.channel === "whatsapp"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-brand-100 text-brand-700 hover:bg-brand-100"
                    }
                  >
                    {lead.channel === "whatsapp" ? "WhatsApp" : "Call"}
                  </Badge>
                  <span className="shrink-0 text-xs text-ink-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "brand" | "green" | "amber";
}) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Card className="shadow-card">
      <CardContent className="pt-5">
        <div className={`mb-3 inline-flex rounded-lg p-2 ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="mt-0.5 text-xs text-ink-500">{label}</p>
      </CardContent>
    </Card>
  );
}
