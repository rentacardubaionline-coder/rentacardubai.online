"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X, Download, MoreVertical } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "rnp-pwa-install-dismissed";
const SHOW_DELAY_MS = 3000;

function isIos(): boolean {
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

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [showAndroidSheet, setShowAndroidSheet] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage may throw in private mode — ignore
    }

    // Always show our banner after a short delay. If Chrome later fires
    // beforeinstallprompt, we'll capture it and use the native flow on click;
    // otherwise the click falls back to platform-specific manual instructions.
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    function onPrompt(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function onInstalled() {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, "installed");
      } catch {
        // ignore
      }
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, []);

  async function handleInstall() {
    // Native flow — Chrome captured beforeinstallprompt and handed it to us
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
        try {
          localStorage.setItem(STORAGE_KEY, "accepted");
        } catch {
          // ignore
        }
      }
      return;
    }

    // Fallback to platform-specific manual instructions
    if (isIos()) {
      setShowIosSheet(true);
    } else {
      setShowAndroidSheet(true);
    }
  }

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Floating banner — sits above the mobile bottom nav (mobile) or bottom-right (desktop) */}
      <div
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto max-w-md rounded-2xl border border-brand-200 bg-white p-4 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.25)] lg:bottom-6 lg:left-auto lg:right-6"
        role="dialog"
        aria-labelledby="pwa-install-title"
      >
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 shadow-sm shadow-brand-700/30"
          >
            <span className="text-white font-black text-[11px] leading-none tracking-tighter">
              RN
            </span>
            <span className="mt-0.5 h-[3px] w-[18px] rounded-full bg-white" />
            <span className="mt-[2px] h-[2px] w-[10px] rounded-full bg-white/55" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id="pwa-install-title"
              className="text-sm font-bold text-ink-900"
            >
              Install DubaiRentACar
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
              Add to home screen — faster load, plus instant notifications
              when new leads come in.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Install
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 hover:text-ink-800"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-surface-muted hover:text-ink-700"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* iOS instructional bottom sheet */}
      {showIosSheet && (
        <InstructionalSheet
          title="Add DubaiRentACar to your home screen"
          subtitle="Three quick steps in Safari:"
          steps={[
            <>
              Tap the{" "}
              <Share
                className="inline size-4 align-text-bottom text-brand-600"
                aria-hidden="true"
              />{" "}
              <strong>Share</strong> button at the bottom of Safari.
            </>,
            <>
              Scroll and tap <strong>Add to Home Screen</strong>{" "}
              <Plus
                className="inline size-4 align-text-bottom text-brand-600"
                aria-hidden="true"
              />
              .
            </>,
            <>
              Tap <strong>Add</strong> in the top-right — you&apos;ll find
              DubaiRentACar on your home screen.
            </>,
          ]}
          onClose={() => setShowIosSheet(false)}
        />
      )}

      {/* Android / other-browser instructional bottom sheet */}
      {showAndroidSheet && (
        <InstructionalSheet
          title="Install DubaiRentACar"
          subtitle="Add the app to your home screen in 3 steps:"
          steps={[
            <>
              Tap the{" "}
              <MoreVertical
                className="inline size-4 align-text-bottom text-brand-600"
                aria-hidden="true"
              />{" "}
              menu in the top-right of your browser.
            </>,
            <>
              Choose <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </>,
            <>
              Confirm — DubaiRentACar opens like a native app from your home screen.
            </>,
          ]}
          onClose={() => setShowAndroidSheet(false)}
        />
      )}
    </>
  );
}

function InstructionalSheet({
  title,
  subtitle,
  steps,
  onClose,
}: {
  title: string;
  subtitle: string;
  steps: React.ReactNode[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink-950/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-ink-200"
        />
        <h2 className="mt-4 text-base font-bold text-ink-900">{title}</h2>
        <p className="mt-1 text-xs text-ink-500">{subtitle}</p>

        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-700">{step}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-ink-900 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
