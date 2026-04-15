import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email || "" }}
      profile={
        profile
          ? {
              active_mode: profile.active_mode,
              is_vendor: profile.is_vendor,
            }
          : null
      }
    >
      {children}
    </DashboardShell>
  );
}
