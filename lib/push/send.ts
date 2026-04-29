import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Send web-push notifications to every subscription a user has registered.
 *
 * Fire-and-forget style — never throws. If VAPID keys aren't configured we
 * silently no-op so the caller (lead-creation path, etc.) never breaks.
 * Subscriptions that the push service reports as gone (410) or not-found (404)
 * are cleaned up automatically.
 */

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:help@rentacardubai.online";

  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
}

interface StoredSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!configure()) return;

  const db = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (db as any)
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId);

  const rows = (subs ?? []) as StoredSubscription[];
  if (rows.length === 0) return;

  const json = JSON.stringify(payload);
  const staleIds: string[] = [];

  await Promise.all(
    rows.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          json,
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          staleIds.push(sub.id);
        } else {
          console.error("[push] send failed", status, err);
        }
      }
    }),
  );

  if (staleIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("push_subscriptions")
      .delete()
      .in("id", staleIds);
  }
}
