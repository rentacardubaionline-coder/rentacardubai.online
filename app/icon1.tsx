import { ImageResponse } from "next/og";

// 512x512 PNG used as the "any" launcher icon and as the maskable variant on
// Android. The "RN" + accent combo sits inside the 60% maskable safe-area so
// adaptive launcher masks (circle, squircle, teardrop) don't crop the glyph.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #ed6a2a 0%, #9b3e11 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: "-0.07em",
            lineHeight: 1,
          }}
        >
          RN
        </div>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{ height: 14, width: 152, borderRadius: 7, background: "white" }}
          />
          <div
            style={{
              height: 8,
              width: 76,
              borderRadius: 4,
              background: "rgba(255,255,255,0.55)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
