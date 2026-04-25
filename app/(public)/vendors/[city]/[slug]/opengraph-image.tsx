import { ImageResponse } from "next/og";
import { getBusinessByCityAndSlug, getBusinessListings } from "@/lib/vendor/query";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "RentNowPk vendor profile";

interface Params {
  params: Promise<{ city: string; slug: string }>;
}

export default async function VendorOgImage({ params }: Params) {
  const { city, slug } = await params;
  const business = await getBusinessByCityAndSlug(city, slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const biz = business as any;
  const name: string | null = biz?.name ?? null;
  const cityName: string | null = biz?.city ?? null;
  const cover: string | null =
    biz?.cover_url ??
    biz?.business_images?.find((i: { is_primary: boolean }) => i.is_primary)?.url ??
    biz?.business_images?.[0]?.url ??
    null;
  const logo: string | null = biz?.logo_url ?? null;
  const rating: number = biz?.rating ?? 0;
  const reviewsCount: number = biz?.reviews_count ?? 0;

  // Fleet count — fetch only when we already resolved the business
  let fleetCount = 0;
  if (biz?.id) {
    try {
      const listings = await getBusinessListings(biz.id);
      fleetCount = listings.length;
    } catch {
      fleetCount = 0;
    }
  }

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
        {/* Background cover (falls through to brand gradient if missing) */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={cover}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
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

        {/* Top-right: vendor logo card (if we have one) */}
        {logo && (
          <div
            style={{
              position: "absolute",
              top: 44,
              right: 48,
              width: 96,
              height: 96,
              padding: 8,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              display: "flex",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={logo}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Bottom-left: name + city + rating + fleet */}
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
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.85)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textShadow: "0 1px 4px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#34d399",
                display: "flex",
              }}
            />
            Verified Car Rental Agency
          </div>

          <div
            style={{
              color: "white",
              fontSize: name && name.length > 30 ? 60 : 72,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              display: "flex",
              maxWidth: "90%",
            }}
          >
            {name ?? "Trusted car rental"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {cityName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "white",
                  fontSize: 28,
                  fontWeight: 700,
                  textShadow: "0 1px 6px rgba(0,0,0,0.55)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
                {cityName}
              </div>
            )}

            {rating > 0 && reviewsCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.92)",
                  color: "#0a0e1a",
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {rating.toFixed(1)}
                <span style={{ color: "#5a6170", fontWeight: 600 }}>
                  ({reviewsCount})
                </span>
              </div>
            )}

            {fleetCount > 0 && (
              <div
                style={{
                  background: "linear-gradient(180deg, #ed6a2a 0%, #c4521b 100%)",
                  color: "white",
                  fontSize: 24,
                  fontWeight: 900,
                  padding: "10px 18px",
                  borderRadius: 12,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  display: "flex",
                }}
              >
                {fleetCount} {fleetCount === 1 ? "car" : "cars"} available
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
