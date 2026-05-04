"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary. Catches errors thrown inside `app/layout.tsx`
 * itself (so the site shell can't render). Must define its own <html><body>
 * because the layout did not.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error.tsx]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: "#fff7ed",
          color: "#1f2937",
        }}
      >
        <main
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "96px 24px 64px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 72,
              width: 72,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 4px 18px rgba(237,106,42,0.15)",
              marginBottom: 24,
              fontSize: 32,
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            We&rsquo;ll be right back.
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 15,
              lineHeight: 1.55,
              color: "#475569",
            }}
          >
            Something stopped the site from loading. Try again in a moment, or
            message us on WhatsApp if the issue persists.
          </p>
          {error?.digest && (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                fontFamily: "monospace",
                color: "#94a3b8",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                height: 48,
                paddingInline: 24,
                borderRadius: 12,
                background: "#ed6a2a",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="https://wa.me/971501234567"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: 48,
                paddingInline: 24,
                lineHeight: "48px",
                borderRadius: 12,
                background: "#10b981",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              WhatsApp us
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
