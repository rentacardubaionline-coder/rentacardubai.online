import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Insert a single in-app notification for a specific user.
 * Uses the admin (service-role) client to bypass RLS.
 * Fire-and-forget — errors are logged, never thrown.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
): Promise<void> {
  try {
    const db = createAdminClient();
    await (db as any).from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    });
  } catch (err) {
    console.error("[notifications] Failed to create notification", err);
  }
}

/**
 * Insert an in-app notification for every admin user.
 * Queries profiles where role='admin' and bulk-inserts.
 * Fire-and-forget — errors are logged, never thrown.
 */
export async function createNotificationsForAdmins(
  type: string,
  title: string,
  body?: string,
  link?: string
): Promise<void> {
  try {
    const db = createAdminClient();
    const { data: admins } = await db
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (!admins || admins.length === 0) return;

    const rows = admins.map((a: { id: string }) => ({
      user_id: a.id,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    }));

    await (db as any).from("notifications").insert(rows);
  } catch (err) {
    console.error("[notifications] Failed to create admin notifications", err);
  }
}
