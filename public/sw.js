// RentNowPK service worker — v1
// Strategy:
//  - Precache the offline fallback page at install
//  - Navigation requests: network-first, fall back to cache, then to /offline
//  - Static _next/static assets: cache-first (immutable build output)
//  - All other requests: pass through to the network (no custom handling)

const VERSION = "rnp-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation (HTML page loads)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache successful pages so they're available offline later
          if (res.ok) {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // Immutable build assets
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(VERSION).then((cache) => cache.put(request, clone));
            }
            return res;
          }),
      ),
    );
    return;
  }
});

// Allow the page to tell the SW to skip waiting when a new version is installed
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// ── Web push ──────────────────────────────────────────────────────────────
// Payload shape sent from the server (see lib/push/send.ts):
//   { title, body?, url?, tag? }
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "RentNowPK", body: "", url: "/vendor" };
  try {
    payload = Object.assign(payload, event.data.json());
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: payload.body || "",
        icon: "/icon",
        badge: "/icon",
        tag: payload.tag || "rnp-default",
        renotify: true,
        // Vibration pattern: short-pause-short — recognisable "you have a lead"
        // pulse on Android. iOS uses its system haptic alongside the sound.
        vibrate: [200, 100, 200],
        // Carries the system-level notification sound on platforms that read
        // it (Android Chrome / Edge); iOS / desktop fall back to OS default.
        silent: false,
        // Stamp the moment the alert was generated so the notification tray
        // groups + sorts correctly even if delivery is delayed.
        timestamp: Date.now(),
        // Lead notifications stay visible until the vendor taps them — they
        // shouldn't disappear after a few seconds like a chat ping might.
        requireInteraction: payload.tag === "new_lead",
        data: { url: payload.url || "/vendor" },
      }),
      // Best-effort app badge — supported on Chrome/Edge desktop, installed
      // PWAs on Android, and macOS Safari dock. Silent no-op everywhere else.
      // We can't easily share a counter between SW + window, so we just flag
      // "has unread" with a single dot. The window clears it on focus.
      "setAppBadge" in self.navigator
        ? self.navigator.setAppBadge(1).catch(() => {})
        : Promise.resolve(),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/vendor";

  // Tapping a notification implicitly means "I've seen it" — drop the badge.
  if ("clearAppBadge" in self.navigator) {
    self.navigator.clearAppBadge().catch(() => {});
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Exact-path match → focus it
        for (const client of clientList) {
          const url = new URL(client.url);
          if (url.pathname === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Any /vendor window → navigate + focus
        for (const client of clientList) {
          const url = new URL(client.url);
          if (url.pathname.startsWith("/vendor") && "focus" in client) {
            if ("navigate" in client) client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Nothing open → open a new window
        return self.clients.openWindow(targetUrl);
      }),
  );
});
