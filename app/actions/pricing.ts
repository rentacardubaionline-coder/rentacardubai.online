"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const updateTierSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(2).max(60),
  price_pkr: z.coerce.number().int().min(0).max(100000),
  description: z.string().trim().max(400).nullable().optional(),
  examples: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
});

export async function updatePricingTierAction(
  input: z.infer<typeof updateTierSchema>,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = updateTierSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("pricing_tiers")
    .update({
      label: parsed.data.label,
      price_pkr: parsed.data.price_pkr,
      description: parsed.data.description ?? null,
      examples: parsed.data.examples ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidatePath("/admin/pricing");
  revalidatePath("/vendor");
  return {};
}
