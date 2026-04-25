"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !("MSStream" in window)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as unknown as { standalone?: boolean }).standalone === true)
  );
}

export function PushToggle() {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ok =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!ok) {
      setSupported(false);
      return;
    }

    setPermission(Notification.permission);

    if (isIosSafari() && !isStandalone()) {
      setIosHint(true);
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {
        // SW not registered yet (e.g. dev mode) — leave subscribed=false
      });
  }, []);

  async function handleEnable() {
    setLoading(true);
    try {
      if (!("serviceWorker" in navigator)) {
        toast.error("Your browser doesn't support push notifications");
        return;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error("Notifications blocked — enable in browser settings");
        return;
      }

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) {
        toast.error("Push notifications aren't configured yet");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      if (!res.ok) {
        await sub.unsubscribe();
        throw new Error("Server rejected subscription");
      }

      setSubscribed(true);
      toast.success("Notifications enabled — you'll hear from us on new leads");
    } catch (err) {
      console.error("[push] enable failed", err);
      toast.error("Couldn't enable notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Test notification sent — check your device");
    } catch {
      toast.error("Couldn't send test notification");
    } finally {
      setTesting(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Notifications disabled");
    } catch (err) {
      console.error("[push] disable failed", err);
      toast.error("Couldn't disable notifications");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Push notifications not supported</p>
        <p className="mt-1 text-xs leading-relaxed">
          Your browser doesn&apos;t support web push. Try Chrome or Edge on
          Android, or Safari on iOS 16.4+.
        </p>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <p className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          Install RentNowPK first
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          On iOS, push notifications only work inside an installed app. Tap the
          Share button in Safari → <strong>Add to Home Screen</strong>, then
          open RentNowPK from your home screen and come back here to enable
          notifications.
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
        <p className="font-semibold">Notifications blocked for this site</p>
        <p className="mt-1 text-xs leading-relaxed">
          You previously blocked notifications. Enable them in your browser&apos;s
          site settings (tap the lock icon in the URL bar), then reload this
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-surface-muted bg-white p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              subscribed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-surface-muted text-ink-600",
            )}
          >
            {subscribed ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              Push notifications
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
              {subscribed
                ? "You'll get an instant alert on this device when a new lead comes in."
                : "Get notified the moment someone contacts you — even with the app closed."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={subscribed ? handleDisable : handleEnable}
          disabled={loading}
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            subscribed
              ? "bg-surface-muted text-ink-700 hover:bg-ink-200"
              : "bg-brand-600 text-white hover:bg-brand-700",
            loading && "opacity-60",
          )}
        >
          {loading ? "…" : subscribed ? "Disable" : "Enable"}
        </button>
      </div>

      {subscribed && (
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className={cn(
            "w-full rounded-xl border border-dashed border-brand-300 bg-brand-50/40 px-4 py-2.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50",
            testing && "opacity-60",
          )}
        >
          {testing ? "Sending…" : "Send a test notification to this device"}
        </button>
      )}
    </div>
  );
}
