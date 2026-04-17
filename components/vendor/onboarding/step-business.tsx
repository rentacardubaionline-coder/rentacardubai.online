"use client";

import { useState, useRef, useCallback } from "react";
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  FileText,
  MapPin,
  Loader2,
  Star,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker, type LocationResult } from "./location-picker";
import { createBusinessOnboardingAction } from "@/app/actions/onboarding";
import {
  searchGoogleBusinessesAction,
  getPlaceDetailsAction,
} from "@/app/actions/onboarding";
import { toast } from "sonner";

export type BusinessFormState = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  description: string;
  city: string;
  location: LocationResult | null;
};

interface StepBusinessProps {
  formState: BusinessFormState;
  onFormChange: (state: BusinessFormState) => void;
  onComplete: () => void;
  onSkip: () => void;
}

type GmbResult = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
};

export function StepBusiness({ formState, onFormChange, onComplete, onSkip }: StepBusinessProps) {
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Destructure controlled fields
  const { name, phone, whatsapp, email, website, description, city, location } = formState;

  // Helpers to update individual fields while keeping rest intact
  const setName = (v: string) => onFormChange({ ...formState, name: v });
  const setPhone = (v: string) => onFormChange({ ...formState, phone: v });
  const setWhatsapp = (v: string) => onFormChange({ ...formState, whatsapp: v });
  const setEmail = (v: string) => onFormChange({ ...formState, email: v });
  const setWebsite = (v: string) => onFormChange({ ...formState, website: v });
  const setDescription = (v: string) => onFormChange({ ...formState, description: v });
  const setCity = (v: string) => onFormChange({ ...formState, city: v });
  const setLocation = (loc: LocationResult | null) => onFormChange({ ...formState, location: loc });

  // Live GMB dropdown state
  const [gmbResults, setGmbResults] = useState<GmbResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchGmbSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 3) { setGmbResults([]); return; }
    setSearching(true);
    const res = await searchGoogleBusinessesAction(q);
    setGmbResults(res.results ?? []);
    setSearching(false);
    setDropdownOpen(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGmbSuggestions(val), 450);
  };

  const handleGmbSelect = async (result: GmbResult) => {
    setDropdownOpen(false);
    setGmbResults([]);
    setImporting(true);

    // Optimistically set the name
    setName(result.name);

    const res = await getPlaceDetailsAction(result.place_id);
    setImporting(false);

    if (!res.details) {
      toast.error("Could not fetch business details");
      return;
    }

    const d = res.details;
    // Batch all imported fields in one update to avoid stale closure issues
    onFormChange({
      ...formState,
      name: d.name,
      phone: d.phone ?? formState.phone,
      whatsapp: d.phone ?? formState.whatsapp,
      website: d.website ?? formState.website,
      city: d.city ?? formState.city,
      location: {
        address_line: d.address_line,
        lat: d.lat,
        lng: d.lng,
        city: d.city,
        google_place_id: d.google_place_id,
        maps_url: d.maps_url,
      },
    });

    toast.success("Business details imported from Google Maps!");
  };

  const handleLocationChange = (loc: LocationResult | null) => {
    onFormChange({ ...formState, location: loc, city: loc?.city ?? formState.city });
  };

  const canSave =
    name.trim().length >= 2 &&
    phone.trim().length >= 7 &&
    whatsapp.trim().length >= 7 &&
    city.trim().length >= 2;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    const result = await createBusinessOnboardingAction({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp_phone: whatsapp.trim(),
      email: email.trim() || undefined,
      description: description.trim() || undefined,
      website_url: website.trim() || undefined,
      city: city.trim(),
      address_line: location?.address_line,
      lat: location?.lat,
      lng: location?.lng,
      google_place_id: location?.google_place_id,
      google_maps_url: location?.maps_url,
    });

    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Business profile saved!");
      onComplete();
    }
  };

  return (
    <div className="space-y-5">
      {/* Business name with live GMB dropdown */}
      <div className="relative" ref={dropdownRef}>
        <Label htmlFor="biz-name" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <Building2 className="h-3.5 w-3.5 text-ink-400" />
          Business Name <span className="text-rose-500">*</span>
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="biz-name"
            value={name}
            onChange={handleNameChange}
            onFocus={() => gmbResults.length > 0 && setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="e.g. Karachi Executive Rentals"
            maxLength={120}
            className="h-12 pr-10 sm:h-10"
            autoComplete="off"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
            ) : searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
            ) : (
              <Search className="h-4 w-4 text-ink-300" />
            )}
          </div>
        </div>

        {/* Live dropdown — Google business suggestions */}
        {dropdownOpen && gmbResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-xl">
            <div className="px-3 py-2 border-b border-surface-muted">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Found on Google Maps
              </p>
            </div>
            {gmbResults.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onMouseDown={() => handleGmbSelect(r)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50 focus-visible:outline-none border-b border-surface-muted/60 last:border-b-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <Building2 className="h-4 w-4 text-brand-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900 leading-tight">
                    {r.name}
                  </p>
                  <p className="flex items-start gap-1 mt-0.5 text-xs text-ink-500 leading-snug">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-ink-400" />
                    <span className="line-clamp-1">{r.address}</span>
                  </p>
                  {r.rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-medium text-ink-600">{r.rating}</span>
                      {r.user_ratings_total && (
                        <span className="text-[11px] text-ink-400">
                          ({r.user_ratings_total.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 border border-brand-100">
                  Import
                </span>
              </button>
            ))}
            <div className="px-4 py-2 bg-surface-muted/30">
              <p className="text-[10px] text-ink-400">
                Tap to auto-fill your business details from Google Maps
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="biz-phone" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Phone className="h-3.5 w-3.5 text-ink-400" />
            Phone <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="biz-phone"
            value={phone}
            onChange={(e) => {
              const val = e.target.value;
              // Sync WhatsApp if it currently mirrors phone or is empty
              const syncWhatsapp = whatsapp === phone || whatsapp === "";
              onFormChange({ ...formState, phone: val, whatsapp: syncWhatsapp ? val : whatsapp });
            }}
            placeholder="+923001234567"
            className="h-12 sm:h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="biz-whatsapp" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <MessageSquare className="h-3.5 w-3.5 text-ink-400" />
            WhatsApp <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="biz-whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+923001234567"
            className="h-12 sm:h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="biz-email" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Mail className="h-3.5 w-3.5 text-ink-400" />
            Email
            <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
              optional
            </span>
          </Label>
          <Input
            id="biz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="bookings@yourbusiness.com"
            className="h-12 sm:h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="biz-website" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Globe className="h-3.5 w-3.5 text-ink-400" />
            Website
            <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
              optional
            </span>
          </Label>
          <Input
            id="biz-website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourbusiness.com"
            className="h-12 sm:h-10"
          />
        </div>
      </div>

      {/* City — free text, auto-filled from map or GMB import */}
      <div className="space-y-1.5">
        <Label htmlFor="biz-city" className="text-sm font-semibold text-ink-700">
          City <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="biz-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Karachi, Lahore, Islamabad, Rawalpindi…"
          className="h-12 sm:h-10"
        />
        <p className="text-xs text-ink-400">
          Auto-filled when you import from Google Maps or pick a location below.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="biz-desc" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <FileText className="h-3.5 w-3.5 text-ink-400" />
          About your business
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
            optional
          </span>
        </Label>
        <textarea
          id="biz-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Briefly describe your business, specialties, and what makes you stand out…"
          className="w-full rounded-xl border border-input bg-white px-3.5 py-3 text-sm ring-offset-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-ink-400 sm:rounded-lg"
        />
        <p className="text-right text-[11px] text-ink-400">{description.length}/500</p>
      </div>

      {/* Location picker */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <MapPin className="h-3.5 w-3.5 text-ink-400" />
          Business Location
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
            optional
          </span>
        </Label>
        <LocationPicker
          value={location}
          onChange={handleLocationChange}
          onPreFill={(data) => {
            if (data.city) setCity(data.city);
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 border-t border-surface-muted pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-ink-500 underline-offset-4 hover:underline hover:text-ink-700 transition-colors"
        >
          Skip for now
        </button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="min-w-36 shadow-md shadow-brand-500/20 h-12 rounded-2xl sm:h-10 sm:rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
