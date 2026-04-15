import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a remote image to Cloudinary and return the secure URL.
 * Used for syncing makes/models logos from external APIs.
 */
export async function uploadRemoteImage(
  imageUrl: string,
  folder: string,
  publicId?: string,
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      public_id: publicId,
      resource_type: "auto",
      secure: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload image ${imageUrl}:`, error);
    // Return original URL if upload fails
    return imageUrl;
  }
}

/**
 * Generate a signed URL for client-side uploads (vendor image uploads).
 */
export function generateUploadSignature(folder: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;

  const crypto = require("crypto");
  const signature = crypto.createHash("sha256").update(toSign).digest("hex");

  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    folder,
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}
