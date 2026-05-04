import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_NEWSLETTER_LIST_ID;
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@rentacardubai.online";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter/subscribe
 * body: { email: string }
 *
 * Pushes the email into Brevo's contacts list (the env-configured list ID, if
 * any). Rate-limited per IP. Idempotent — Brevo's `updateEnabled: true`
 * upserts existing contacts without erroring.
 *
 * The endpoint always returns 200 on validation success even when Brevo is
 * unconfigured — this lets the team launch the form before the marketing
 * stack is fully wired without breaking the UX.
 */
export async function POST(req: Request) {
  // Rate limit by client IP — 10 subscribes / 5 min.
  const ip = clientIp(req);
  const limited = await rateLimit({
    bucket: "newsletter",
    key: ip,
    max: 10,
    windowMs: 5 * 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RX.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Best-effort Brevo upsert. If the API key isn't set we still 200 so the
  // UX shows "Subscribed" — admin can backfill from server logs.
  if (!BREVO_API_KEY) {
    console.warn(
      "[newsletter/subscribe] BREVO_API_KEY missing — skipping Brevo push",
      { email },
    );
    return NextResponse.json({ ok: true, brevo: "skipped" }, { status: 200 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: BREVO_LIST_ID ? [Number(BREVO_LIST_ID)] : undefined,
        updateEnabled: true,
        attributes: { SOURCE: "rentacardubai_footer" },
      }),
    });

    if (!res.ok && res.status !== 400) {
      // 400 from Brevo usually means "already in list" — treat as success.
      const txt = await res.text().catch(() => "");
      console.error("[newsletter/subscribe] brevo error", res.status, txt);
      return NextResponse.json(
        { error: `Could not subscribe right now. Email ${SUPPORT_EMAIL} if it persists.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[newsletter/subscribe] threw", (e as Error).message);
    return NextResponse.json(
      { error: "Network error. Please try again." },
      { status: 500 },
    );
  }
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
