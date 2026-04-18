"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidate all SEO pages after reference data changes.
 * Called from admin SEO server actions after create/update/delete of
 * keywords, cities, towns, routes, or vehicle categories.
 */
export async function revalidateSeoPages() {
  // Sitemap
  revalidatePath("/sitemap.xml");
  // All landing pages (catch-all + vehicles + routes)
  revalidatePath("/", "layout");
}
