"use client";

import { MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WhatsAppLeadModal,
  useWhatsAppLead,
} from "@/components/shared/whatsapp-lead-modal";

interface Props {
  /** Business object for the page — used to drive Call + WhatsApp CTAs. */
  business: {
    id: string;
    name: string;
    phone?: string | null;
    whatsapp_phone?: string | null;
  };
  /** Optional listing context if this CTA is shown on a listing-detail page. */
  listingId?: string;
  listingTitle?: string;
  /** Source tag for the leads attribution column. */
  source: string;
}

/**
 * Mobile-only sticky bottom bar with Call + WhatsApp CTAs. Used on the
 * single-business detail page and the vendor profile page so the primary
 * actions are always one tap away regardless of scroll position. Hidden
 * on md+ where the sidebar already exposes the same actions.
 */
export function BusinessMobileCta({
  business,
  listingId,
  listingTitle,
  source,
}: Props) {
  const { modalState, openModal, setOpen } = useWhatsAppLead();

  const phone = business.phone || business.whatsapp_phone;
  const hasPhone = Boolean(phone);
  const hasWhatsApp = Boolean(business.whatsapp_phone || business.phone);

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-3 pt-2.5 backdrop-blur md:hidden"
        style={{
          paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-center gap-2">
          <a
            href={hasPhone ? `tel:${phone}` : undefined}
            aria-label="Call vendor"
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 text-sm font-semibold text-brand-700 active:scale-[0.98] transition-transform",
              !hasPhone && "pointer-events-none opacity-50",
            )}
          >
            <Phone className="h-4 w-4" />
            Call
          </a>

          <button
            type="button"
            onClick={() =>
              openModal(listingTitle ?? business.name, source, {
                listingId,
                businessId: business.id,
              })
            }
            disabled={!hasWhatsApp}
            className={cn(
              "inline-flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3 text-sm font-semibold text-white shadow-md shadow-green-500/30 active:scale-[0.98] transition-transform",
              !hasWhatsApp && "pointer-events-none opacity-50",
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>

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
