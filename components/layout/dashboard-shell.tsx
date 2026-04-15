"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RoleSwitcher } from "./role-switcher";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { Database } from "@/types/database";

type Props = {
  children: React.ReactNode;
  user: { id: string; email: string };
  profile: {
    active_mode: Database["public"]["Enums"]["active_mode"] | null;
    is_vendor: boolean;
  } | null;
};

export function DashboardShell({ children, user, profile }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  }, [supabase]);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Top nav */}
      <nav className="border-b border-border bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">RentNowPk</h2>
          </div>
          <div className="flex items-center gap-4">
            {profile?.is_vendor && (
              <RoleSwitcher
                currentMode={profile.active_mode}
                isVendor={true}
                userId={user.id}
              />
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loading}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
    </div>
  );
}
