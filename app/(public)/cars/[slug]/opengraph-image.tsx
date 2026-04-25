import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

// 1200x630 — the size Twitter and WhatsApp expect for a "summary_large_image"
// share preview. Generated dynamically per listing so the share card always
// shows the actual car + price + city, not a generic site card.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "RentNowPk car rental listing";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function ListingOgImage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("listings")
    .select(
      "title, city, primary_image_url, pricing:listing_pricing(tier, price_pkr)",
    )
    .eq("slug", slug)
    .maybeSingle();

  const title: string | null = data?.title ?? null;
  const city: string | null = data?.city ?? null;
  const photo: string | null = data?.primary_image_url ?? null;
  const dailyPrice: number | undefined = (data?.pricing ?? []).find(
    (p: { tier: string; price_pkr: number }) => p.tier === "daily",
  )?.price_pkr;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(180deg, #ed6a2a 0%, #9b3e11 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background photo (fills the canvas; brand gradient shows through if missing or fails to fetch) */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={photo}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark gradient fade from the bottom so text stays readable on any photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Top-left: brand mark + wordmark */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 48,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "linear-gradient(180deg, #ed6a2a 0%, #9b3e11 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.06em",
                lineHeight: 1,
              }}
            >
              RN
            </div>
            <div
              style={{
                marginTop: 4,
                width: 22,
                height: 3,
                borderRadius: 2,
                background: "white",
              }}
            />
            <div
              style={{
                marginTop: 2,
                width: 12,
                height: 2,
                borderRadius: 1,
                background: "rgba(255,255,255,0.55)",
              }}
            />
          </div>
          <div
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textShadow: "0 1px 6px rgba(0,0,0,0.55)",
              display: "flex",
            }}
          >
            <span>RentNow</span>
            <span style={{ color: "#ff8446" }}>Pk</span>
          </div>
        </div>

        {/* Top-right: rental category pill */}
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 48,
            background: "rgba(255,255,255,0.95)",
            color: "#9b3e11",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          For Rent
        </div>

        {/* Bottom-left: listing title + city + price */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 56,
            right: 56,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: title && title.length > 40 ? 56 : 68,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              display: "flex",
              maxWidth: "85%",
            }}
          >
            {title ?? "Car for rent in Pakistan"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {city && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "white",
                  fontSize: 30,
                  fontWeight: 700,
                  textShadow: "0 1px 6px rgba(0,0,0,0.55)",
                }}
              >
                {/* Inline pin icon — Satori reliably renders simple SVG paths */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                {city}
              </div>
            )}

            {dailyPrice ? (
              <div
                style={{
                  background: "linear-gradient(180deg, #ed6a2a 0%, #c4521b 100%)",
                  color: "white",
                  fontSize: 28,
                  fontWeight: 900,
                  padding: "12px 22px",
                  borderRadius: 12,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Rs {dailyPrice.toLocaleString("en-PK")} / day
              </div>
            ) : null}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            Book instantly via WhatsApp · rentnowpk.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
