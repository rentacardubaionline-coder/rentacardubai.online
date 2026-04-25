"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/vendor/profile-form";
import { BusinessLogoUpload } from "@/components/vendor/business-logo-upload";
import { PushToggle } from "@/components/vendor/push-toggle";
import { changePasswordAction } from "@/app/actions/profile";
import { cn } from "@/lib/utils";
import {
  User, Lock, MessageCircle, Mail, Phone, Info, ShieldCheck,
  ExternalLink, CheckCircle2, Clock, ArrowRight, Bell, AlertCircle,
} from "lucide-react";

type Tab = "profile" | "security" | "notifications" | "help";

interface SettingsTabsProps {
  profile: { full_name: string; phone: string };
  email: string;
  memberSince: string | null;
  role: string;
  isVendor: boolean;
  kycStatus: "approved" | "pending" | "rejected" | null;
  kycRejectionReason?: string | null;
  business: { id: string; name: string; logo_url: string | null } | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const WHATSAPP_MSG = encodeURIComponent(
  "Hi RentNowPk Support, I need help with my vendor account."
);

export function SettingsTabs({
  profile, email, memberSince, role, isVendor, kycStatus, kycRejectionReason, business,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; Icon: typeof User }[] = [
    { id: "profile",       label: "Profile",       Icon: User },
    { id: "security",      label: "Security",      Icon: Lock },
    { id: "notifications", label: "Notifications", Icon: Bell },
    { id: "help",          label: "Help",          Icon: MessageCircle },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex border-b border-surface-muted">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Profile ────────────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-5">
          {business && (
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Business Logo</CardTitle>
                <CardDescription>
                  Shown on your listings and profile. Square images work best.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessLogoUpload
                  businessId={business.id}
                  currentLogoUrl={business.logo_url}
                  businessName={business.name}
                />
              </CardContent>
            </Card>
          )}
          <ProfileForm
            defaultValues={profile}
            email={email}
            memberSince={memberSince}
          />
        </div>
      )}

      {/* ── Security ───────────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <SecurityTab
          email={email}
          role={role}
          isVendor={isVendor}
          memberSince={memberSince}
          kycStatus={kycStatus}
          kycRejectionReason={kycRejectionReason}
        />
      )}

      {/* ── Notifications ──────────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-brand-600" />
              Lead alerts
            </CardTitle>
            <CardDescription>
              Get instant alerts on this device when a new lead comes in —
              even when the app is closed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PushToggle />
          </CardContent>
        </Card>
      )}

      {/* ── Help ───────────────────────────────────────────────────────────── */}
      {activeTab === "help" && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Support</CardTitle>
            <CardDescription>
              Reach our support team — we respond within 1–2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="mailto:help@rentnowpk.com"
              className="group flex items-center justify-between rounded-xl border border-surface-muted bg-white px-4 py-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Email</p>
                  <p className="text-sm font-semibold text-ink-900">help@rentnowpk.com</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-ink-300 group-hover:text-brand-500 transition-colors" />
            </a>

            <a
              href={`https://wa.me/923144174625?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-surface-muted bg-white px-4 py-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">WhatsApp</p>
                  <p className="text-sm font-semibold text-ink-900">+92 314 4174625</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-ink-300 group-hover:text-emerald-500 transition-colors" />
            </a>

            <a
              href="tel:03144174625"
              className="group flex items-center justify-between rounded-xl border border-surface-muted bg-white px-4 py-3.5 transition-colors hover:border-amber-300 hover:bg-amber-50/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Call</p>
                  <p className="text-sm font-semibold text-ink-900">0314 4174625</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-ink-300 group-hover:text-amber-500 transition-colors" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Security sub-section ──────────────────────────────────────────────────────

interface SecurityTabProps {
  email: string;
  role: string;
  isVendor: boolean;
  memberSince: string | null;
  kycStatus: "approved" | "pending" | "rejected" | null;
  kycRejectionReason?: string | null;
}

function SecurityTab({ email, role, isVendor, memberSince, kycStatus, kycRejectionReason }: SecurityTabProps) {
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
      {/* Account details */}
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
              {
                label: "Account type",
                value: role === "admin" ? "Admin" : isVendor ? "Vendor" : "Customer",
              },
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
          <CardDescription>Choose a strong password with at least 8 characters.</CardDescription>
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

      {/* Identity verification */}
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
          {kycStatus === "approved" ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Identity verified</p>
                <p className="text-xs text-emerald-600">Your profile shows a verified badge.</p>
              </div>
            </div>
          ) : kycStatus === "pending" ? (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Under review</p>
                <p className="text-xs text-amber-600">
                  We&apos;ll notify you once reviewed (1–2 business days).
                </p>
              </div>
            </div>
          ) : kycStatus === "rejected" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-rose-800">
                    Your KYC was rejected
                  </p>
                  {kycRejectionReason ? (
                    <p className="mt-1 text-xs leading-relaxed text-rose-700">
                      <span className="font-semibold">Reason:</span>{" "}
                      {kycRejectionReason}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-relaxed text-rose-700">
                      Please resubmit clear, well-lit photos of your documents.
                    </p>
                  )}
                </div>
              </div>
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                Resubmit documents
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-600">
                Submit your CNIC and selfie to get a verified badge on your profile.
              </p>
              <Link
                href="/vendor/onboarding"
                className="ml-4 shrink-0 flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Verify now
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
