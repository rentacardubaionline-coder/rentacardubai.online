import type { Metadata, Viewport } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteSchema } from "@/components/seo/site-schema";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { ConfirmDialogProvider } from "@/components/shared/confirm-dialog";

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
  applicationName: "RentNowPK",
  appleWebApp: {
    capable: true,
    title: "RentNowPK",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#c4521b",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Tell mobile browsers to shrink the dynamic viewport (100dvh) when the
  // virtual keyboard opens. With this set, modals using `100dvh` automatically
  // sit above the keyboard — no JS visualViewport tracking required.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mulish.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <SiteSchema />
        <PWAProvider />
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
