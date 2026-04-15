"use client";

import { useState } from "react";
import { switchModeAction } from "@/lib/auth/actions";
import { toast } from "sonner";
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

  const handleModeChange = async (
    newMode: Database["public"]["Enums"]["active_mode"] | null,
  ) => {
    if (!newMode) return;
    setLoading(true);

    try {
      const result = await switchModeAction(newMode);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (err: any) {
      if (err && err.digest && err.digest.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      toast.error("An unexpected error occurred while switching modes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={currentMode ?? "customer"} onValueChange={handleModeChange} disabled={loading}>
      <SelectTrigger className="w-40 px-3 py-1 text-sm font-medium border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">Customer Mode</SelectItem>
        <SelectItem value="vendor">Vendor Mode</SelectItem>
      </SelectContent>
    </Select>
  );
}
