import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Code exchanged successfully — user email is now confirmed and they're logged in.
      // Middleware will set the session cookie automatically on the next request.
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Invalid or missing code — send back to login with an error hint
  return NextResponse.redirect(new URL("/login?error=invalid_code", request.url));
}
