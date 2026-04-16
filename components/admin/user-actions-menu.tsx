"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, ShieldCheck, User, Building2, Store, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setUserRoleAction, setVendorStatusAction } from "@/app/actions/admin-users";

interface UserActionsMenuProps {
  userId: string;
  currentRole: "customer" | "vendor" | "admin";
  isVendor: boolean;
  isSelf: boolean;
}

export function UserActionsMenu({ userId, currentRole, isVendor, isSelf }: UserActionsMenuProps) {
  const [pending, startTransition] = useTransition();

  function setRole(role: "customer" | "vendor" | "admin") {
    startTransition(async () => {
      const res = await setUserRoleAction(userId, role);
      if (res.error) toast.error(res.error);
      else toast.success(`Role updated to ${role}`);
    });
  }

  function toggleVendor() {
    startTransition(async () => {
      const res = await setVendorStatusAction(userId, !isVendor);
      if (res.error) toast.error(res.error);
      else toast.success(isVendor ? "Vendor status removed" : "Vendor status granted");
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label="User actions"
          />
        }
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* Role section */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setRole("customer")}
            disabled={currentRole === "customer" || isSelf}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4 text-ink-400" />
            Set as Customer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setRole("vendor")}
            disabled={currentRole === "vendor" || isSelf}
            className="cursor-pointer"
          >
            <Building2 className="mr-2 h-4 w-4 text-purple-500" />
            Set as Vendor
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setRole("admin")}
            disabled={currentRole === "admin" || isSelf}
            className="cursor-pointer"
          >
            <ShieldCheck className="mr-2 h-4 w-4 text-amber-500" />
            Set as Admin
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Vendor toggle */}
        <DropdownMenuItem
          onClick={toggleVendor}
          disabled={isSelf}
          className="cursor-pointer"
        >
          {isVendor ? (
            <>
              <UserX className="mr-2 h-4 w-4 text-rose-500" />
              Remove vendor status
            </>
          ) : (
            <>
              <Store className="mr-2 h-4 w-4 text-emerald-500" />
              Grant vendor status
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
