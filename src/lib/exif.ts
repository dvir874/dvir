/**
 * When a photo was taken, read from the file itself.
 *
 * Guests upload the morning after, in whatever order they get round to it, so
 * uploaded_at cannot reconstruct the evening. EXIF DateTimeOriginal can: it is
 * the moment the shutter actually fired.
 *
 * Deliberately dependency-free and deliberately quick to give up. Every failure
 * path returns null, and null is a perfectly good answer — videos, screenshots,
 * anything forwarded through WhatsApp and most HEIC arrive with no usable EXIF.
 * Those photos are still worth having; they just sort by upload time instead.
 */

/** Tags that carry a capture time, in the order we trust them. */
const DATE_TIME_ORIGINAL  = 0x9003;
const DATE_TIME_DIGITIZED = 0x9004;
const DATE_TIME           = 0x0132;
/** Sub-IFD pointers worth following. DateTimeOriginal lives in the Exif IFD. */
const EXIF_IFD_POINTER    = 0x8769;
const ASCII               = 2;

/** Wall-clock strings have no zone. Photographs at an Israeli wedding are Israeli time. */
const EVENT_TZ = 'Asia/Jerusalem';

/**
 * How far `tz` sits from UTC at a given instant — computed rather than assumed,
 * so the summer/winter boundary does not shift an evening by an hour.
 */
function tzOffsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);

  const p: Record<string, string> = {};
  for (const { type, value } of parts) p[type] = value;

  const asUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    p.hour === '24' ? 0 : Number(p.hour), Number(p.minute), Number(p.second),
  );
  return asUtc - at.getTime();
}

/** "2026:08:24 21:34:12" in local time → the instant it names. */
function wallClockToDate(raw: string): Date | null {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(raw.trim());
  if (!m) return null;

  const [, y, mo, d, h, mi, s] = m.map(Number) as unknown as number[];
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  if (!Number.isFinite(guess)) return null;

  const at = new Date(guess - tzOffsetMs(new Date(guess), EVENT_TZ));

  /* Cameras with a dead battery cheerfully report 1980. A capture time in the
     future is equally meaningless. Either way, no time beats a wrong one —
     a wrong one would silently misplace the photo in the couple's evening. */
  const t = at.getTime();
  if (t < Date.UTC(2000, 0, 1)) return null;
  if (t > Date.now() + 36 * 60 * 60 * 1000) return null;
  return at;
}

/** Reads the TIFF block inside an APP1 segment. `base` points at the byte order mark. */
function readTiff(v: DataView, base: number, end: number): string | null {
  if (base + 8 > end) return null;

  const bom = v.getUint16(base);
  const le  = bom === 0x4949;              // "II"
  if (!le && bom !== 0x4d4d) return null;  // not "MM" either — not TIFF

  const u16 = (o: number) => v.getUint16(o, le);
  const u32 = (o: number) => v.getUint32(o, le);

  if (u16(base + 2) !== 42) return null;

  const found = new Map<number, string>();

  const readIfd = (ifd: number, depth: number): void => {
    /* Depth-limited: a malformed file can point an IFD at itself, and this
       runs on every upload. */
    if (depth > 2 || ifd < base || ifd + 2 > end) return;

    const count = u16(ifd);
    for (let i = 0; i < count; i++) {
      const entry = ifd + 2 + i * 12;
      if (entry + 12 > end) return;

      const tag = u16(entry);
      if (tag === EXIF_IFD_POINTER) { readIfd(base + u32(entry + 8), depth + 1); continue; }
      if (u16(entry + 2) !== ASCII) continue;
      if (tag !== DATE_TIME_ORIGINAL && tag !== DATE_TIME_DIGITIZED && tag !== DATE_TIME) continue;

      const len    = u32(entry + 4);
      if (len < 19 || len > 64) continue;
      const valOff = len > 4 ? base + u32(entry + 8) : entry + 8;
      if (valOff < base || valOff + len > end) continue;

      let s = '';
      for (let k = 0; k < len - 1; k++) s += String.fromCharCode(v.getUint8(valOff + k));
      found.set(tag, s);
    }
  };

  readIfd(base + u32(base + 4), 0);

  return found.get(DATE_TIME_ORIGINAL)
      ?? found.get(DATE_TIME_DIGITIZED)
      ?? found.get(DATE_TIME)
      ?? null;
}

/**
 * The moment a JPEG was captured, or null when the file cannot say.
 * Never throws — a photo that arrives is worth more than its metadata.
 */
export function exifTakenAt(buf: ArrayBuffer): Date | null {
  try {
    const v = new DataView(buf);
    if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null;  // not a JPEG

    let off = 2;
    while (off + 4 <= v.byteLength) {
      if (v.getUint8(off) !== 0xff) return null;                    // desynced
      const marker = v.getUint8(off + 1);

      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { off += 2; continue; }
      if (marker === 0xda) return null;                             // image data begins

      const len = v.getUint16(off + 2);
      if (len < 2) return null;

      if (marker === 0xe1 && off + 10 <= v.byteLength
          && v.getUint32(off + 4) === 0x45786966                    // "Exif"
          && v.getUint16(off + 8) === 0) {
        const raw = readTiff(v, off + 10, Math.min(off + 2 + len, v.byteLength));
        return raw ? wallClockToDate(raw) : null;
      }

      off += 2 + len;
    }
    return null;
  } catch {
    /* Any malformed file lands here. It still uploads; it just sorts by arrival. */
    return null;
  }
}
