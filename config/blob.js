import { del } from "@vercel/blob";

export async function deleteImages(urls = []) {
  const blobUrls = urls.filter(
    (url) => typeof url === "string" && url.includes(".public.blob.vercel-storage.com/")
  );
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch (err) {
    // A failed blob deletion must never take the request down with it.
  }
}
