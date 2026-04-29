"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Rocket,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DealerStatus = "pending" | "contacted" | "agreed" | "rejected" | "imported";

interface Dealer {
  id: string;
  ocd_company_name: string;
  status: DealerStatus;
  outreach_email: string | null;
  phone: string | null;
  listing_count: number;
}

export function OcdDealerActions({ dealer }: { dealer: Dealer }) {
  const router = useRouter();
  const [activateOpen, setActivateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [email, setEmail] = useState(dealer.outreach_email ?? "");
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<DealerStatus>(dealer.status);
  const [loading, setLoading] = useState(false);

  const isImported = dealer.status === "imported";

  async function handleActivate() {
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ocd/dealers/${dealer.id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Activation failed");
      toast.success(`Account created! ${dealer.listing_count} listings imported.`);
      setActivateOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ocd/dealers/${dealer.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes, outreach_email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      toast.success("Status updated");
      setStatusOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Update status button */}
        {!isImported && (
          <button
            onClick={() => setStatusOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Update Status
          </button>
        )}

        {/* Activate button — only for agreed dealers */}
        {(dealer.status === "agreed" || dealer.status === "pending") && !isImported && (
          <Button
            onClick={() => setActivateOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Rocket className="h-4 w-4" />
            Create Account & Import
          </Button>
        )}

        {isImported && (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Activated
          </div>
        )}
      </div>

      {/* ── Activate modal ──────────────────────────────────────────────────── */}
      {activateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white shadow-2xl">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-bold text-ink-900">
                Create Account — {dealer.ocd_company_name}
              </h2>
              <p className="mt-0.5 text-sm text-ink-500">
                This will create a vendor account, import {dealer.listing_count} listings,
                and send login credentials to the email below.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Dealer Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dealer@example.com"
                    className="h-10 w-full rounded-xl border border-border pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-400">
                  Credentials and welcome email will be sent here. First month is free.
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <strong>What happens:</strong>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>Vendor account created with temp password</li>
                  <li>{dealer.listing_count} car listings imported (status: live)</li>
                  <li>Welcome email sent with login credentials</li>
                  <li>Dealer can log in and update pricing/photos</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => setActivateOpen(false)}
                disabled={loading}
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleActivate}
                disabled={loading || !email.includes("@")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {loading ? "Importing…" : "Activate & Import"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status update modal ─────────────────────────────────────────────── */}
      {statusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white shadow-2xl">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-bold text-ink-900">Update Outreach Status</h2>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Status select */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["pending", "contacted", "agreed", "rejected"] as DealerStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        newStatus === s
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-border bg-white text-ink-700 hover:bg-surface-muted"
                      }`}
                    >
                      {s === "contacted" && <MessageCircle className="h-3.5 w-3.5" />}
                      {s === "agreed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                      {s === "rejected" && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                      <span className="capitalize">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outreach email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Contact Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dealer@example.com"
                    className="h-10 w-full rounded-xl border border-border pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Called on WhatsApp, interested…"
                  rows={3}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => setStatusOpen(false)}
                disabled={loading}
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
