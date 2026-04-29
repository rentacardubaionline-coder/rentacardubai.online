import { formatAed, toTitleCase } from "@/lib/utils";

export interface DescribeListingInput {
  title: string;
  year?: number | null;
  city?: string | null;
  color?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  seats?: number | null;
  businessName?: string | null;
  bodyType?: string | null;
  pricing?: {
    daily?: number | null;
    weekly?: number | null;
    monthly?: number | null;
    selfDriveDaily?: number | null;
  };
}

/**
 * Auto-generate a customer-facing listing description from structured fields.
 * Replaces the manual description textarea on step 1 of the wizard so vendors
 * don't have to write copy. Re-generated on every save so pricing/feature
 * updates flow through automatically.
 *
 * The shape is consistent across all listings: an opening "Rent and drive"
 * line with prices, a specs paragraph, and a closing "Why hire" paragraph.
 * Fields that are missing simply drop out — never produces broken sentences.
 */
export function generateListingDescription(input: DescribeListingInput): string {
  const title = input.title?.trim() || "this car";
  const cityLabel = input.city ? toTitleCase(input.city) : null;
  const business = input.businessName?.trim() || null;
  const body = (input.bodyType ?? "").trim().toLowerCase();
  const bodyLabel = body || "vehicle";

  // ── 1. Opening line: "Rent and Drive this … in …" with pricing.
  const priceParts: string[] = [];
  if (input.pricing?.daily) {
    priceParts.push(`${formatAed(input.pricing.daily)} / day`);
  }
  if (input.pricing?.weekly) {
    priceParts.push(`${formatAed(input.pricing.weekly)} / week`);
  }
  if (input.pricing?.monthly) {
    priceParts.push(`${formatAed(input.pricing.monthly)} / month`);
  }

  const opening: string[] = [];
  opening.push(
    `Rent and drive this ${title}${cityLabel ? ` in ${cityLabel}` : ""}, Dubai${
      priceParts.length ? ` from ${priceParts.join(" · ")}` : ""
    }.`,
  );
  if (input.pricing?.selfDriveDaily) {
    opening.push(
      `Self-drive option also available from ${formatAed(input.pricing.selfDriveDaily)} / day.`,
    );
  }
  if (business) {
    opening.push(
      `Contact ${business} directly via WhatsApp for bookings, availability, and any special arrangements.`,
    );
  }

  // ── 2. Specs paragraph
  const specs: string[] = [];
  if (input.seats) {
    specs.push(`fits up to ${input.seats} passengers`);
  }
  if (input.transmission) {
    const t = input.transmission.toLowerCase();
    specs.push(t === "automatic" ? "is an automatic" : "is a manual");
  }
  if (input.fuel) {
    specs.push(`runs on ${input.fuel.toLowerCase()}`);
  }
  if (input.color) {
    specs.push(`comes in ${input.color.toLowerCase()}`);
  }

  const specsLine =
    specs.length > 0
      ? `This ${bodyLabel} ${specs.join(", ").replace(/, ([^,]*)$/, " and $1")}.`
      : "";

  // ── 3. "Why hire" paragraph
  const whyParts: string[] = [];
  whyParts.push(`The ${title}`);
  if (body) whyParts.push(`is a ${bodyLabel}`);
  if (business) whyParts.push(`listed by ${business}`);
  const whyLine = `${whyParts.join(" ")}.${
    input.year ? ` Model year: ${input.year}.` : ""
  }`;

  // ── Compose
  return [
    opening.join(" "),
    specsLine,
    whyLine,
  ]
    .filter(Boolean)
    .join("\n\n");
}
