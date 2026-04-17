"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProfileAction } from "@/app/actions/profile";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { GenericBusinessLogo } from "@/components/vendor/business-logo-upload";

interface ProfileFormProps {
  defaultValues: { full_name: string; phone: string };
  email: string;
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

function getInitials(name: string, email: string): string {
  const source = name || email;
  return source
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileForm({ defaultValues, email, memberSince }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultValues.full_name);
  const [phone, setPhone] = useState(defaultValues.phone);
  const [saving, setSaving] = useState(false);

  const initials = getInitials(fullName, email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("full_name", fullName);
    fd.append("phone", phone);
    const result = await updateProfileAction(fd);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      {/* Avatar + meta */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 overflow-hidden border border-surface-muted">
              {initials
                ? <span className="text-xl font-black text-brand-700 select-none">{initials}</span>
                : <GenericBusinessLogo size={48} />
              }
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-ink-900">{fullName || <span className="text-ink-400 font-normal">No name set</span>}</p>
              <p className="text-sm text-ink-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {email}
              </p>
              <p className="text-xs text-ink-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Member since {formatDate(memberSince)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-brand-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Your name and contact number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone / WhatsApp Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_display">Email Address</Label>
              <div className="relative">
                <Input
                  id="email_display"
                  type="email"
                  value={email}
                  disabled
                  className="bg-surface-muted/50 text-ink-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-ink-400">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
