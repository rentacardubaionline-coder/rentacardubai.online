"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveImagesAction, submitForApprovalAction, deleteImageAction } from "@/app/actions/listings";
import { Upload, Trash2, Star } from "lucide-react";

interface ImageRecord {
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

interface Step4Props {
  listingId: string;
  existingImages?: ImageRecord[];
}

export function Step4Images({ listingId, existingImages = [] }: Step4Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageRecord[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }

    setUploading(true);

    // Assign a stable tempId to each file upfront so all progress bars appear at once
    const entries = files.map((file) => ({
      file,
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));

    setUploadProgress((prev) => ({
      ...prev,
      ...Object.fromEntries(entries.map(({ tempId }) => [tempId, 0])),
    }));

    // Upload all files in parallel
    type UploadResult =
      | { ok: true; public_id: string; secure_url: string }
      | { ok: false };

    const results: UploadResult[] = await Promise.all(
      entries.map(async ({ file, tempId }) => {
        try {
          // 1. Get signed upload token
          const signRes = await fetch("/api/cloudinary/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: `rentnowpk/listings/${listingId}` }),
          });
          if (!signRes.ok) throw new Error("Could not get upload token");
          const { cloudName, signature, timestamp, apiKey } = await signRes.json();

          setUploadProgress((prev) => ({ ...prev, [tempId]: 40 }));

          // 2. Upload to Cloudinary
          const form = new FormData();
          form.append("file", file);
          form.append("api_key", apiKey);
          form.append("timestamp", String(timestamp));
          form.append("signature", signature);
          form.append("folder", `rentnowpk/listings/${listingId}`);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: form }
          );
          if (!uploadRes.ok) throw new Error("Upload failed");
          const { public_id, secure_url } = await uploadRes.json();

          setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

          return { ok: true as const, public_id, secure_url };
        } catch {
          toast.error(`Failed to upload ${file.name}`);
          return { ok: false as const };
        }
      })
    );

    // Clear all progress bars at once
    setUploadProgress((prev) => {
      const copy = { ...prev };
      for (const { tempId } of entries) delete copy[tempId];
      return copy;
    });

    const succeeded = results.filter((r): r is Extract<UploadResult, { ok: true }> => r.ok);
    if (succeeded.length > 0) {
      const newImages: ImageRecord[] = succeeded.map((r, i) => ({
        cloudinary_public_id: r.public_id,
        url: r.secure_url,
        sort_order: images.length + i,
        is_primary: images.length === 0 && i === 0,
      }));

      const updated = [...images, ...newImages];
      setImages(updated);
      const res = await saveImagesAction(listingId, updated);
      if (res.error) toast.error(res.error);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function setPrimary(publicId: string) {
    const updated = images.map((img) => ({
      ...img,
      is_primary: img.cloudinary_public_id === publicId,
    }));
    setImages(updated);
    const res = await saveImagesAction(listingId, updated);
    if (res.error) toast.error(res.error);
  }

  async function removeImage(publicId: string) {
    const res = await deleteImageAction(listingId, publicId);
    if (res.error) { toast.error(res.error); return; }
    const updated = images
      .filter((img) => img.cloudinary_public_id !== publicId)
      .map((img, i) => ({ ...img, sort_order: i }));
    if (updated.length > 0 && !updated.some((i) => i.is_primary)) {
      updated[0].is_primary = true;
    }
    setImages(updated);
    if (updated.length > 0) await saveImagesAction(listingId, updated);
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await submitForApprovalAction(listingId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Listing submitted for approval!");
        router.push("/vendor/listings");
      }
    });
  }

  const uploadingEntries = Object.entries(uploadProgress);

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div>
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-surface-muted/30 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-3 h-8 w-8 text-ink-400" />
          <p className="text-sm font-medium text-ink-700">Click to upload photos</p>
          <p className="mt-1 text-xs text-ink-400">PNG, JPG up to 10 MB · Max 8 images</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || images.length >= 8}
          />
        </div>

        {/* Upload progress bars */}
        {uploadingEntries.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadingEntries.map(([id, progress]) => (
              <div key={id}>
                <p className="mb-1 text-xs text-ink-500">Uploading…</p>
                <Progress value={progress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.cloudinary_public_id} className="group relative overflow-hidden rounded-xl">
              <Image
                src={img.url}
                alt="Listing photo"
                width={200}
                height={150}
                className="h-32 w-full object-cover"
              />
              {/* Primary badge */}
              {img.is_primary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Star className="h-2.5 w-2.5" /> Primary
                </span>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.cloudinary_public_id)}
                    className="rounded-lg bg-amber-400 px-2 py-1 text-[10px] font-bold text-white"
                    title="Set as primary"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.cloudinary_public_id)}
                  className="rounded-lg bg-red-500 p-1.5 text-white"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-sm text-ink-400">
          No photos uploaded yet. Add at least one to submit for approval.
        </p>
      )}

      <div className="flex justify-between border-t border-surface-muted pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=4`)}
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || images.length === 0}
        >
          {isPending ? "Submitting…" : "Submit for Approval ✓"}
        </Button>
      </div>
    </div>
  );
}
