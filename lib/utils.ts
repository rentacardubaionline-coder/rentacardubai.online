import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer AED amount (e.g. 500 → "AED 500"). */
export function formatAed(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
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
 * Normalize a UAE phone number to E.164 +9715XXXXXXXX format.
 * Handles: 05XXXXXXXX → +9715XXXXXXXX, 9715XXXXXXXX → +9715XXXXXXXX, already +971...
 * Returns the original string if it can't be resolved to a UAE mobile number.
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  // Strip spaces, dashes, parentheses
  const digits = raw.replace(/[\s\-().]/g, "");
  // Already correct: +971 5X XXXXXXX
  if (/^\+9715\d{8}$/.test(digits)) return digits;
  // 971 prefix but without leading +
  if (/^9715\d{8}$/.test(digits)) return `+${digits}`;
  // Local format: 05XXXXXXXX (10 digits)
  if (/^05\d{8}$/.test(digits)) return `+9715${digits.slice(2)}`;
  // 9 digits starting with 5 (no leading 0): 5XXXXXXXX
  if (/^5\d{8}$/.test(digits)) return `+9715${digits.slice(1)}`;
  // Can't normalize — return cleaned version as-is
  return digits || raw;
}

/** True if the string is a valid UAE mobile number in E.164 form. */
export function isValidUaePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return /^\+9715\d{8}$/.test(phone);
}

/**
 * Strict variant of normalizePhone: returns the E.164 number, or null if the
 * input can't be resolved to a valid UAE mobile (+9715XXXXXXXX).
 */
export function normalizePhoneStrict(
  raw: string | null | undefined,
): string | null {
  const normalized = normalizePhone(raw);
  return isValidUaePhone(normalized) ? normalized : null;
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
