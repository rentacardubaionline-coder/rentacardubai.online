"use client";

import { MessageCircle } from "lucide-react";
import { WhatsAppLeadModal, useWhatsAppLead } from "@/components/shared/whatsapp-lead-modal";
import { cn } from "@/lib/utils";

interface VendorHeroWhatsAppProps {
  hasWhatsApp: boolean;
  businessName: string;
  businessId?: string;
}

export function VendorHeroWhatsApp({
  hasWhatsApp,
  businessName,
  businessId,
}: VendorHeroWhatsAppProps) {
  const { modalState, openModal, setOpen } = useWhatsAppLead();

  return (
    <div className="w-full md:w-auto">
      <button
        type="button"
        onClick={() =>
          openModal(businessName, "vendor_profile", { businessId })
        }
        disabled={!hasWhatsApp}
        className={cn(
          "flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl px-10 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-[#25D366]/20",
          !hasWhatsApp
            ? "pointer-events-none opacity-50 bg-slate-300"
            : "bg-[#25D366]",
        )}
      >
        <MessageCircle className="h-5 w-5 fill-white/20" /> WhatsApp
      </button>

      <WhatsAppLeadModal
        open={modalState.open}
        onOpenChange={setOpen}
        listingId={modalState.listingId}
        businessId={modalState.businessId}
        listingTitle={modalState.listingTitle}
        source={modalState.source}
      />
    </div>
  );
}
