// Legal document content. Authored to reflect the actual data flows on the
// platform today: no-account customer lead capture, vendor KYC, push
// subscriptions, lead-billing per pricing tier, the third-party processors
// in use (Supabase, Cloudinary, Vercel, web-push services).
//
// IMPORTANT: a Pakistani lawyer should review the final text before going
// to production. The "Last reviewed" date at the top of each document is the
// signal of when this happened.

import type { GuideBlock } from "@/lib/guides/data";

export interface LegalDocument {
  slug: "privacy" | "terms" | "cookies";
  title: string;
  /** Description used for SEO + the share preview. */
  description: string;
  /** Single-line summary of what this doc covers, shown under the title. */
  summary: string;
  /** ISO date — kept current via the lawyer review process. */
  lastReviewed: string;
  blocks: GuideBlock[];
}

const CONTACT_EMAIL = "help@rentacardubai.online";

const COMPANY_NAME = "RentNow";
const SITE = "rentacardubai.online";


export const LEGAL_DOCUMENTS: Record<LegalDocument["slug"], LegalDocument> = {
  // ── PRIVACY POLICY ──────────────────────────────────────────────────────
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "How RentNow collects, uses, and protects your information when you browse, contact a vendor, or list a car on the platform.",
    summary:
      "What data we collect, why, who sees it, and the controls you have over it.",
    lastReviewed: "2026-04-28",
    blocks: [
      {
        type: "callout",
        tone: "note",
        title: "Plain-language summary",
        body: `${COMPANY_NAME} only collects what's needed to run the marketplace: your name and phone when you contact a vendor (no account required), your account details if you list cars, your KYC documents if you're a vendor, and standard cookies + push subscriptions to keep the app working. We never sell your data.`,
      },

      {
        type: "h2",
        id: "who-we-are",
        text: "1. Who we are",
      },
      {
        type: "p",
        text: `${COMPANY_NAME} ("we", "us", "our") operates the car-rental marketplace at ${SITE}. We connect customers with verified rental vendors across the UAE. We are the data controller for the personal information described in this policy. You can reach us at ${CONTACT_EMAIL} for any privacy question.`,
      },

      {
        type: "h2",
        id: "what-we-collect",
        text: "2. What we collect, and why",
      },
      {
        type: "h3",
        text: "When you contact a vendor (no account needed)",
      },
      {
        type: "ul",
        items: [
          "Your name and WhatsApp / phone number — so the vendor can reply to your enquiry",
          "The listing or vendor you contacted, the page you started from, and a short reference code (e.g. RN-7X3K) — so the vendor knows what you're asking about and we can attribute the lead correctly",
          "Your IP address and browser user-agent — used briefly to prevent abuse (rapid duplicate submissions, scripted spam) and for security logging",
        ],
      },
      {
        type: "h3",
        text: "When you create a vendor account",
      },
      {
        type: "ul",
        items: [
          "Full name, email address, WhatsApp / phone number",
          "Password (stored only as a one-way hash — we cannot read or recover it)",
          "Account preferences and notification settings",
        ],
      },
      {
        type: "h3",
        text: "When you complete vendor KYC verification",
      },
      {
        type: "ul",
        items: [
          "Your Emirates ID number",
          "Photographs of your Emirates ID (front and back) and a selfie holding your ID",
          "Used solely to verify that the person operating the account is a real UAE resident, to satisfy our trust-and-safety obligations to renters",
        ],
      },
      {
        type: "h3",
        text: "When you list cars and a business",
      },
      {
        type: "ul",
        items: [
          "Business name, Emirates, address, contact numbers, business documents",
          "Photos of your fleet and your business location",
          "Listing details (make, model, year, pricing, availability)",
        ],
      },
      {
        type: "h3",
        text: "When you enable push notifications",
      },
      {
        type: "ul",
        items: [
          "A push subscription endpoint and the cryptographic keys (p256dh, auth) your browser generates — these let us deliver lead alerts to your specific device",
          "User-agent of the subscribing device, so you can recognise and remove old subscriptions later",
        ],
      },
      {
        type: "h3",
        text: "Cookies and similar technologies",
      },
      {
        type: "p",
        text: `We use a small number of strictly-necessary cookies and browser-storage entries to keep the site working — most importantly the Supabase authentication session cookie that keeps you signed in as a vendor. We do not use third-party advertising or cross-site tracking cookies. See our Cookies Policy for the full list.`,
      },

      {
        type: "h2",
        id: "how-we-use",
        text: "3. How we use your information",
      },
      {
        type: "ul",
        items: [
          "Pass customer enquiries to the relevant vendor (name + phone)",
          "Verify vendor identity and operate the trust-and-safety review queue (KYC)",
          "Send vendors push and in-app notifications about new leads",
          "Calculate per-lead billing for vendors based on the pricing tier of each listing",
          "Detect and prevent fraud, duplicate enquiries, scripted abuse, and breaches of our Terms",
          "Improve the platform — measuring which pages perform, which listings convert, fixing bugs",
          "Comply with UAE law and respond to legitimate legal requests",
        ],
      },

      {
        type: "h2",
        id: "who-sees",
        text: "4. Who can see your information",
      },
      {
        type: "h3",
        text: "Vendors",
      },
      {
        type: "p",
        text: "When you contact a vendor through our platform, that vendor sees your name, phone number, the listing you enquired about, and the timestamp. They cannot see your enquiries to other vendors, your IP address, or any other personal information you may have submitted to other parts of the platform.",
      },
      {
        type: "h3",
        text: "Customers (when you list as a vendor)",
      },
      {
        type: "p",
        text: "Customers browsing the marketplace see your business profile (name, city, photos, ratings, fleet) and your listings. They do not see your KYC documents, your email, your billing data, or any of your other private vendor information.",
      },
      {
        type: "h3",
        text: "Service providers (sub-processors) we use to run the platform",
      },
      {
        type: "ul",
        items: [
          "Supabase — database, authentication, file storage; data hosted in their managed region",
          "Cloudinary — image hosting and transformations for listing and business photos",
          "Vercel — application hosting, edge network, build infrastructure",
          "Web-push services (Google FCM, Apple APNS, Mozilla Push Service) — deliver push notifications to your device when you enable them",
          "Email infrastructure provider — for transactional emails (account verification, password reset, KYC status updates)",
        ],
      },
      {
        type: "p",
        text: "Each of these sub-processors is bound by their own data-processing terms and processes data only for the operational purpose described. We do not allow them to use your data for their own marketing.",
      },
      {
        type: "h3",
        text: "Legal requirements",
      },
      {
        type: "p",
        text: "We may share information when required to do so by law, valid UAE court order, or properly-served regulatory request. We will challenge requests we believe are overbroad or improperly issued.",
      },

      {
        type: "h2",
        id: "retention",
        text: "5. How long we keep your information",
      },
      {
        type: "ul",
        items: [
          "Customer enquiry leads: 24 months from the date of enquiry, then deleted from primary storage",
          "Vendor accounts: kept for as long as the account is active; deleted on request (see your rights below)",
          "KYC documents: kept while your vendor account is active, plus up to 12 months after closure for fraud-prevention and dispute resolution",
          "Cookies: per-cookie expiry — most clear when you close the browser or sign out",
          "Push subscriptions: removed automatically when the push service tells us they're no longer valid (e.g. you uninstalled the app), or when you toggle notifications off in settings",
          "Backup copies may persist in encrypted backups for up to 30 days after deletion before they're cycled out",
        ],
      },

      {
        type: "h2",
        id: "your-rights",
        text: "6. Your rights and how to exercise them",
      },
      {
        type: "ul",
        items: [
          "Access the personal data we hold about you",
          "Correct anything that's inaccurate",
          "Delete your account and personal data",
          "Withdraw consent for push notifications and email at any time",
          "Object to processing on lawful grounds",
          "Lodge a complaint with us, and ultimately with the relevant UAE authority",
        ],
      },
      {
        type: "p",
        text: `To exercise any of these rights, email ${CONTACT_EMAIL} from the email address tied to your account, or — if you contacted a vendor without an account — include the WhatsApp number you used and the reference code (RN-XXXX) from your enquiry. We respond within 14 days.`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "Quick deletion: vendor accounts",
        body: `If you have a vendor account, you can request deletion in one click from /vendor/settings. We confirm by email and complete the deletion within 7 days, except where we have a legitimate reason to retain data (active disputes, fraud investigation, billing reconciliation).`,
      },

      {
        type: "h2",
        id: "security",
        text: "7. How we protect your data",
      },
      {
        type: "ul",
        items: [
          "All connections to the site are encrypted with HTTPS (TLS 1.2 or above)",
          "Database access is governed by row-level security — vendors can only read their own leads, customers' data is segregated, admin access is audited",
          "Passwords are stored as one-way hashes — even our own engineers cannot read them",
          "KYC documents are stored in private, access-controlled storage with restricted admin-only access",
          "Backups are encrypted at rest",
          "Engineering follows secure-development practices including code review, dependency scanning, and incident response procedures",
        ],
      },
      {
        type: "p",
        text: "No internet service is 100% secure. If we ever discover a breach affecting your data, we will notify you and the appropriate authorities promptly.",
      },

      {
        type: "h2",
        id: "international",
        text: "8. International data transfers",
      },
      {
        type: "p",
        text: "Some of the sub-processors above (notably Vercel and Supabase) operate from outside the UAE. When we transfer data to them, we rely on their published data-processing terms and on the standard infrastructure protections of major cloud providers. We choose providers that take data protection seriously and review their compliance posture annually.",
      },

      {
        type: "h2",
        id: "children",
        text: "9. Children",
      },
      {
        type: "p",
        text: "RentNow is not directed at children under 18. We do not knowingly collect personal data from anyone under 18. If you believe a child has provided us with personal data, please contact us and we will delete it.",
      },

      {
        type: "h2",
        id: "changes",
        text: "10. Changes to this policy",
      },
      {
        type: "p",
        text: "We may update this policy as the platform evolves or as UAE law changes. The 'Last reviewed' date at the top reflects the most recent legal review. For material changes affecting your rights, we'll notify vendors by email and post a notice on the platform before the changes take effect.",
      },

      {
        type: "h2",
        id: "contact",
        text: "11. Contact us",
      },
      {
        type: "p",
        text: `Email ${CONTACT_EMAIL} for any privacy question, complaint, or rights request. We aim to acknowledge within 3 business days and resolve within 14 days.`,
      },
    ],
  },

  // ── TERMS OF SERVICE ────────────────────────────────────────────────────
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description:
      "The agreement between you and RentNow when you use the platform — separate sections for customers and vendors.",
    summary:
      "What we provide, what you agree to, and how disputes are handled.",
    lastReviewed: "2026-04-28",
    blocks: [
      {
        type: "callout",
        tone: "note",
        title: "Plain-language summary",
        body: `${COMPANY_NAME} is the marketplace — we connect renters with car-rental vendors. We don't own the cars, we don't take payments, and we don't drive anything. The actual rental is between you and the vendor. These terms cover both customers and vendors; the customer section is short, the vendor section is more detailed.`,
      },

      {
        type: "h2",
        id: "acceptance",
        text: "1. Accepting these terms",
      },
      {
        type: "p",
        text: `By using ${SITE}, you agree to these Terms of Service and our Privacy Policy. If you don't agree, please don't use the platform. These terms form a binding agreement between you and ${COMPANY_NAME}.`,
      },

      {
        type: "h2",
        id: "eligibility",
        text: "2. Who can use the platform",
      },
      {
        type: "ul",
        items: [
          "You must be at least 18 years old",
          "You must be able to enter into a binding contract under UAE law",
          "Vendors must additionally complete identity verification (KYC) before listings go live",
        ],
      },

      {
        type: "h2",
        id: "customer-terms",
        text: "3. Terms for customers (renters)",
      },
      {
        type: "h3",
        text: "How the platform works for you",
      },
      {
        type: "p",
        text: "You don't need an account to browse listings or contact a vendor. When you fill in your name and phone in the WhatsApp lead modal, we record your enquiry and pass it to the vendor; you're then redirected to WhatsApp where you continue the conversation directly with that vendor.",
      },
      {
        type: "h3",
        text: "Your relationship with the vendor",
      },
      {
        type: "p",
        text: `Once you and a vendor are talking on WhatsApp, the rental booking — including pricing, deposits, vehicle condition, pickup, drop-off, fuel policy, insurance, and any disputes — is between you and the vendor. ${COMPANY_NAME} is not a party to that booking. We do not collect rental payments, we do not own the vehicles, and we do not employ the drivers.`,
      },
      {
        type: "h3",
        text: "What we don't promise",
      },
      {
        type: "ul",
        items: [
          "We don't guarantee that any specific vendor or vehicle is available at any specific time",
          "We don't guarantee the accuracy of vendor-supplied information (prices, photos, descriptions) — we verify identity, not every detail of every listing",
          "We don't guarantee vendor performance, vehicle quality, or driver behaviour",
          "We don't carry insurance for vendor vehicles, customer trips, or accidents",
        ],
      },
      {
        type: "h3",
        text: "What we ask of you",
      },
      {
        type: "ul",
        items: [
          "Use the platform for genuine rental enquiries — not to spam vendors or extract their contact details for unsolicited outreach",
          "Don't submit false or impersonating contact information",
          "Don't use bots, scripts, or automation to enquire on listings",
          "Treat vendors professionally — they're small businesses",
        ],
      },
      {
        type: "h3",
        text: "If something goes wrong with a vendor",
      },
      {
        type: "p",
        text: `Contact us at ${CONTACT_EMAIL} with the reference code (RN-XXXX) from your enquiry, the vendor's name, and a description of what happened. We do not arbitrate rental disputes, but we do investigate vendor conduct, can warn or suspend repeat-offender vendors, and may help mediate where it's clear that a vendor has violated our marketplace standards.`,
      },

      {
        type: "h2",
        id: "vendor-terms",
        text: "4. Terms for vendors",
      },
      {
        type: "h3",
        text: "Eligibility and verification",
      },
      {
        type: "ul",
        items: [
          "You must be a real UAE resident or registered UAE business",
          "You must complete KYC verification (Emirates ID + selfie) before any listing goes live",
          "You may only list vehicles that you own or are legally authorised to rent out",
          "You may not impersonate another business or claim a profile that isn't yours",
        ],
      },
      {
        type: "h3",
        text: "Listing accuracy",
      },
      {
        type: "ul",
        items: [
          "Photos must be of the actual vehicle you're listing — no stock photos, no dealer brochure shots, no other vendors' images",
          "Prices listed on the platform must match the prices you quote on WhatsApp; bait-and-switch pricing is grounds for suspension",
          "Vehicle availability must be honest — don't list cars you can't deliver",
          "Make, model, year, transmission, fuel, seats, and other specs must be correct",
        ],
      },
      {
        type: "h3",
        text: "Lead-billing and pricing tiers",
      },
      {
        type: "p",
        text: "Each customer enquiry that reaches you through the platform incurs a per-lead charge based on the pricing tier of the listing or business that generated it. Tiers and rates are visible in your vendor billing dashboard before any charge is applied. Charges accrue per-lead and are reconciled monthly. Specific payment terms — billing cycle, payment methods, dispute window — are detailed in the vendor billing dashboard and may be revised with notice.",
      },
      {
        type: "h3",
        text: "Content licence",
      },
      {
        type: "p",
        text: "You retain ownership of the photos, descriptions, and other content you upload. You grant RentNow a non-exclusive, royalty-free, worldwide licence to display, store, and adapt that content for the purpose of operating the platform — including marketing the platform and your listings (e.g. featured-cars rows, social previews). You can revoke this licence by removing the content; we'll stop using it within 30 days.",
      },
      {
        type: "h3",
        text: "Response and conduct expectations",
      },
      {
        type: "ul",
        items: [
          "Respond to leads on WhatsApp within a reasonable timeframe — vendors who consistently take days to reply will see their listings down-ranked in search",
          "Treat customers professionally and honour quoted prices",
          "Do not solicit customers off-platform once they've enquired through us — our marketplace standards require the conversation to start through the lead capture",
          "Do not threaten, harass, or share customer contact information with third parties",
        ],
      },
      {
        type: "h3",
        text: "When we may suspend or remove a listing or account",
      },
      {
        type: "ul",
        items: [
          "Repeated false / inaccurate listings",
          "Pattern of unanswered or ghosted leads",
          "Customer complaints about vehicle condition, vendor conduct, or unsafe drivers",
          "Failure to maintain valid KYC",
          "Outstanding billing not paid within the agreed window",
          "Any breach of these terms or applicable law",
        ],
      },

      {
        type: "h2",
        id: "intellectual-property",
        text: "5. Intellectual property",
      },
      {
        type: "p",
        text: `The RentNow platform — including the brand, logos, design system, website, and software — is owned by ${COMPANY_NAME} and protected by UAE and international intellectual property laws. You may not copy, reproduce, or build derivative works without our written permission.`,
      },
      {
        type: "p",
        text: "Vendor and customer content remains owned by the respective party, subject to the licences described in these terms.",
      },

      {
        type: "h2",
        id: "disclaimers",
        text: "6. Disclaimers",
      },
      {
        type: "p",
        text: `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. To the fullest extent permitted by UAE law, ${COMPANY_NAME} disclaims all warranties — express, implied, statutory or otherwise — including any implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, or secure against every conceivable threat.`,
      },

      {
        type: "h2",
        id: "liability",
        text: "7. Limitation of liability",
      },
      {
        type: "p",
        text: `To the fullest extent permitted by UAE law, ${COMPANY_NAME}'s total liability to you for any claim arising out of or relating to the platform shall not exceed the greater of (a) the total amount you paid to us in the 12 months preceding the claim, or (b) AED 500.`,
      },
      {
        type: "p",
        text: "We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, or loss of data, even if we've been advised of the possibility.",
      },
      {
        type: "p",
        text: "Nothing in these terms excludes or limits any liability that cannot be excluded or limited by law — for example, gross negligence or wilful misconduct.",
      },

      {
        type: "h2",
        id: "indemnity",
        text: "8. Indemnity",
      },
      {
        type: "p",
        text: `You agree to indemnify and hold ${COMPANY_NAME} harmless from any claim, demand, loss, or expense (including reasonable legal fees) arising from your breach of these terms, your misuse of the platform, or your violation of any law or third-party right.`,
      },

      {
        type: "h2",
        id: "termination",
        text: "9. Termination",
      },
      {
        type: "p",
        text: "You may stop using the platform at any time. Vendors may close their account from /vendor/settings or by emailing us. We may suspend or terminate your access if you breach these terms, with notice where reasonable. The sections that by their nature should survive termination — including IP, disclaimers, liability, and governing law — survive.",
      },

      {
        type: "h2",
        id: "law",
        text: "10. Governing law and jurisdiction",
      },
      {
        type: "p",
        text: "These terms are governed by the laws of the United Arab Emirates. Any dispute that cannot be resolved by good-faith discussion shall be submitted to the exclusive jurisdiction of the competent courts in the UAE.",
      },

      {
        type: "h2",
        id: "changes",
        text: "11. Changes to these terms",
      },
      {
        type: "p",
        text: "We may update these terms from time to time. The 'Last reviewed' date at the top reflects the most recent revision. For material changes affecting vendors' billing or core obligations, we'll give 30 days' notice by email and on the platform before the changes take effect. Continuing to use the platform after that means you accept the updated terms.",
      },

      {
        type: "h2",
        id: "contact",
        text: "12. Contact us",
      },
      {
        type: "p",
        text: `Email ${CONTACT_EMAIL} with any question about these terms, or to report a breach.`,
      },
    ],
  },

  // ── COOKIES POLICY ──────────────────────────────────────────────────────
  cookies: {
    slug: "cookies",
    title: "Cookies Policy",
    description:
      "How RentNow uses cookies and similar technologies — what each one does and how you can control them.",

    summary:
      "We use only the cookies needed to run the platform. No advertising, no cross-site tracking.",
    lastReviewed: "2026-04-25",
    blocks: [
      {
        type: "callout",
        tone: "note",
        title: "Plain-language summary",
        body: "We use a small handful of strictly-necessary cookies and browser-storage entries — mostly to keep you signed in as a vendor and to remember which prompts you've dismissed. We do not use advertising or cross-site tracking cookies.",
      },

      {
        type: "h2",
        id: "what",
        text: "1. What is a cookie?",
      },
      {
        type: "p",
        text: "A cookie is a small text file that a website stores on your device when you visit. Cookies let the site remember things like whether you're signed in, which preferences you've set, and which prompts you've already seen. The web also has similar technologies (localStorage, sessionStorage, IndexedDB, Cache Storage for service workers) that we treat the same way as cookies for the purpose of this policy.",
      },

      {
        type: "h2",
        id: "what-we-use",
        text: "2. What we use, and why",
      },
      {
        type: "h3",
        text: "Strictly-necessary cookies",
      },
      {
        type: "checklist",
        items: [
          {
            title: "sb-* (Supabase auth session)",
            detail:
              "Keeps you signed in as a vendor or admin. Without these, every page load would require a fresh login. Cleared when you sign out or when the session expires.",
          },
          {
            title: "Service worker cache (PWA offline)",
            detail:
              "Stores the app shell and the offline page so the platform works briefly without network. Updated automatically on every deploy. You can clear it via your browser's Storage settings.",
          },
        ],
      },
      {
        type: "h3",
        text: "Browser-storage entries (similar to cookies)",
      },
      {
        type: "checklist",
        items: [
          {
            title: "rnp-pwa-install-dismissed",
            detail:
              "A localStorage flag that remembers if you dismissed the 'Install RentNow' banner so we don't keep nagging. You can clear it anytime via your browser's Storage settings.",

          },
          {
            title: "Push subscription handles",
            detail:
              "When you enable lead notifications, your browser stores a subscription handle that we associate with your vendor account. Toggle notifications off in /vendor/settings to remove it.",
          },
        ],
      },
      {
        type: "h3",
        text: "What we don't use",
      },
      {
        type: "ul",
        items: [
          "Advertising cookies (Google Ads, Facebook Pixel, etc.) — not used",
          "Cross-site tracking cookies — not used",
          "Third-party analytics that profile users across sites — not used",
        ],
      },

      {
        type: "h2",
        id: "third-party",
        text: "3. Third-party cookies",
      },
      {
        type: "p",
        text: "When you tap 'Open WhatsApp' to contact a vendor, you're redirected to wa.me — WhatsApp's own domain. WhatsApp may set its own cookies on that page. That's outside our control and governed by WhatsApp's own privacy and cookies policies.",
      },
      {
        type: "p",
        text: "Listing photos hosted on Cloudinary and brand assets served from our CDN don't set cookies.",
      },

      {
        type: "h2",
        id: "controls",
        text: "4. How to control cookies",
      },
      {
        type: "ul",
        items: [
          "Most browsers let you view, manage, and clear cookies in Settings → Privacy",
          "You can block third-party cookies entirely without affecting RentNow (we don't depend on them)",

          "Blocking the strictly-necessary cookies will break the sign-in flow; you'll be unable to use vendor or admin pages",
          "On iOS / Android, your OS may also offer per-site storage controls in the system settings",
        ],
      },

      {
        type: "h2",
        id: "changes",
        text: "5. Changes to this policy",
      },
      {
        type: "p",
        text: "If we add new cookies or change which ones we use, we'll update this page and the 'Last reviewed' date at the top.",
      },

      {
        type: "h2",
        id: "contact",
        text: "6. Contact us",
      },
      {
        type: "p",
        text: `Questions about cookies? Email ${CONTACT_EMAIL}.`,
      },
    ],
  },
};

export const LEGAL_LIST: LegalDocument[] = Object.values(LEGAL_DOCUMENTS);
