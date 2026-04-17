"use client";

import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  ArrowLeftRight,
  ShieldCheck,
  Store,
  User2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction, switchModeAction } from "@/lib/auth/actions";
import { toTitleCase } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface UserNavProps {
  user: any;
  profile: any;
}

export function UserNav({ user, profile }: UserNavProps) {
  const [isSwitching, setIsSwitching] = useState(false);
  const isVendorMode = profile?.active_mode === "vendor";
  const isVendorAccount = profile?.is_vendor;
  const isAdmin = profile?.role === "admin";

  const displayName = toTitleCase(profile?.full_name) || user?.email || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  const handleModeSwitch = async () => {
    setIsSwitching(true);
    const newMode = isVendorMode ? "customer" : "vendor";
    try {
      const result = await switchModeAction(newMode);
      if (result?.error) {
        toast.error(result.error);
        setIsSwitching(false);
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      toast.error("Failed to switch modes");
      setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
        }
      >
        <Avatar className="h-10 w-10 ring-2 ring-brand-500/20 ring-offset-2 ring-offset-white transition-all group-hover:ring-brand-500/40">
          <AvatarImage src={profile?.avatar_url} alt={displayName || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm shadow-inner">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isAdmin && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white">
            <ShieldCheck className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="end" sideOffset={8}>
        {/* Identity */}
        <DropdownMenuLabel className="font-normal px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={profile?.avatar_url} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-bold text-ink-900 leading-tight">
                {displayName || user?.email}
              </p>
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border " +
                  (isVendorMode
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-brand-50 text-brand-700 border-brand-200")
                }
              >
                {isVendorMode ? (
                  <>
                    <Store className="h-2.5 w-2.5" />
                    Vendor Mode
                  </>
                ) : (
                  <>
                    <User2 className="h-2.5 w-2.5" />
                    Customer Mode
                  </>
                )}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem
          render={<Link href={isAdmin ? "/admin" : isVendorMode ? "/vendor" : "/customer"} />}
          className="cursor-pointer gap-3 px-3 py-2.5"
        >
          <LayoutDashboard className="h-4 w-4 text-ink-500 shrink-0" />
          <span className="font-medium">Dashboard</span>
        </DropdownMenuItem>

        {/* Mode switch — only for vendor-capable users, not admins */}
        {isVendorAccount && !isAdmin && (
          <DropdownMenuItem
            onClick={handleModeSwitch}
            disabled={isSwitching}
            className="cursor-pointer gap-3 px-3 py-2.5 text-brand-700 focus:text-brand-700 focus:bg-brand-50"
          >
            <ArrowLeftRight className="h-4 w-4 shrink-0 opacity-80" />
            <span className="font-semibold">
              {isVendorMode ? "Customer Mode" : "Showroom Mode"}
            </span>
            {isSwitching && (
              <span className="ml-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-3 px-3 py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-80" />
          <span className="font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
