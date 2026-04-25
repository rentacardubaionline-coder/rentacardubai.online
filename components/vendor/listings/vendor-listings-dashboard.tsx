"use client";

import { useMemo, useState } from "react";
import { Search, X, Car, CheckCircle2, Clock, FileEdit, AlertCircle } from "lucide-react";
import {
  VendorListingCard,
  type VendorListing,
  type ListingStatus,
} from "./vendor-listing-card";

interface VendorListingsDashboardProps {
  listings: VendorListing[];
}

const TABS: { key: ListingStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Live" },
  { key: "pending", label: "Under review" },
  { key: "draft", label: "Drafts" },
  { key: "rejected", label: "Rejected" },
  { key: "unavailable", label: "Unavailable" },
];

export function VendorListingsDashboard({ listings }: VendorListingsDashboardProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("all");

  const counts = useMemo(() => {
    const all = listings.length;
    const approved = listings.filter((l) => l.status === "approved").length;
    const pending = listings.filter((l) => l.status === "pending").length;
    const draft = listings.filter((l) => l.status === "draft").length;
    const rejected = listings.filter((l) => l.status === "rejected").length;
    const unavailable = listings.filter((l) => l.status === "unavailable").length;
    return { all, approved, pending, draft, rejected, unavailable };
  }, [listings]);

  const totalLeads = useMemo(
    () => listings.reduce((sum, l) => sum + (l.leads_this_month ?? 0), 0),
    [listings],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (activeTab !== "all" && l.status !== activeTab) return false;
      if (q && !`${l.title} ${l.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [listings, activeTab, query]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Car} label="Total listings" value={counts.all} tone="brand" />
        <StatTile icon={CheckCircle2} label="Live" value={counts.approved} tone="emerald" />
        <StatTile icon={Clock} label="Under review" value={counts.pending} tone="amber" />
        <StatTile icon={FileEdit} label="Drafts" value={counts.draft} tone="slate" />
      </section>

      {/* Leads summary strip */}
      {totalLeads > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-brand-50 to-orange-50 px-4 py-3 ring-1 ring-brand-100/80">
          <p className="text-sm text-ink-700">
            <span className="font-extrabold text-ink-900">{totalLeads}</span>{" "}
            {totalLeads === 1 ? "lead" : "leads"} across your listings this month
          </p>
          <a
            href="/vendor/leads"
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View all leads →
          </a>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or city…"
            className="h-10 w-full rounded-xl bg-surface-sunken pl-9 pr-8 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Tabs — scroll horizontally on mobile */}
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const count =
              tab.key === "all" ? counts.all : (counts as Record<string, number>)[tab.key] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-ink-900 text-white shadow-sm"
                    : "bg-surface-sunken text-ink-700 hover:bg-surface-muted/60"
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex size-4 items-center justify-center rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-white text-ink-900" : "bg-white/80 text-ink-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <VendorListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-muted bg-white py-16 text-center">
          <AlertCircle className="mb-3 size-8 text-ink-300" />
          <p className="text-sm font-semibold text-ink-700">
            {query
              ? `No listings match "${query}"`
              : "No listings in this category"}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            {query ? "Try a different search term." : "Add a new listing or switch tabs."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Local StatTile to avoid cross-file duplication ──────────────────── */

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "brand" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    brand: { iconBg: "bg-brand-100", iconText: "text-brand-600" },
    emerald: { iconBg: "bg-emerald-100", iconText: "text-emerald-600" },
    amber: { iconBg: "bg-amber-100", iconText: "text-amber-600" },
    slate: { iconBg: "bg-slate-100", iconText: "text-slate-600" },
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
      <div className={`flex size-10 items-center justify-center rounded-xl ${tones.iconBg} ${tones.iconText}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black text-ink-900">{value}</div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
          {label}
        </div>
      </div>
    </div>
  );
}
