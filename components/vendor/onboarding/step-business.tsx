"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  FileText,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker, type LocationResult } from "./location-picker";
import { createBusinessOnboardingAction } from "@/app/actions/onboarding";
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
  cities: { name: string; slug: string }[];
  onComplete: () => void;
  onSkip: () => void;
}

export function StepBusiness({
  formState,
  onFormChange,
  cities,
  onComplete,
  onSkip,
}: StepBusinessProps) {
  const [saving, setSaving] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Destructure controlled fields
  const { name, phone, whatsapp, email, website, description, city, location } =
    formState;

  // Helpers to update individual fields while keeping rest intact
  const setName = (v: string) => onFormChange({ ...formState, name: v });
  const setWhatsapp = (v: string) =>
    onFormChange({ ...formState, whatsapp: v });
  const setEmail = (v: string) => onFormChange({ ...formState, email: v });
  const setWebsite = (v: string) => onFormChange({ ...formState, website: v });
  const setDescription = (v: string) =>
    onFormChange({ ...formState, description: v });
  const setCity = (v: string) => onFormChange({ ...formState, city: v });

  const handleLocationChange = (loc: LocationResult | null) => {
    onFormChange({
      ...formState,
      location: loc,
      city: loc?.city ?? formState.city,
    });
  };

  const canSave =
    name.trim().length >= 2 &&
    phone.trim().length >= 7 &&
    whatsapp.trim().length >= 7 &&
    city.trim().length >= 2;

  // Filter cities for suggestions
  const cityQuery = city.trim().toLowerCase();
  const citySuggestions = cityQuery
    ? cities.filter((c) => c.name.toLowerCase().includes(cityQuery)).slice(0, 8)
    : cities.slice(0, 8);

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
      {/* Business name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="biz-name"
          className="flex items-center gap-2 text-sm font-semibold text-ink-700"
        >
          <Building2 className="h-3.5 w-3.5 text-ink-400" />
          Business Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="biz-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Karachi Executive Rentals"
          maxLength={120}
          className="h-12 sm:h-10"
          autoComplete="off"
        />
      </div>

      {/* Contact details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="biz-phone"
            className="flex items-center gap-2 text-sm font-semibold text-ink-700"
          >
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
              onFormChange({
                ...formState,
                phone: val,
                whatsapp: syncWhatsapp ? val : whatsapp,
              });
            }}
            placeholder="+923001234567"
            className="h-12 sm:h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="biz-whatsapp"
            className="flex items-center gap-2 text-sm font-semibold text-ink-700"
          >
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
          <Label
            htmlFor="biz-email"
            className="flex items-center gap-2 text-sm font-semibold text-ink-700"
          >
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
          <Label
            htmlFor="biz-website"
            className="flex items-center gap-2 text-sm font-semibold text-ink-700"
          >
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

      {/* City — typeahead combobox */}
      <div className="space-y-1.5 relative">
        <Label
          htmlFor="biz-city"
          className="text-sm font-semibold text-ink-700"
        >
          City <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="biz-city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setShowCitySuggestions(true);
          }}
          onFocus={() => setShowCitySuggestions(true)}
          onBlur={() => {
            // Delay hiding so clicking a suggestion works
            setTimeout(() => setShowCitySuggestions(false), 200);
          }}
          placeholder="Karachi, Lahore, Islamabad, Rawalpindi…"
          className="h-12 sm:h-10"
          autoComplete="off"
        />
        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute top-[68px] z-50 w-full rounded-xl border border-border bg-white shadow-lg overflow-hidden py-1">
            <ul className="max-h-48 overflow-y-auto">
              {citySuggestions.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setCity(c.name);
                      setShowCitySuggestions(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-left text-sm font-medium text-ink-800 hover:bg-surface-muted hover:text-brand-600 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-ink-400">
          Select a city or type a new one. Auto-filled when picking location.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label
          htmlFor="biz-desc"
          className="flex items-center gap-2 text-sm font-semibold text-ink-700"
        >
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
        <p className="text-right text-[11px] text-ink-400">
          {description.length}/500
        </p>
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
