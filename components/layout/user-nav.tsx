"use client";

import Link from "next/link";
import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Car, 
  CreditCard, 
  ArrowLeftRight,
  ShieldCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction, switchModeAction } from "@/lib/auth/actions";
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
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-border shadow-sm ring-brand-500/10 focus-visible:ring-2" />}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
          <AvatarFallback className="bg-brand-50 text-brand-700 font-bold">
            {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {profile?.role === "admin" && (
          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white">
            <ShieldCheck className="size-2 text-white" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-ink-900">
              {profile?.full_name || "New User"}
            </p>
            <p className="text-xs leading-none text-ink-500">
              {user?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors",
                isVendorMode 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-brand-50 text-brand-700 border-brand-200"
              )}>
                {isVendorMode ? "Vendor Mode" : "Customer Mode"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Context-aware Dashboard & Features */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={isVendorMode ? "/vendor" : "/customer"} />} className="cursor-pointer">
            <LayoutDashboard className="mr-3 size-4 opacity-70" />
            <span>Dashboard Overview</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={isVendorMode ? "/vendor/listings" : "/customer/bookings"} />} className="cursor-pointer">
            {isVendorMode ? <Car className="mr-3 size-4 opacity-70" /> : <CreditCard className="mr-3 size-4 opacity-70" />}
            <span>{isVendorMode ? "My Showroom" : "My Bookings"}</span>
          </DropdownMenuItem>
          {isVendorMode && (
            <DropdownMenuItem render={<Link href="/vendor/payouts" />} className="cursor-pointer">
              <CreditCard className="mr-3 size-4 opacity-70" />
              <span>Earnings & Payouts</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />

        {/* Global Account Tools */}
        <DropdownMenuGroup>
          {isVendorAccount && (
            <DropdownMenuItem 
              onClick={handleModeSwitch} 
              disabled={isSwitching}
              className="cursor-pointer text-brand-700 focus:text-brand-700 focus:bg-brand-50 font-medium"
            >
              <ArrowLeftRight className="mr-3 size-4 opacity-70" />
              <span>{isVendorMode ? "Switch to Buying" : "Switch to Selling"}</span>
              {isSwitching && <span className="ml-auto animate-spin">...</span>}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
            <Settings className="mr-3 size-4 opacity-70" />
            <span>Account Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-bold">
          <LogOut className="mr-3 size-4 opacity-70" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
