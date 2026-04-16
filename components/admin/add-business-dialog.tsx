"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBusinessAdminAction } from "@/app/actions/admin-businesses";

const CITIES = ["Karachi", "Lahore", "Islamabad"];
const CATEGORIES = [
  "Luxury Cars", "Economy Cars", "SUVs & 4x4", "Vans & Minibuses",
  "Airport Transfers", "Corporate Rentals", "Self Drive", "Wedding Cars",
  "Other",
];

interface ReviewRow { reviewer_name: string; rating: number; comment: string }
const emptyReview = (): ReviewRow => ({ reviewer_name: "", rating: 5, comment: "" });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 pt-4 pb-1 border-t border-surface-muted first:border-t-0 first:pt-0">
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-ink-700">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function AddBusinessDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [rating, setRating] = useState("4.0");
  const [estYear, setEstYear] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  function reset() {
    setName(""); setCategory(""); setCity(""); setPhone(""); setWhatsapp("");
    setEmail(""); setWebsite(""); setAddress(""); setDescription("");
    setLogoUrl(""); setCoverUrl(""); setImageUrls([""]); setRating("4.0");
    setEstYear(""); setMapsUrl(""); setReviews([]);
  }

  function addImageRow() { setImageUrls((p) => [...p, ""]); }
  function removeImageRow(i: number) { setImageUrls((p) => p.filter((_, idx) => idx !== i)); }
  function updateImageUrl(i: number, v: string) {
    setImageUrls((p) => { const n = [...p]; n[i] = v; return n; });
  }

  function addReview() { setReviews((p) => [...p, emptyReview()]); }
  function removeReview(i: number) { setReviews((p) => p.filter((_, idx) => idx !== i)); }
  function updateReview(i: number, field: keyof ReviewRow, val: string | number) {
    setReviews((p) => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });
  }

  function handleSubmit() {
    if (!name.trim()) { toast.error("Business name is required"); return; }
    if (!city) { toast.error("City is required"); return; }

    startTransition(async () => {
      const res = await createBusinessAdminAction({
        name, category, city,
        phone: phone || undefined,
        whatsapp_phone: whatsapp || undefined,
        email: email || undefined,
        website_url: website || undefined,
        address_line: address || undefined,
        description: description || undefined,
        logo_url: logoUrl || undefined,
        cover_url: coverUrl || undefined,
        image_urls: imageUrls.filter(Boolean),
        rating: parseFloat(rating) || 4.0,
        established_year: estYear ? parseInt(estYear) : undefined,
        google_maps_url: mapsUrl || undefined,
        reviews: reviews.filter((r) => r.reviewer_name.trim()),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Business created successfully");
        reset();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Business
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-surface-muted">
          <DialogTitle className="text-base font-bold">Add Business</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[65vh] px-6 py-4 space-y-3">

          <SectionLabel>Basic Info</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Business Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Karachi Executive Rentals" />
              </Field>
            </div>
            <Field label="City" required>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select city…</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <SectionLabel>Contact & Web</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" /></Field>
            <Field label="WhatsApp"><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+923001234567" /></Field>
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@business.com" /></Field>
            <Field label="Website URL"><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></Field>
            <div className="col-span-2">
              <Field label="Address"><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" /></Field>
            </div>
          </div>

          <SectionLabel>About</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Description">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of the business…" className="min-h-20" />
              </Field>
            </div>
            <Field label="Established Year">
              <Input type="number" value={estYear} onChange={(e) => setEstYear(e.target.value)} placeholder="e.g. 2015" min={1900} max={2099} />
            </Field>
            <Field label="Initial Rating (1–5)">
              <Input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min={1} max={5} step={0.1} />
            </Field>
            <div className="col-span-2">
              <Field label="Google Maps URL">
                <Input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
              </Field>
            </div>
          </div>

          <SectionLabel>Media</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Logo URL"><Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." /></Field>
            <Field label="Cover Image URL"><Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." /></Field>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-ink-700">Grid Images (URLs)</Label>
              <button type="button" onClick={addImageRow} className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
                <ImagePlus className="h-3.5 w-3.5" /> Add image
              </button>
            </div>
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input value={url} onChange={(e) => updateImageUrl(i, e.target.value)} placeholder={`Image ${i + 1} URL`} className="flex-1" />
                {imageUrls.length > 1 && (
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeImageRow(i)} className="shrink-0 text-ink-400 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <SectionLabel>Reviews</SectionLabel>
          <div className="space-y-3">
            {reviews.length === 0 && (
              <p className="text-xs text-ink-400">No reviews added. Click below to add.</p>
            )}
            {reviews.map((r, i) => (
              <div key={i} className="rounded-lg border border-surface-muted bg-surface-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-600">Review {i + 1}</span>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeReview(i)} className="text-ink-400 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Reviewer Name" required>
                    <Input value={r.reviewer_name} onChange={(e) => updateReview(i, "reviewer_name", e.target.value)} placeholder="Ahmed Khan" />
                  </Field>
                  <Field label="Rating">
                    <select
                      value={r.rating}
                      onChange={(e) => updateReview(i, "rating", parseInt(e.target.value))}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
                    </select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="Comment (optional)">
                      <Input value={r.comment} onChange={(e) => updateReview(i, "comment", e.target.value)} placeholder="Great service…" />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addReview} className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700">
              <Plus className="h-3.5 w-3.5" /> Add review
            </button>
          </div>

        </div>

        <DialogFooter className="px-6 py-4 border-t border-surface-muted bg-transparent -mx-0 -mb-0 rounded-b-xl">
          <DialogClose render={<Button variant="outline" size="sm" disabled={pending} />}>
            Cancel
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creating…" : "Create Business"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
