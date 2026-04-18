"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setBusinessLiveAction } from "@/app/actions/admin-businesses";
import { cn } from "@/lib/utils";

interface PublishToggleProps {
  businessId: string;
  businessName: string;
  isLive: boolean;
}

export function PublishToggle({ businessId, businessName, isLive }: PublishToggleProps) {
  const [pending, startTransition] = useTransition();
  const [live, setLive] = useState(isLive);

  function handleToggle() {
    const newState = !live;
    // Optimistic update
    setLive(newState);

    startTransition(async () => {
      const res = await setBusinessLiveAction(businessId, newState);
      if (res.error) {
        setLive(!newState); // revert
        toast.error(res.error);
      } else {
        toast.success(
          newState
            ? `"${businessName}" is now LIVE on the site`
            : `"${businessName}" hidden from the site`,
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset transition-colors",
        live
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
          : "bg-surface-muted text-ink-500 ring-border hover:bg-ink-900/5",
        pending && "opacity-60 cursor-wait",
      )}
      title={live ? "Click to unpublish" : "Click to publish"}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : live ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}
      {live ? "Live" : "Hidden"}
    </button>
  );
}
