"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveBusinessLogoAction } from "@/app/actions/businesses";

// ── Generic car-rental logo SVG ───────────────────────────────────────────────
// Used when the vendor has not uploaded a logo.
export function GenericBusinessLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Business logo"
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" fill="#EFF6FF" />

      {/* Car body */}
      <rect x="10" y="34" width="44" height="14" rx="4" fill="#1D4ED8" />

      {/* Car cabin */}
      <path
        d="M18 34 L22 22 Q23 20 25 20 L39 20 Q41 20 42 22 L46 34 Z"
        fill="#2563EB"
      />

      {/* Windshield highlight */}
      <path
        d="M24 34 L27 25 Q28 23 30 23 L34 23 Q36 23 37 25 L40 34 Z"
        fill="#BFDBFE"
        opacity="0.7"
      />

      {/* Left wheel */}
      <circle cx="20" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="20" cy="48" r="3" fill="#93C5FD" />

      {/* Right wheel */}
      <circle cx="44" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="44" cy="48" r="3" fill="#93C5FD" />

      {/* Key icon — top right */}
      <circle cx="50" cy="14" r="6" stroke="#F59E0B" strokeWidth="2" fill="none" />
      <line x1="54" y1="18" x2="58" y2="22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="57" y1="21" x2="57" y2="24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <line x1="59" y1="23" x2="59" y2="25" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Logo upload widget ────────────────────────────────────────────────────────

interface BusinessLogoUploadProps {
  businessId: string;
  currentLogoUrl: string | null;
  businessName: string;
}

export function BusinessLogoUpload({
  businessId,
  currentLogoUrl,
  businessName,
}: BusinessLogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // Get signed upload token
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: `rentnowpk/logos/${businessId}` }),
      });
      if (!signRes.ok) throw new Error("Could not get upload token");
      const { cloudName, signature, timestamp, apiKey } = await signRes.json();

      // Upload to Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", `rentnowpk/logos/${businessId}`);
      form.append("transformation", "w_400,h_400,c_fill,g_center,q_auto,f_auto");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { secure_url } = await uploadRes.json();

      // Save to DB
      const res = await saveBusinessLogoAction(businessId, secure_url);
      if (res.error) throw new Error(res.error);

      setLogoUrl(secure_url);
      toast.success("Logo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo display */}
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-surface-muted bg-white shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
        title="Click to upload logo"
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={businessName}
            fill
            className="object-contain p-1"
            sizes="80px"
          />
        ) : (
          <GenericBusinessLogo size={56} />
        )}

        {/* Hover / uploading overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  );
}
