"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitKycAction } from "@/app/actions/kyc";
import { toast } from "sonner";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface KycUploadSlotProps {
  label: string;
  hint: string;
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  folder: string;
}

function KycUploadSlot({
  label,
  hint,
  value,
  onChange,
  folder,
}: KycUploadSlotProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: `rentnowpk/kyc/${folder}` }),
      });
      if (!signRes.ok) throw new Error("Could not get upload token");
      const { cloudName, signature, timestamp, apiKey } = await signRes.json();

      const safeName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
      const form = new FormData();
      form.append("file", file, safeName);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", `rentnowpk/kyc/${folder}`);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { public_id, secure_url } = await uploadRes.json();
      onChange({ url: secure_url, publicId: public_id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-ink-700">{label}</Label>
        {value && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Uploaded
          </span>
        )}
      </div>
      <p className="text-xs text-ink-400 -mt-1">{hint}</p>
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          "relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all",
          value
            ? "border-emerald-300 bg-emerald-50/50"
            : "border-ink-200 bg-surface-muted/30 hover:border-brand-400 hover:bg-brand-50/30",
        ].join(" ")}
      >
        {value ? (
          <>
            <Image
              src={value.url}
              alt={label}
              fill
              className="rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-semibold text-white">
                Click to replace
              </p>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-500">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-xs font-medium">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Click to upload</span>
            <span className="text-[10px] text-ink-300">
              JPG, PNG, HEIC up to 10MB
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </button>
    </div>
  );
}

interface StepKycProps {
  kycStatus: string | null; // null = not submitted, "pending" = awaiting review
  onComplete: () => void;
  onSkip: () => void;
}

export function StepKyc({ kycStatus, onComplete, onSkip }: StepKycProps) {
  const [cnic, setCnic] = useState("");
  const [front, setFront] = useState<UploadedImage | null>(null);
  const [back, setBack] = useState<UploadedImage | null>(null);
  const [selfie, setSelfie] = useState<UploadedImage | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCnic = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 13);
    if (raw.length > 12)
      raw = `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;
    else if (raw.length > 5) raw = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    setCnic(raw);
  };

  const canSubmit = cnic.length === 15 && front && back && selfie && agreed;

  // Already pending or approved
  if (kycStatus === "pending") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-900">
              KYC Under Review
            </h3>
            <p className="text-sm text-amber-700">
              Your identity documents are being reviewed. This typically takes
              1–2 business days. We'll notify you once it's approved.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-ink-500 underline-offset-4 hover:underline"
          >
            Continue to dashboard
          </button>
          <Button type="button" onClick={onComplete}>
            Next step
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const result = await submitKycAction({
      cnic_number: cnic,
      front_url: front!.url,
      back_url: back!.url,
      selfie_url: selfie!.url,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Documents submitted for verification!");
      onComplete();
    }
  };

  const progress = [
    cnic.length === 15,
    !!front,
    !!back,
    !!selfie,
    agreed,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500 font-medium">
            {progress} of 5 fields complete
          </span>
          <span className="text-brand-600 font-semibold">
            {Math.round((progress / 5) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${(progress / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-brand-900">
            Why we verify identity
          </p>
          <p className="text-xs text-brand-700 leading-relaxed">
            KYC ensures trust and safety for all users. Your documents are
            encrypted and never shared with third parties.
          </p>
        </div>
      </div>

      {/* CNIC number */}
      <div className="space-y-1.5">
        <Label htmlFor="cnic" className="text-sm font-medium text-ink-700">
          CNIC Number <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="cnic"
          inputMode="numeric"
          placeholder="42101-1234567-8"
          value={cnic}
          onChange={handleCnic}
          className="h-11 font-mono tracking-widest text-base"
          maxLength={15}
        />
        {cnic.length > 0 && cnic.length < 15 && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            Format: XXXXX-XXXXXXX-X
          </p>
        )}
      </div>

      {/* Image uploads */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KycUploadSlot
          label="CNIC Front"
          hint="Clear, well-lit photo of the front side"
          value={front}
          onChange={setFront}
          folder="cnic-front"
        />
        <KycUploadSlot
          label="CNIC Back"
          hint="Clear, well-lit photo of the back side"
          value={back}
          onChange={setBack}
          folder="cnic-back"
        />
      </div>
      <KycUploadSlot
        label="Selfie with CNIC"
        hint="Hold your CNIC next to your face — both must be clearly visible"
        value={selfie}
        onChange={setSelfie}
        folder="selfie"
      />

      {/* Agreement */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-muted bg-surface-muted/30 p-4 hover:bg-surface-muted/60 transition-colors">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-brand-600 cursor-pointer"
        />
        <span className="text-sm text-ink-600 leading-relaxed">
          I confirm these documents are genuine and belong to me. I agree to
          DubaiRentACar&apos;s{" "}
          <span className="font-medium text-brand-600">Terms of Service</span>{" "}
          and consent to identity verification.
        </span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-surface-muted">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-ink-500 underline-offset-4 hover:underline hover:text-ink-700 transition-colors"
        >
          Skip for now
        </button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="min-w-44 shadow-md shadow-brand-500/20"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </div>
    </div>
  );
}
