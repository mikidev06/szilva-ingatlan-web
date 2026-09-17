const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

// Scales the image down so that its longer side is no larger than
// MAX_DIMENSION (keeping the aspect ratio, without cropping), then compresses
// it as JPEG. This way every uploaded photo ends up at a similar, manageable
// size before it even leaves the browser.
export async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Tomorites sikertelen."))),
        "image/jpeg",
        JPEG_QUALITY
      );
    });

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    // If the compression fails for any reason (the browser does not support
    // it, for instance), we upload the original file unchanged.
    return file;
  }
}
