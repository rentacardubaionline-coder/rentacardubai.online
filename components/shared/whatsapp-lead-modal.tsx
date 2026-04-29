"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Lead-capture modal for the WhatsApp CTA. One responsive layout:
 * - Mobile (<sm): full-width bottom sheet anchored to 100dvh.
 * - Desktop (≥sm): centred 28rem-wide card.
 *
 * `100dvh` plus `interactive-widget=resizes-content` (set in app/layout.tsx)
 * means the browser shrinks the dynamic viewport when the keyboard opens,
 * so the sheet hugs the visible area on iOS and Android without any custom
 * visualViewport tracking. Body scroll is locked while the modal is open.
 */
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

  const phoneDigits = phone.replace(/\D/g, "").length;
  const canSubmit =
    name.trim().length >= 2 &&
    phoneDigits >= 10 &&
    phoneDigits <= 13 &&
    !submitting;

  // Lock background scroll + close on Escape
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  // Reset transient error when reopened
  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (phoneDigits < 10) {
      setError("Please enter a valid UAE mobile number (e.g. 0501234567).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(listingId
            ? { listing_id: listingId }
            : { business_id: businessId }),
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
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  // Render via Portal so the modal always sits at the top of <body>, escaping
  // any transformed/`will-change` ancestor (e.g. framer-motion <motion.div>
  // around cards). `position: fixed` is broken inside a transform ancestor —
  // that's what was making the popup appear misplaced or invisible on the
  // listing card, vendor card and listing-detail sidebar WhatsApp buttons.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* Sheet */}
      <div
        className="
          relative flex w-full flex-col bg-white shadow-2xl
          rounded-t-3xl sm:rounded-2xl sm:max-w-md
          max-h-[100dvh] sm:max-h-[90dvh]
          animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in duration-200
        "
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-ink-200" />
        </div>

        {/* Header */}
        <div className="relative shrink-0 border-b border-surface-muted px-5 pb-4 pt-3 sm:pt-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-surface-muted active:scale-95 transition-transform"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </span>
            <div className="min-w-0">
              <h2
                id="lead-modal-title"
                className="text-base font-bold text-ink-900 leading-tight sm:text-lg"
              >
                Contact via WhatsApp
              </h2>
              <p className="mt-0.5 text-xs text-ink-500 leading-snug line-clamp-2">
                Connect with the vendor about{" "}
                <strong className="font-semibold text-ink-700">
                  {listingTitle}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead_name" className="text-sm font-semibold">
                Your Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="lead_name"
                type="text"
                placeholder="e.g. Ahmed Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoComplete="name"
                maxLength={80}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead_phone" className="text-sm font-semibold">
                Your WhatsApp Number <span className="text-rose-500">*</span>
              </Label>
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
                className="h-12 text-base"
              />
              <p className="text-[11px] text-ink-400">
                The vendor will see your number so they can respond to you.
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-12 w-full bg-green-500 text-base font-semibold text-white shadow-md shadow-green-500/20 hover:bg-green-600 disabled:opacity-60"
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

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-ink-400">
              <Shield className="h-3 w-3" />
              Your info is shared only with this vendor
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
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
