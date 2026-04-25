import { unstable_cache, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface VendorContext {
  business: {
    id: string;
    name: string;
    city: string;
    claim_status: string | null;
  } | null;
  hasBusiness: boolean;
  kycStatus: "approved" | "pending" | "rejected" | null;
  hasKyc: boolean;
  unreadCount: number;
}

/**
 * Vendor-specific context — business profile, latest KYC status, unread
 * notification count. Read on every vendor-side navigation by the layout, so
 * we cache it per-user with a 30s TTL. Each subsequent navigation hits the
 * in-memory cache → 0ms layout overhead instead of 4 round-trip queries.
 *
 * Mutations that change any of these fields (claim, kyc submit/approve/reject,
 * notification mark-read) call `revalidateVendorContext(userId)` to bust the
 * cache for that specific user immediately.
 */
function tagFor(userId: string): string {
  return `vendor-context:${userId}`;
}

/** Bust the cache for a specific vendor — call after mutations.
 *  Next 16 requires the second arg; "max" means "expire immediately". */
export function revalidateVendorContext(userId: string): void {
  revalidateTag(tagFor(userId), "max");
}

async function fetchVendorContext(userId: string): Promise<VendorContext> {
  // All three queries use the admin (service-role) client because
  // unstable_cache disallows cookie access (and therefore the cookie-bound
  // server client). Admin client + an explicit `userId` filter is safe — we
  // only fetch the row that belongs to this specific user.
  const db = createAdminClient();

  const [businessRes, kycRes, unreadRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .from("businesses")
      .select("id, name, city, claim_status")
      .eq("owner_user_id", userId)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .from("kyc_documents")
      .select("id, status")
      .eq("vendor_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  const business = businessRes?.data ?? null;
  const latestKyc = kycRes?.data?.[0] ?? null;
  const kycStatus = (latestKyc?.status ?? null) as
    | "approved" | "pending" | "rejected" | null;
  const hasKyc = kycStatus === "approved" || kycStatus === "pending";
  const unreadCount = unreadRes?.count ?? 0;

  return {
    business,
    hasBusiness: !!business,
    kycStatus,
    hasKyc,
    unreadCount,
  };
}

/**
 * Cached entry point — every layout render reads from here. Cache key is
 * scoped per user; tag is per user too so revalidation is surgical.
 */
export function getVendorContext(userId: string): Promise<VendorContext> {
  return unstable_cache(
    () => fetchVendorContext(userId),
    [`vendor-ctx-${userId}`],
    {
      revalidate: 30,
      tags: [tagFor(userId)],
    },
  )();
}
