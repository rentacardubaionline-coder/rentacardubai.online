import type { Metadata } from "next";
import { LegalDocumentLayout } from "@/components/legal/legal-document";
import { LEGAL_DOCUMENTS } from "@/lib/legal/data";

export const revalidate = 3600;

const doc = LEGAL_DOCUMENTS.terms;

export const metadata: Metadata = {
  title: `${doc.title} | RentNowPK`,
  description: doc.description,
  alternates: { canonical: "https://www.rentnowpk.com/terms" },
  openGraph: {
    title: doc.title,
    description: doc.description,
    url: "https://www.rentnowpk.com/terms",
    type: "article",
    modifiedTime: doc.lastReviewed,
  },
};

export default function TermsPage() {
  return <LegalDocumentLayout doc={doc} />;
}
