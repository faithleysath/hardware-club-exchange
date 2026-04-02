import "server-only";

import { Buffer } from "node:buffer";

import {
  LISTING_IMAGE_BUCKET,
  MAX_LISTING_IMAGE_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileExtension(fileName: string, type: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension) {
    return extension;
  }

  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function extractImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateImageFiles(files: File[]) {
  if (files.length > MAX_LISTING_IMAGES) {
    throw new Error(`最多上传 ${MAX_LISTING_IMAGES} 张图片`);
  }

  for (const file of files) {
    if (!allowedImageTypes.has(file.type)) {
      throw new Error("仅支持 JPG、PNG、WEBP 图片");
    }

    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      throw new Error("单张图片请控制在 4MB 以内");
    }
  }
}

export async function uploadListingImages(params: {
  files: File[];
  listingId: string;
  ownerId: string;
}) {
  const admin = createSupabaseAdminClient();
  const uploadedPaths: string[] = [];

  try {
    for (const [index, file] of params.files.entries()) {
      const extension = getFileExtension(file.name, file.type);
      const storagePath = `${params.ownerId}/${params.listingId}/${Date.now()}-${index}-${crypto.randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await admin.storage
        .from(LISTING_IMAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(storagePath);
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await admin.storage.from(LISTING_IMAGE_BUCKET).remove(uploadedPaths);
    }

    throw error;
  }

  return uploadedPaths;
}

export async function deleteListingImages(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const admin = createSupabaseAdminClient();
  await admin.storage.from(LISTING_IMAGE_BUCKET).remove(paths);
}

export async function getSignedImageUrlMap(paths: string[]) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  if (uniquePaths.length === 0) {
    return {} as Record<string, string>;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(LISTING_IMAGE_BUCKET)
    .createSignedUrls(uniquePaths, 60 * 60);

  if (error) {
    throw error;
  }

  return Object.fromEntries(
    data.map((item, index) => [uniquePaths[index], item.signedUrl]),
  );
}
