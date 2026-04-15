"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const addReviewSchema = z.object({
  businessId: z.string().uuid(),
  authorName: z.string().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().max(1000).optional().nullable(),
});

export async function addVendorReviewAction(formData: FormData): Promise<{ error?: string }> {
  const user = await requireRole("admin");

  const parsed = addReviewSchema.safeParse({
    businessId: formData.get("businessId"),
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    body: formData.get("body") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("vendor_reviews").insert({
    business_id: parsed.data.businessId,
    author_name: parsed.data.authorName,
    rating: parsed.data.rating,
    body: parsed.data.body,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return {};
}

export async function deleteVendorReviewAction(reviewId: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("vendor_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
  return {};
}
