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
  metadataBase: new URL("https://www.rentacardubai.online"),

  title: {
    default: "RentNow | Rent a Car in Dubai — Compare & Book Instantly",

    template: "%s | RentNowPK",
  },
  description:
    "Rent a car in Dubai from verified vendors. Compare prices, browse real photos, and book with a small advance via WhatsApp. Trusted by thousands across Dubai and UAE.",

  keywords: [
    "rent a car",
    "car rental dubai",

    "rent now pk",
    "cheap car rental",
    "car hire lahore",
    "car rental karachi",
    "self drive car rental",
    "car with driver dubai",
    "airport transfer dubai",
  ],
  openGraph: {
    title: "RentNow | Rent a Car in Dubai",

    description:
      "Compare verified car rental vendors across Dubai. Book with a small advance — no hidden charges.",

    url: "https://www.rentacardubai.online",

    siteName: "RentNowPK",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentNow | Rent a Car in Dubai",

    description:
      "Compare verified car rental vendors across Dubai. Book instantly via WhatsApp.",

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
  icons: [
    { rel: "icon", url: "/favicon.png" },
    { rel: "apple-touch-icon", url: "/apple-icon.png" },
  ],
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
    <html
      lang="en"
      className={`${mulish.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <SiteSchema />
        <PWAProvider />
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
