/**
 * Default per-listing rental policies. Pre-filled into the wizard when a
 * vendor opens the Policies step for the first time — they can edit, delete,
 * or add more. The same set is used as a fallback on the public car detail
 * page when a listing has no custom policies saved yet.
 */
export interface PolicyItem {
  title: string;
  content: string;
}

export const DEFAULT_POLICIES: PolicyItem[] = [
  {
    title: "Delivery",
    content:
      "Cars booked with driver are reached at pickup points by our drivers — the driver comes with the car and picks you up at the agreed location.",
  },
  {
    title: "Toll Taxes",
    content:
      "Toll taxes are paid by the customer, for both with-driver and self-drive rentals. Please keep small change handy for motorway and city toll plazas.",
  },
  {
    title: "Fuel Policy",
    content:
      "Cars booked with a driver come with a specific starting fuel level — on return the customer is expected to return the car at the same fuel level. Please contact the agency while booking to confirm the exact amount.\n\nThe prices you see cover the driver + car for a 12-hour day.",
  },
];
