import type { Metadata } from "next";
import { LegalDocumentLayout } from "@/components/legal/legal-document";
import { LEGAL_DOCUMENTS } from "@/lib/legal/data";

export const revalidate = 3600;

const doc = LEGAL_DOCUMENTS.cookies;

export const metadata: Metadata = {
  title: `${doc.title} | RentNowPK`,
  description: doc.description,
  alternates: { canonical: "https://www.rentacardubai.online/cookies" },

  openGraph: {
    title: doc.title,
    description: doc.description,
    url: "https://www.rentacardubai.online/cookies",

    type: "article",
    modifiedTime: doc.lastReviewed,
  },
};

export default function CookiesPage() {
  return <LegalDocumentLayout doc={doc} />;
}
