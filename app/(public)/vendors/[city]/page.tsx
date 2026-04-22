import { notFound, redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/vendor/query";
import { vendorUrl } from "@/lib/vendor/url";

/**
 * Legacy /vendors/{slug} — now 301-redirects to the canonical
 * /vendors/{city}/{slug} form for SEO. Preserves existing inbound links.
 * Note: Next.js requires the parameter to be named 'city' to avoid collisions
 * with the /[city]/[slug] route.
 */
export default async function LegacyVendorRedirect({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();
  redirect(vendorUrl(business as { slug: string; city: string | null }));
}
