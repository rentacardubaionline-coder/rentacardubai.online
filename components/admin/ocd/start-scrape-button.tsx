"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Globe, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CITIES = [
  { value: "dubai", label: "Dubai" },
  { value: "abu-dhabi", label: "Abu Dhabi" },
  { value: "sharjah", label: "Sharjah" },
];

export function OcdStartScrapeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("dubai");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ocd/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_city: city }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create job");
      setJobId(json.jobId);
      toast.success("Scrape job created!");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!jobId) return;
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
      >
        <Globe className="h-4 w-4" />
        Start Scrape
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white shadow-2xl">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-bold text-ink-900">Start OCD Scrape</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                This creates a job record. Run the script on your machine to execute.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-700 uppercase tracking-wide">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {jobId ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Job Created</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded bg-white border border-emerald-200 px-2 py-1 font-mono text-[11px] text-ink-900">
                        {jobId}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-ink-500">Now run on your machine:</p>
                  <code className="block rounded-lg bg-ink-900 px-3 py-2.5 font-mono text-[11px] text-emerald-400 leading-relaxed">
                    npm run scrape:ocd -- {jobId}
                  </code>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => { setOpen(false); setJobId(null); }}
                className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                {jobId ? "Done" : "Cancel"}
              </button>
              {!jobId && (
                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Create Job
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
