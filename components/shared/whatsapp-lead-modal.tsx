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
 * Mobile bottom sheet that survives the iOS / Android virtual keyboard.
 *
 * The hard problem: when the keyboard opens, iOS Safari scrolls the *layout*
 * viewport so the focused input is visible. A naive `position: fixed` sheet
 * stays anchored to the layout viewport's 0,0 — which is now off-screen. The
 * user sees empty space where the sheet used to be.
 *
 * Fix:
 *  1. Lock the body via position:fixed (preserving scroll position) so the
 *     layout viewport can't move while the sheet is open.
 *  2. Use the visualViewport API to read the true on-screen rectangle —
 *     `height` shrinks when the keyboard appears, `offsetTop` shifts when
 *     iOS pans content for cursor visibility.
 *  3. Position the sheet using those numbers so it always hugs the visible
 *     bottom edge, just above the keyboard.
 *  4. When a field is focused, scroll the sheet's inner container so the
 *     field sits in view — the sheet, not the page, owns the scroll.
 * ────────────────────────────────────────────────────────────────────────── */

function useVisualViewport(open: boolean) {
  const [state, setState] = useState({
    height: 0,
    offsetTop: 0,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const vv = window.visualViewport;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!vv) {
          setState({
            height: window.innerHeight,
            offsetTop: 0,
            keyboardHeight: 0,
          });
          return;
        }
        const layoutHeight = window.innerHeight;
        const keyboardHeight = Math.max(
          0,
          layoutHeight - vv.height - vv.offsetTop,
        );
        setState({
          height: vv.height,
          offsetTop: vv.offsetTop,
          keyboardHeight,
        });
      });
    };

    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return state;
}

function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { height: vvHeight, offsetTop, keyboardHeight } =
    useVisualViewport(open);

  useLockBodyScroll(open);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // When a form field gets focused, scroll it into view inside the sheet's
  // own scroll container after the keyboard has opened. iOS otherwise pans
  // the layout viewport; we counter that by re-positioning the container
  // (via offsetTop) and centring the field within our own scroller.
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;

    const handler = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (
        t.tagName !== "INPUT" &&
        t.tagName !== "TEXTAREA" &&
        t.tagName !== "SELECT"
      )
        return;
      // Defer so the keyboard has time to open and visualViewport reports
      // its new size. Two raf cycles + a short timeout is what reliably
      // lands after Safari's keyboard animation on iOS 16/17.
      window.setTimeout(() => {
        requestAnimationFrame(() => {
          t.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      }, 280);
    };

    root.addEventListener("focusin", handler);
    return () => root.removeEventListener("focusin", handler);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Full-page backdrop — covers the layout viewport (including any
          area iOS exposes outside the visual viewport during keyboard
          animations) so the user never sees the page bleeding through. */}
      <div
        className="fixed inset-0 z-[99] bg-black/50"
        onClick={onClose}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />

      {/* Sheet container — pinned to the visualViewport so it follows the
          on-screen rectangle even when iOS pans the layout viewport to
          chase a focused input. */}
      <div
        className="fixed left-0 right-0 z-[100] flex items-end justify-center"
        role="dialog"
        aria-modal="true"
        style={{
          top: `${offsetTop}px`,
          height: vvHeight > 0 ? `${vvHeight}px` : "100dvh",
        }}
      >
        <div
          ref={sheetRef}
          className="relative flex w-full max-h-full flex-col rounded-t-2xl bg-white shadow-2xl"
          style={{
            paddingBottom:
              keyboardHeight > 0 ? 0 : "env(safe-area-inset-bottom)",
            // Promote to its own layer so iOS doesn't repaint the whole
            // viewport on every keyboard frame — much smoother on iPhone.
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 justify-center pt-3 pb-1">
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

          {/* Scrollable content — the sheet, not the page, owns the scroll */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>
    </>
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
      className="space-y-4 px-4 pb-6 sm:px-1 sm:pb-0"
    >
      <div className="space-y-2">
        <Label htmlFor="lead_name" className="text-sm font-semibold">
          Your Name *
        </Label>
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
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead_phone" className="text-sm font-semibold">
          Your WhatsApp Number *
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
        className="h-12 w-full bg-green-500 text-white hover:bg-green-600 sm:h-11"
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

  // ── Mobile: custom bottom sheet ──
  if (isMobile) {
    return (
      <MobileBottomSheet open={open} onClose={() => onOpenChange(false)}>
        <div className="px-4 pt-1 pb-3">
          <div className="flex items-center gap-2 pr-10 text-base font-semibold">
            {titleNode}
          </div>
          <p className="mt-1 text-xs text-ink-500">{descriptionNode}</p>
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
        <div className="pt-1">{formBody}</div>
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
