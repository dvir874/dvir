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
    /* Two ways to decode, because one of them is not always there.
     *
     * createImageBitmap is the fast path, but Safari only gained it in 16.4 and
     * it refuses HEIC outright — and HEIC is what an iPhone hands over. When it
     * threw, the catch below returned the original file and the upload went
     * straight back to 413, which is exactly what kept happening on Dvir's
     * phone after the first fix. An <img> with an object URL decodes anything
     * the browser can display, HEIC included, in every Safari that exists. */
    const src: CanvasImageSource & { width: number; height: number } =
      await (async () => {
        try {
          if (typeof createImageBitmap === "function") return await createImageBitmap(file);
        } catch { /* fall through to the image element */ }
        const url = URL.createObjectURL(file);
        try {
          const img = new Image();
          img.decoding = "sync";
          await new Promise<void>((ok, fail) => {
            img.onload = () => ok();
            img.onerror = () => fail(new Error("decode"));
            img.src = url;
          });
          return img;
        } finally { URL.revokeObjectURL(url); }
      })();

    const scale = Math.min(1, MAX_EDGE / Math.max(src.width, src.height));
    const w = Math.round(src.width * scale);
    const h = Math.round(src.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(src, 0, 0, w, h);
    (src as ImageBitmap).close?.();

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
