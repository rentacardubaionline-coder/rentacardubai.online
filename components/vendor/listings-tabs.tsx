"use client";

import { useState } from "react";
import { ListingRow } from "./listing-row";

type ListingStatus = "draft" | "pending" | "approved" | "rejected" | "unavailable";

interface Listing {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: ListingStatus;
  rejection_reason: string | null;
  primary_image_url: string | null;
  created_at: string;
  pricing: { tier: string; price_pkr: number }[];
}

interface Tab {
  label: string;
  filter: string | null;
}

interface ListingsTabsProps {
  listings: Listing[];
  tabs: Tab[];
}

export function ListingsTabs({ listings, tabs }: ListingsTabsProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? listings.filter((l) => l.status === activeFilter)
    : listings;

  function countFor(filter: string | null) {
    if (!filter) return listings.length;
    return listings.filter((l) => l.status === filter).length;
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-surface-muted pb-3">
        {tabs.map((tab) => {
          const count = countFor(tab.filter);
          const active = activeFilter === tab.filter;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(tab.filter)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-500 text-white"
                  : "bg-surface-muted text-ink-600 hover:bg-surface-muted/70"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-ink-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Listing rows */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No listings in this category.</p>
        ) : (
          filtered.map((listing) => <ListingRow key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
