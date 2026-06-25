/**
 * File upload security — MIME type allowlist and size validation.
 *
 * file.type (from FormData) is client-supplied and cannot be trusted alone.
 * We validate both the declared MIME type AND the file extension against
 * explicit allowlists, and reject anything not on both lists.
 */

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
]);

const ALLOWED_VIDEO_MIME = new Set([
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/3gpp',
]);

const ALLOWED_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']);
const ALLOWED_VIDEO_EXT = new Set(['mp4', 'mov', 'avi', 'webm', '3gp']);

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  isVideo?: boolean;
  safeExt?: string;
}

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_GALLERY_SIZE = 50 * 1024 * 1024; // 50 MB per file in gallery

export function validateUploadFile(
  file: File,
  options: { allowVideo?: boolean; maxBytes?: number } = {},
): FileValidationResult {
  const { allowVideo = true, maxBytes } = options;

  const declaredMime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  const isImage = ALLOWED_IMAGE_MIME.has(declaredMime) && ALLOWED_IMAGE_EXT.has(ext);
  const isVideo = allowVideo && ALLOWED_VIDEO_MIME.has(declaredMime) && ALLOWED_VIDEO_EXT.has(ext);

  if (!isImage && !isVideo) {
    return {
      ok: false,
      error: `סוג קובץ לא נתמך. מותר: תמונות (JPEG, PNG, WebP, HEIC)${allowVideo ? ' ווידאו (MP4, MOV, WebM)' : ''}.`,
    };
  }

  const sizeLimit = maxBytes ?? (isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE);
  if (file.size > sizeLimit) {
    const mb = Math.round(sizeLimit / 1024 / 1024);
    return { ok: false, error: `קובץ גדול מדי — מקסימום ${mb}MB.` };
  }

  if (file.size === 0) {
    return { ok: false, error: 'הקובץ ריק.' };
  }

  return { ok: true, isVideo, safeExt: ext };
}
