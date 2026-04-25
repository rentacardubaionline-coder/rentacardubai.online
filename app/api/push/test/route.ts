import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push/send";

/**
 * POST /api/push/test
 *
 * Sends a test push notification to every subscription the caller has.
 * Used by the Notifications settings panel so vendors can verify their
 * device + permission setup actually delivers a notification.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sendPushToUser(user.id, {
    title: "Test notification",
    body: "If you can read this, push notifications are set up correctly.",
    url: "/vendor/settings",
    tag: "test",
  });

  return NextResponse.json({ ok: true });
}
