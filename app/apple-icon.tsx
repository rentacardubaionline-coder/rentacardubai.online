import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 80,
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{ height: 5, width: 56, borderRadius: 3, background: "white" }}
          />
          <div
            style={{
              height: 3,
              width: 28,
              borderRadius: 2,
              background: "rgba(255,255,255,0.55)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
