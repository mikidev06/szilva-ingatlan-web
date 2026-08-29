import { put, del } from "@vercel/blob";
import crypto from "crypto";
import path from "path";

export async function uploadImage(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const blob = await put(`listings/${crypto.randomUUID()}${ext}`, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function uploadImages(files = []) {
  return Promise.all(files.map((file) => uploadImage(file)));
}

export async function deleteImages(urls = []) {
  const blobUrls = urls.filter(
    (url) => typeof url === "string" && url.includes(".public.blob.vercel-storage.com/")
  );
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch (err) {
    // A blob torlese nem szabad, hogy megallitsa a kiszolgalast.
  }
}
