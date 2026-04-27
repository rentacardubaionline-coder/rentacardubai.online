import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RentNowPK Vendor",
    short_name: "RentNowPK",
    description:
      "Manage your car rental business — listings, leads, KYC, and billing — all in one place.",
    start_url: "/vendor",
    scope: "/vendor",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#c4521b",
    categories: ["business", "productivity"],
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
