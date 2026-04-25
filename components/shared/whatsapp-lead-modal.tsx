"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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

/** Track viewport size client-side so we can render Dialog (desktop) vs Drawer (mobile). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
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
  const isMobile = useIsMobile();

  // Mirror server-side strictness: a PK mobile in any of the accepted shapes
  // resolves to ~10–13 digits. The server is the source of truth.
  const phoneDigits = phone.replace(/\D/g, "").length;
  const canSubmit =
    name.trim().length >= 2 && phoneDigits >= 10 && phoneDigits <= 13 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (phoneDigits < 10) {
      setError("Please enter a valid Pakistani mobile number (e.g. 03001234567).");
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

  // ── Form body — shared between the desktop dialog and the mobile drawer ──
  const formBody = (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 px-4 pb-4 md:px-0 md:pb-0 md:pt-1"
    >
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
          autoFocus={!isMobile}
          maxLength={80}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead_phone">Your WhatsApp Number *</Label>
        <Input
          id="lead_phone"
          type="tel"
          inputMode="tel"
          pattern="[0-9+ ]*"
          maxLength={15}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full bg-green-500 text-white hover:bg-green-600"
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
  );

  const titleNode = (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
        <MessageCircle className="h-4 w-4 text-green-600" />
      </span>
      Contact via WhatsApp
    </span>
  );

  const descriptionNode = (
    <>
      Enter your details to connect with the vendor about{" "}
      <strong className="text-ink-900">{listingTitle}</strong>
    </>
  );

  // ── Mobile: bottom sheet (vaul Drawer) ──
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="px-0 pb-[env(safe-area-inset-bottom)] data-[vaul-drawer-direction=bottom]:max-h-[92vh]"
        >
          <DrawerHeader className="px-4 pt-2 text-left">
            <DrawerTitle className="flex items-center gap-2 text-base">
              {titleNode}
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              {descriptionNode}
            </DrawerDescription>
          </DrawerHeader>
          {formBody}
        </DrawerContent>
      </Drawer>
    );
  }

  // ── Desktop: centered dialog ──
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {titleNode}
          </DialogTitle>
          <DialogDescription>{descriptionNode}</DialogDescription>
        </DialogHeader>
        {formBody}
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
