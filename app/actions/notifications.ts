"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateVendorContext } from "@/lib/vendor/context";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/**
 * Fetch the 20 most recent notifications for the current user.
 * Used by the notification bell popover on open.
 */
export async function getNotificationsAction(): Promise<{
  data?: NotificationRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = createAdminClient();
  const { data, error } = await (db as any)
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

/**
 * Mark notifications as read.
 * If `ids` is provided, marks only those; otherwise marks ALL unread for current user.
 */
export async function markNotificationsReadAction(
  ids?: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = createAdminClient();
  const now = new Date().toISOString();

  const query = (db as any)
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (ids && ids.length > 0) {
    query.in("id", ids);
  }

  const { error } = await query;
  if (error) return { error: error.message };

  revalidatePath("/vendor");
  revalidatePath("/admin");
  // Drop the unread badge in the cached vendor sidebar context immediately.
  revalidateVendorContext(user.id);
  return {};
}
