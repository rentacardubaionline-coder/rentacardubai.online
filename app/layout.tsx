import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteSchema } from "@/components/seo/site-schema";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rentnowpk.com"),
  title: {
    default: "RentNowPK | Rent a Car in Pakistan — Compare & Book Instantly",
    template: "%s | RentNowPK",
  },
  description:
    "Rent a car in Pakistan from verified vendors. Compare prices, browse real photos, and book with a small advance via WhatsApp. Trusted by thousands across Lahore, Karachi, Islamabad.",
  keywords: [
    "rent a car", "car rental pakistan", "rent now pk", "cheap car rental",
    "car hire lahore", "car rental karachi", "self drive car rental",
    "car with driver pakistan", "airport transfer pakistan",
  ],
  openGraph: {
    title: "RentNowPK | Rent a Car in Pakistan",
    description: "Compare verified car rental vendors across Pakistan. Book with a small advance — no hidden charges.",
    url: "https://www.rentnowpk.com",
    siteName: "RentNowPK",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentNowPK | Rent a Car in Pakistan",
    description: "Compare verified car rental vendors across Pakistan. Book instantly via WhatsApp.",
    creator: "@rentnowpk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "./" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mulish.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteSchema />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
