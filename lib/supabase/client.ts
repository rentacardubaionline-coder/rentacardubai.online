"use client";

import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createClient() {
  return supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
