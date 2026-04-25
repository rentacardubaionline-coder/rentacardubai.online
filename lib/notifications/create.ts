import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/send";

/**
 * Insert a single in-app notification AND fire a web-push notification to
 * every device that user has subscribed. The in-app row is the durable record
 * (visible in the bell popover and /admin or /vendor notifications archive);
 * the push is the live alert to their phone / desktop.
 *
 * Fire-and-forget — both legs are wrapped in try/catch so a failure in one
 * never breaks the other and the caller is never blocked.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string,
): Promise<void> {
  // ── In-app row (notification bell + archive page) ──────────────────────
  try {
    const db = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    });
  } catch (err) {
    console.error("[notifications] in-app insert failed", err);
  }

  // ── Web push (live device alert) ───────────────────────────────────────
  // No-ops if the user has no push subscriptions or VAPID keys aren't set.
  try {
    await sendPushToUser(userId, {
      title,
      body: body ?? undefined,
      url: link ?? "/vendor",
      tag: type,
    });
  } catch (err) {
    console.error("[notifications] push send failed", err);
  }
}

/**
 * Insert an in-app notification for every admin user, and push to each.
 * Used for events admins should learn about ASAP — new vendor listings
 * submitted for review, new KYC submissions, etc.
 */
export async function createNotificationsForAdmins(
  type: string,
  title: string,
  body?: string,
  link?: string,
): Promise<void> {
  try {
    const db = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admins } = await (db as any)
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (!admins || admins.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = admins.map((a: { id: string }) => ({
      user_id: a.id,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("notifications").insert(rows);

    // Fire push to every admin in parallel — best-effort.
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      admins.map((a: { id: string }) =>
        sendPushToUser(a.id, {
          title,
          body: body ?? undefined,
          url: link ?? "/admin",
          tag: type,
        }).catch((err) =>
          console.error("[notifications] admin push send failed", err),
        ),
      ),
    );
  } catch (err) {
    console.error("[notifications] Failed to create admin notifications", err);
  }
}
