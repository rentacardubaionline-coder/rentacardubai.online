"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { changePasswordAction } from "@/app/actions/profile";
import { Lock, ShieldCheck, Info } from "lucide-react";

interface SettingsFormProps {
  email: string;
  role: string;
  isVendor: boolean;
  memberSince: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SettingsForm({ email, role, isVendor, memberSince }: SettingsFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPw(true);
    const result = await changePasswordAction(newPassword);
    setSavingPw(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-5">

      {/* Account info — read-only */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-brand-600" />
            Account Details
          </CardTitle>
          <CardDescription>Your account information on RentNowPk.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-surface-muted">
            {[
              { label: "Email", value: email },
              { label: "Account type", value: role === "admin" ? "Admin" : isVendor ? "Vendor" : "Customer" },
              { label: "Vendor access", value: isVendor ? "Enabled" : "Not enabled" },
              { label: "Member since", value: formatDate(memberSince) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <dt className="text-sm text-ink-500">{label}</dt>
                <dd className="text-sm font-medium text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-brand-600" />
            Change Password
          </CardTitle>
          <CardDescription>
            Choose a strong password with at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPw}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPw}
                autoComplete="new-password"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={savingPw || !newPassword || !confirmPassword}
              >
                {savingPw ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* KYC status */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Verified vendors build more trust with renters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-600">
              Submit your CNIC and selfie to get a verified badge on your profile.
            </p>
            <a
              href="/vendor/kyc"
              className="ml-4 shrink-0 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              Go to KYC
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="shadow-card border-surface-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-ink-500">
            Need help or want to delete your account?{" "}
            <a
              href="mailto:help@rentnowpk.com"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Contact support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
