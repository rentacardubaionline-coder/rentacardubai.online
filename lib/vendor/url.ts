import { slugify } from "@/lib/utils";

/**
 * Canonical public URL for a business page.
 * Format: /vendors/{city-slug}/{business-slug} — city segment keeps URLs
 * keyword-rich and mirrors user intent ("lahore/acme-rent-a-car").
 * Falls back to "pakistan" when the business has no city recorded.
 */
export function vendorUrl(biz: { slug: string; city?: string | null }): string {
  const citySlug = biz.city ? slugify(biz.city) : "pakistan";
  return `/vendors/${citySlug}/${biz.slug}`;
}
