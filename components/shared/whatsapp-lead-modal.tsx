"use client";

import { useEffect, useRef, useState } from "react";
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
import { MessageCircle, Loader2, ArrowRight, Shield, X } from "lucide-react";

interface WhatsAppLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId?: string;
  businessId?: string;
  listingTitle: string;
  source?: string;
}

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

/* ─────────────────────────────────────────────────────────────────────────────
 * Custom mobile bottom sheet.
 *
 * Vaul Drawer uses CSS transforms + body scroll-lock which fight with mobile
 * browsers' native keyboard focus behaviour, causing the sheet to scroll
 * behind the keyboard and leave empty white space.
 *
 * This lightweight replacement:
 *  1. Uses a simple `position: fixed; inset: 0` overlay (no transforms).
 *  2. Does NOT lock body scroll — the sheet itself is the scroll container.
 *  3. Listens to `visualViewport` resize so the sheet shrinks to stay above
 *     the virtual keyboard on both iOS and Android.
 * ────────────────────────────────────────────────────────────────────────── */

function MobileBottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(
    undefined,
  );

  // Track the visual viewport so we can shrink the sheet when the keyboard opens
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setViewportHeight(vv.height);
    };

    // Initial measurement
    update();

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      style={{
        // Constrain the entire overlay to the visual viewport so the sheet
        // always sits above the keyboard rather than behind it.
        height: viewportHeight ? `${viewportHeight}px` : "100dvh",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet panel — anchored to the bottom of the overlay which itself
          is capped at the visual viewport height. */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 flex max-h-full flex-col rounded-t-2xl bg-white shadow-2xl"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drag handle decoration */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-ink-500 hover:bg-gray-100"
        >
          <X className="size-4" />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

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

      setName("");
      setPhone("");
      onOpenChange(false);

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formBody = (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 px-4 pb-5"
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

  // ── Mobile: custom bottom sheet (no Vaul) ──
  if (isMobile) {
    return (
      <MobileBottomSheet open={open} onClose={() => onOpenChange(false)}>
        <div className="px-4 pt-1 pb-3">
          <div className="flex items-center gap-2 text-base font-medium">
            {titleNode}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {descriptionNode}
          </p>
        </div>
        {formBody}
      </MobileBottomSheet>
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
        <div className="pt-1">
          {formBody}
        </div>
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
