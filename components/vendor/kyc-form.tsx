"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { submitKycAction } from "@/app/actions/kyc";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface KycImageUploadProps {
  label: string;
  hint: string;
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  folder: string;
}

function KycImageUpload({
  label,
  hint,
  value,
  onChange,
  folder,
}: KycImageUploadProps) {
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
      <Label className="text-sm font-medium text-ink-700">{label}</Label>
      <p className="text-xs text-ink-400">{hint}</p>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
          value
            ? "border-emerald-300 bg-emerald-50"
            : "border-surface-muted bg-surface-muted/40 hover:border-brand-300 hover:bg-brand-50/30"
        }`}
      >
        {value ? (
          <>
            <Image
              src={value.url}
              alt={label}
              fill
              className="rounded-2xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-medium text-white">Click to replace</p>
            </div>
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-500">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-xs font-medium">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-400">
            <Upload className="h-7 w-7" />
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

export function KycForm() {
  const router = useRouter();
  const [cnic, setCnic] = useState("");
  const [front, setFront] = useState<UploadedImage | null>(null);
  const [back, setBack] = useState<UploadedImage | null>(null);
  const [selfie, setSelfie] = useState<UploadedImage | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Format CNIC as user types: XXXXX-XXXXXXX-X
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 13);
    if (raw.length > 12)
      raw = raw.slice(0, 5) + "-" + raw.slice(5, 12) + "-" + raw.slice(12);
    else if (raw.length > 5) raw = raw.slice(0, 5) + "-" + raw.slice(5);
    setCnic(raw);
  };

  const canSubmit = cnic.length === 15 && front && back && selfie && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success("KYC submitted! We'll review it within 1–2 business days.");
      router.refresh();
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CNIC Number */}
          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC Number</Label>
            <Input
              id="cnic"
              type="text"
              inputMode="numeric"
              placeholder="XXXXX-XXXXXXX-X"
              value={cnic}
              onChange={handleCnicChange}
              className="font-mono tracking-wider"
              maxLength={15}
            />
            <p className="text-xs text-ink-400">Format: 42101-1234567-8</p>
          </div>

          {/* Document images */}
          <div className="grid gap-4 sm:grid-cols-2">
            <KycImageUpload
              label="CNIC Front"
              hint="Clear photo of the front of your CNIC"
              value={front}
              onChange={setFront}
              folder="cnic-front"
            />
            <KycImageUpload
              label="CNIC Back"
              hint="Clear photo of the back of your CNIC"
              value={back}
              onChange={setBack}
              folder="cnic-back"
            />
          </div>

          <KycImageUpload
            label="Selfie with CNIC"
            hint="Hold your CNIC next to your face — both must be clearly visible"
            value={selfie}
            onChange={setSelfie}
            folder="selfie"
          />

          {/* Agreement */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface-muted bg-surface-muted/30 p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-brand-600"
            />
            <span className="text-sm text-ink-600 leading-relaxed">
              I confirm that the documents I am submitting are genuine and
              belong to me. I agree to RentNowPk&apos;s{" "}
              <span className="font-medium text-brand-600">
                Terms of Service
              </span>{" "}
              and consent to identity verification.
            </span>
          </label>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || submitting}
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
        </form>
      </CardContent>
    </Card>
  );
}
