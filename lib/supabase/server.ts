import { cookies } from "next/headers";
import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: cookieStore
            .getAll()
            .map(({ name, value }) => `${name}=${value}`)
            .join("; "),
        },
      },
    },
  );
}
