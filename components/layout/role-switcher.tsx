"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database";

type Props = {
  currentMode: Database["public"]["Enums"]["active_mode"] | null;
  isVendor: boolean;
  userId: string;
};

export function RoleSwitcher({ currentMode, isVendor, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleModeChange = async (
    newMode: Database["public"]["Enums"]["active_mode"] | null,
  ) => {
    if (!newMode) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ active_mode: newMode })
      .eq("id", userId);

    if (!error) {
      // Reload to reflect the new mode in guards
      window.location.reload();
    }

    setLoading(false);
  };

  if (!isVendor) {
    return null;
  }

  return (
    <Select value={currentMode ?? "customer"} onValueChange={handleModeChange} disabled={loading}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">Browse</SelectItem>
        <SelectItem value="vendor">Manage</SelectItem>
      </SelectContent>
    </Select>
  );
}
