"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Star, ImagePlus, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  saveBusinessImageAction,
  deleteBusinessImageAction,
  setPrimaryBusinessImageAction,
} from "@/app/actions/businesses";

const MAX_IMAGES = 5;

interface ImageRecord {
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

interface BusinessImagesGridProps {
  businessId: string;
  initialImages?: ImageRecord[];
}

export function BusinessImagesGrid({
  businessId,
  initialImages = [],
}: BusinessImagesGridProps) {
  const [images, setImages] = useState<ImageRecord[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    const filesToUpload = files.slice(0, slots);
    if (files.length > slots) {
      toast.info(`Only ${slots} slot(s) remaining — uploading first ${slots} file(s)`);
    }

    setUploading(true);

    const entries = filesToUpload.map((file) => ({
      file,
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));

    setUploadProgress((prev) => ({
      ...prev,
      ...Object.fromEntries(entries.map(({ tempId }) => [tempId, 0])),
    }));

    type UploadResult =
      | { ok: true; public_id: string; secure_url: string }
      | { ok: false };

    const results: UploadResult[] = await Promise.all(
      entries.map(async ({ file, tempId }) => {
        try {
          const signRes = await fetch("/api/cloudinary/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: `rentnowpk/businesses/${businessId}` }),
          });
          if (!signRes.ok) throw new Error("Could not get upload token");
          const { cloudName, signature, timestamp, apiKey } = await signRes.json();

          setUploadProgress((prev) => ({ ...prev, [tempId]: 40 }));

          const form = new FormData();
          form.append("file", file);
          form.append("api_key", apiKey);
          form.append("timestamp", String(timestamp));
          form.append("signature", signature);
          form.append("folder", `rentnowpk/businesses/${businessId}`);

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

    setUploadProgress((prev) => {
      const copy = { ...prev };
      for (const { tempId } of entries) delete copy[tempId];
      return copy;
    });

    const succeeded = results.filter(
      (r): r is Extract<UploadResult, { ok: true }> => r.ok
    );

    for (let i = 0; i < succeeded.length; i++) {
      const r = succeeded[i];
      const isPrimary = images.length === 0 && i === 0;
      const sortOrder = images.length + i;

      const res = await saveBusinessImageAction({
        businessId,
        cloudinary_public_id: r.public_id,
        url: r.secure_url,
        sort_order: sortOrder,
        is_primary: isPrimary,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        setImages((prev) => {
          const next = [...prev];
          if (isPrimary) {
            // unset previous primary (shouldn't be any, but just in case)
            next.forEach((img) => (img.is_primary = false));
          }
          next.push({
            cloudinary_public_id: r.public_id,
            url: r.secure_url,
            sort_order: sortOrder,
            is_primary: isPrimary,
          });
          return next;
        });
        if (isPrimary) toast.success("Cover photo set!");
        else toast.success("Photo added!");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSetPrimary(publicId: string, url: string) {
    setLoadingAction(publicId + "_primary");
    const res = await setPrimaryBusinessImageAction(businessId, publicId, url);
    setLoadingAction(null);
    if (res.error) {
      toast.error(res.error);
    } else {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.cloudinary_public_id === publicId,
        }))
      );
      toast.success("Cover photo updated!");
    }
  }

  async function handleDelete(publicId: string) {
    setLoadingAction(publicId + "_delete");
    const res = await deleteBusinessImageAction(businessId, publicId);
    setLoadingAction(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    const updated = images
      .filter((img) => img.cloudinary_public_id !== publicId)
      .map((img, i) => ({ ...img, sort_order: i }));

    // If deleted image was primary, auto-promote first remaining
    if (updated.length > 0 && !updated.some((i) => i.is_primary)) {
      const first = updated[0];
      await setPrimaryBusinessImageAction(businessId, first.cloudinary_public_id, first.url);
      updated[0].is_primary = true;
    }

    setImages(updated);
    toast.success("Photo removed");
  }

  const uploadingEntries = Object.entries(uploadProgress);
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];
  const secondaryImages = images.filter(
    (i) => i.cloudinary_public_id !== primaryImage?.cloudinary_public_id
  );
  const canUpload = images.length < MAX_IMAGES && !uploading;

  return (
    <div className="space-y-4">
      {/* Grid layout */}
      {images.length > 0 ? (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-64 sm:h-80">
          {/* Primary / hero image — spans 2 cols × 2 rows */}
          {primaryImage && (
            <div className="col-span-2 row-span-2 group relative overflow-hidden">
              <Image
                src={primaryImage.url}
                alt="Primary business photo"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                <Star className="h-2.5 w-2.5 fill-white" /> Cover
              </span>
              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(primaryImage.cloudinary_public_id)}
                  disabled={!!loadingAction}
                  className="rounded-xl bg-red-500/90 p-2 text-white shadow backdrop-blur disabled:opacity-50"
                  title="Remove photo"
                >
                  {loadingAction === primaryImage.cloudinary_public_id + "_delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Secondary images — each spans 1 col × 1 row */}
          {secondaryImages.slice(0, 4).map((img) => (
            <div key={img.cloudinary_public_id} className="group relative overflow-hidden col-span-1 row-span-1">
              <Image
                src={img.url}
                alt="Business photo"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, 20vw"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 p-1">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.cloudinary_public_id, img.url)}
                  disabled={!!loadingAction}
                  className="w-full rounded-lg bg-amber-400/90 px-1.5 py-1 text-[10px] font-bold text-white shadow backdrop-blur disabled:opacity-50 leading-tight"
                  title="Set as cover"
                >
                  {loadingAction === img.cloudinary_public_id + "_primary" ? (
                    <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                  ) : (
                    "Set cover"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(img.cloudinary_public_id)}
                  disabled={!!loadingAction}
                  className="w-full rounded-lg bg-red-500/90 px-1.5 py-1 text-[10px] font-bold text-white shadow backdrop-blur disabled:opacity-50 leading-tight"
                  title="Remove"
                >
                  {loadingAction === img.cloudinary_public_id + "_delete" ? (
                    <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Upload slot if under max */}
          {canUpload && images.length < MAX_IMAGES && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="col-span-1 row-span-1 flex cursor-pointer flex-col items-center justify-center gap-1 bg-surface-muted/40 border-2 border-dashed border-ink-200 hover:border-brand-400 hover:bg-brand-50/40 transition-colors"
            >
              <ImagePlus className="h-5 w-5 text-ink-400" />
              <span className="text-[10px] font-semibold text-ink-400">Add</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty state upload zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-surface-muted/20 px-6 py-14 text-center transition hover:border-brand-400 hover:bg-brand-50/30"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Upload className="h-6 w-6 text-brand-500" />
          </div>
          <p className="text-sm font-semibold text-ink-700">Upload business photos</p>
          <p className="mt-1 text-xs text-ink-400">
            PNG, JPG up to 10 MB · Up to {MAX_IMAGES} photos
          </p>
          <p className="mt-3 text-xs text-brand-600 font-medium">
            The first photo becomes your cover image
          </p>
        </div>
      )}

      {/* Upload progress bars */}
      {uploadingEntries.length > 0 && (
        <div className="space-y-2">
          {uploadingEntries.map(([id, progress]) => (
            <div key={id}>
              <p className="mb-1 text-xs text-ink-500 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading…
              </p>
              <Progress value={progress} className="h-1.5" />
            </div>
          ))}
        </div>
      )}

      {/* Bottom bar: count + upload button if images exist */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            {images.length}/{MAX_IMAGES} photos
            {images.length >= MAX_IMAGES && " · Maximum reached"}
          </p>
          {canUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-xl border border-surface-muted bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm hover:border-brand-300 hover:text-brand-700 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add photo
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={!canUpload}
      />
    </div>
  );
}
