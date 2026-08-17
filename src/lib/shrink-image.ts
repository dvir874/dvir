/* Make the photo small enough to survive the journey.
 *
 * Vercel caps a serverless request body at about 4.5 MB, and it rejects with a
 * bare 413 before any of our code runs — so nothing we validate, log or explain
 * ever sees it. A photo straight from an iPhone is 3–8 MB, which is why a
 * 200 KB test image posted by curl sailed through while every real photograph
 * from Dvir's phone failed. Three different limits were in play — 50 MB in the
 * page text, 20 MB in the validator, 4.5 MB at the platform — and the binding
 * one was the invisible one.
 *
 * Resizing in the browser fixes it at the only point where the file is still
 * ours to change. It is also simply better: a 2400px JPEG is more than any
 * gallery or collage needs, uploads in a fraction of the time on wedding-hall
 * wifi, and costs the couple far less bandwidth when 300 guests open it.
 *
 * Anything the canvas cannot read — HEIC on an older browser, a corrupt file —
 * is returned untouched rather than lost. Better a 413 on one photo than a
 * silent no-op on all of them.
 */

const MAX_EDGE = 2400;
const QUALITY  = 0.85;
/* Comfortably under Vercel's limit, with room for the rest of the form. */
const TARGET_BYTES = 3.5 * 1024 * 1024;

export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= TARGET_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob: Blob | null = await new Promise(res =>
      canvas.toBlob(res, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;

    /* A name with a real extension, since the original may have neither. */
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    /* Unreadable by the canvas — send the original and let the server decide. */
    return file;
  }
}
