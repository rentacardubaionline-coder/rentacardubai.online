import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 301 redirect: /listings/* → /cars/* (preserve old indexed URLs)
  if (request.nextUrl.pathname.startsWith("/listings/")) {
    const newPath = request.nextUrl.pathname.replace(/^\/listings\//, "/cars/");
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Legacy redirect
    "/listings/:path*",
    // Auth-gated areas that need fresh tokens
    "/admin/:path*",
    "/vendor/:path*",
    "/account/:path*",
    "/login",
    "/signup",
  ],
};
