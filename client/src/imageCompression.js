const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

// Lekicsinyiti a kepet ugy, hogy a hosszabb oldala ne legyen nagyobb, mint
// MAX_DIMENSION (az aranyok megtartasaval, vagas nelkul), majd JPEG-kent
// tomoriti. Igy minden feltoltott fenykep hasonlo, kezelheto meretu lesz,
// meg mielott elhagyna a bongeszot.
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
    // Ha a tomorites bármiért nem sikerul (pl. a bongeszo nem tamogatja),
    // az eredeti fajlt toltjuk fel valtoztatas nelkul.
    return file;
  }
}
