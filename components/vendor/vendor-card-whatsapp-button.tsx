"use client";

import { MessageCircle } from "lucide-react";
import {
  WhatsAppLeadModal,
  useWhatsAppLead,
} from "@/components/shared/whatsapp-lead-modal";

interface Props {
  vendorName: string;
  businessId: string;
  hasWhatsApp: boolean;
  source?: string;
}

/**
 * Replaces the old direct `wa.me/<phone>` link inside VendorCard so that
 * vendor-card clicks now go through the lead-capture modal — guaranteeing a
 * leads row is written, the vendor gets push + in-app notification, and the
 * billing event is recorded. (Bug C2 from the platform audit.)
 */
export function VendorCardWhatsappButton({
  vendorName,
  businessId,
  hasWhatsApp,
  source = "vendor_card",
}: Props) {
  const { modalState, openModal, setOpen } = useWhatsAppLead();

  if (!hasWhatsApp) {
    return (
      <div className="inline-flex items-center justify-center rounded-xl bg-surface-muted/50 px-3 py-2.5 text-xs font-semibold text-ink-400">
        No phone
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => openModal(vendorName, source, { businessId })}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </button>

      <WhatsAppLeadModal
        open={modalState.open}
        onOpenChange={setOpen}
        listingId={modalState.listingId}
        businessId={modalState.businessId}
        listingTitle={modalState.listingTitle}
        source={modalState.source}
      />
    </>
  );
}
