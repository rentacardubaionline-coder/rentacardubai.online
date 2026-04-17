"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Loader2, ArrowRight, Shield } from "lucide-react";

interface WhatsAppLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide listingId for listing-level leads, or businessId for vendor-level leads */
  listingId?: string;
  businessId?: string;
  listingTitle: string;
  source?: string;
}

export function WhatsAppLeadModal({
  open,
  onOpenChange,
  listingId,
  businessId,
  listingTitle,
  source = "unknown",
}: WhatsAppLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 7 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (phone.trim().length < 7) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(listingId ? { listing_id: listingId } : { business_id: businessId }),
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          source,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      const { url } = await res.json();

      // Reset form
      setName("");
      setPhone("");
      onOpenChange(false);

      // Redirect to WhatsApp
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
            Contact via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Enter your details to connect with the vendor about{" "}
            <strong className="text-ink-900">{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="lead_name">Your Name *</Label>
            <Input
              id="lead_name"
              type="text"
              placeholder="e.g. Ahmed Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_phone">Your WhatsApp Number *</Label>
            <Input
              id="lead_phone"
              type="tel"
              placeholder="e.g. 0312 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
              autoComplete="tel"
            />
            <p className="text-[11px] text-ink-400">
              The vendor will see your number so they can respond to you.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Open WhatsApp
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
            <Shield className="h-3 w-3" />
            Your info is shared only with this vendor
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Convenience hook for button → modal pattern ──────────────────────────────

export function useWhatsAppLead() {
  const [modalState, setModalState] = useState<{
    open: boolean;
    listingId?: string;
    businessId?: string;
    listingTitle: string;
    source: string;
  }>({
    open: false,
    listingTitle: "",
    source: "unknown",
  });

  const openModal = (
    listingTitle: string,
    source: string,
    ids: { listingId?: string; businessId?: string },
  ) => {
    setModalState({ open: true, listingTitle, source, ...ids });
  };

  const setOpen = (open: boolean) => {
    setModalState((prev) => ({ ...prev, open }));
  };

  return { modalState, openModal, setOpen };
}
