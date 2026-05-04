// Single source of truth for the brand's customer-facing contact details.
//
// Every page, schema and email template should pull phone / WhatsApp / email
// from this module instead of hardcoding the digits — that way we can rotate
// the support line in one env var instead of grepping the whole tree.

const RAW_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "+971501234567";

const RAW_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? RAW_WHATSAPP;

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@rentacardubai.online";

/** Normalised E.164 form (always begins with `+`). */
export const WHATSAPP_E164 = RAW_WHATSAPP.startsWith("+")
  ? RAW_WHATSAPP
  : `+${RAW_WHATSAPP}`;

export const SUPPORT_PHONE = RAW_PHONE.startsWith("+")
  ? RAW_PHONE
  : `+${RAW_PHONE}`;

/** Digits-only form for `wa.me/` URLs. */
export const WHATSAPP_DIGITS = WHATSAPP_E164.replace(/\D/g, "");

/** Pretty form for human display, e.g. "+971 50 123 4567". */
export function formatPhonePretty(e164: string = SUPPORT_PHONE): string {
  const d = e164.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("971")) {
    // +971 NN NNN NNNN
    return `+971 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return e164;
}

/** `tel:` URL for click-to-call buttons. */
export function telUrl(e164: string = SUPPORT_PHONE): string {
  return `tel:${e164}`;
}

/** `mailto:` URL for the canonical support inbox. */
export function mailtoUrl(subject?: string): string {
  const base = `mailto:${SUPPORT_EMAIL}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

/**
 * `https://wa.me/{digits}?text={msg}` — the canonical WhatsApp deeplink. The
 * E.164 plus-sign is stripped because `wa.me` rejects it.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
