import { ImageResponse } from "next/og";

// Default site-wide og:image — serves as the share preview for the home page,
// search results, and any SEO landing page that doesn't have a more specific
// card. Listing and vendor pages override this via their own opengraph-image.tsx.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DubaiRentACar — Dubai's car rental marketplace";

export default function SiteOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        background:
          "radial-gradient(circle at 30% 30%, #ed6a2a 0%, #c4521b 40%, #722c0a 100%)",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative orbs for depth */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "rgba(255,255,255,0.07)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -100,
          width: 380,
          height: 380,
          borderRadius: 999,
          background: "rgba(0,0,0,0.18)",
          display: "flex",
        }}
      />

      {/* Brand mark */}
      <div
        style={{
          width: 144,
          height: 144,
          borderRadius: 32,
          background: "linear-gradient(180deg, #ed6a2a 0%, #9b3e11 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: "-0.07em",
            lineHeight: 1,
          }}
        >
          RN
        </div>
        <div
          style={{
            marginTop: 8,
            width: 50,
            height: 5,
            borderRadius: 3,
            background: "white",
          }}
        />
        <div
          style={{
            marginTop: 4,
            width: 26,
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.55)",
          }}
        />
      </div>

      {/* Wordmark */}
      <div
        style={{
          display: "flex",
          color: "white",
          fontSize: 84,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}
      >
        <span>DubaiRentACar</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          color: "rgba(255,255,255,0.92)",
          fontSize: 32,
          fontWeight: 700,
          textAlign: "center",
          maxWidth: 880,
          lineHeight: 1.25,
          display: "flex",
        }}
      >
        Rent a car in Dubai from verified vendors — book via WhatsApp
      </div>

      {/* Trust pills */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 8,
        }}
      >
        {[
          "Verified vendors",
          "No hidden charges",
          "Instant WhatsApp booking",
        ].map((label) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 20,
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
