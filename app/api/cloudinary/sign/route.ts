import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  // Inline auth check — Route Handlers cannot use redirect() from requireVendorMode
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_vendor")
    .eq("id", user.id)
    .single();

  if (!profile?.is_vendor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { folder?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { folder } = body;
  if (!folder || typeof folder !== "string") {
    return NextResponse.json({ error: "folder is required" }, { status: 400 });
  }

  const sig = generateUploadSignature(folder);
  return NextResponse.json(sig);
}
