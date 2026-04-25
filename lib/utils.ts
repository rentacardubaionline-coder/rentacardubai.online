import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer PKR amount (e.g. 8500 → "Rs 8,500"). */
export function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Capitalize first letter of every word — used for display names, city, business names. */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalize a Pakistani phone number to E.164 +92XXXXXXXXXX format.
 * Handles: 03XXXXXXXXX → +923XXXXXXXXX, 923XXXXXXXXX → +923XXXXXXXXX, already +92...
 * Returns the original string if it can't be resolved to a Pakistani mobile number.
 *
 * Note: this preserves the lossy fallback for backward compatibility with
 * vendor-side flows (onboarding, profile, business setup). For untrusted
 * input (e.g. customer lead capture) prefer `normalizePhoneStrict()` which
 * returns null on anything that doesn't end up as a valid PK mobile number.
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  // Strip spaces, dashes, parentheses
  const digits = raw.replace(/[\s\-().]/g, "");
  // Already correct
  if (/^\+92[3]\d{9}$/.test(digits)) return digits;
  // +92 prefix but without leading +
  if (/^92[3]\d{9}$/.test(digits)) return `+${digits}`;
  // Local format: 03XXXXXXXXX (11 digits)
  if (/^0[3]\d{9}$/.test(digits)) return `+92${digits.slice(1)}`;
  // 10 digits starting with 3 (no leading 0): 3XXXXXXXXX
  if (/^[3]\d{9}$/.test(digits)) return `+92${digits}`;
  // Can't normalize — return cleaned version as-is
  return digits || raw;
}

/** True if the string is a valid PK mobile number in E.164 form. */
export function isValidPkPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return /^\+92[3]\d{9}$/.test(phone);
}

/**
 * Strict variant of normalizePhone: returns the E.164 number, or null if the
 * input can't be resolved to a valid Pakistani mobile (+923XXXXXXXXX).
 * Use this on the lead-capture path so we never POST garbage to wa.me/.
 */
export function normalizePhoneStrict(
  raw: string | null | undefined,
): string | null {
  const normalized = normalizePhone(raw);
  return isValidPkPhone(normalized) ? normalized : null;
}

/** URL-safe slug from arbitrary input. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
