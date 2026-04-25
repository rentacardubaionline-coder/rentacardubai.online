"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registers the service worker and wires up lifecycle UX.
 *
 * Responsibilities:
 *  1. Register `/sw.js` in production (dev mode skipped — hot reload + SW is pain).
 *  2. When a new SW version installs, show a sonner toast with a Reload action.
 *     We deliberately don't auto-skip-waiting — vendors mid-task shouldn't have
 *     their page yanked out from under them.
 *  3. On controllerchange (triggered when the user accepts the update), reload
 *     once to pick up the new build.
 *  4. Fire online/offline toasts so vendors on spotty 3G know network state.
 */
export function PWAProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const controller = new AbortController();
    let refreshing = false;

    // ── App-badge clear on focus ─────────────────────────────────────────
    // The SW sets a badge on push receipt; clearing on visibility=visible
    // means "vendor has the app open, they've seen it".
    function clearBadge() {
      if (
        typeof navigator !== "undefined" &&
        "clearAppBadge" in navigator &&
        document.visibilityState === "visible"
      ) {
        (navigator as Navigator & { clearAppBadge?: () => Promise<void> })
          .clearAppBadge?.()
          .catch(() => {});
      }
    }
    clearBadge();
    document.addEventListener("visibilitychange", clearBadge, {
      signal: controller.signal,
    });

    // ── Network state toasts ─────────────────────────────────────────────
    // Guard with `ready` so we don't toast the initial state on mount.
    let ready = false;
    const readyTimer = setTimeout(() => {
      ready = true;
    }, 500);

    window.addEventListener(
      "online",
      () => {
        if (ready) toast.success("Back online");
      },
      { signal: controller.signal },
    );
    window.addEventListener(
      "offline",
      () => {
        if (ready)
          toast.warning("You're offline", {
            description:
              "Some actions will queue until you reconnect.",
          });
      },
      { signal: controller.signal },
    );

    // ── SW registration + update detection ───────────────────────────────
    function promptUpdate(reg: ServiceWorkerRegistration) {
      const waiting = reg.waiting;
      if (!waiting) return;
      toast.info("Update available", {
        description: "A new version of RentNowPK is ready.",
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => waiting.postMessage("SKIP_WAITING"),
        },
      });
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Already-waiting SW from a previous session
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptUpdate(reg);
        }

        reg.addEventListener(
          "updatefound",
          () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                promptUpdate(reg);
              }
            });
          },
          { signal: controller.signal },
        );
      })
      .catch(() => {
        // PWA is progressive enhancement — swallow registration errors.
      });

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
      clearTimeout(readyTimer);
    };
  }, []);

  return null;
}
