import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import sharp from "sharp";
import { washFrom } from "@/lib/invitation-wash";

export const dynamic = "force-dynamic";

/* The invitation card, uploaded from the machine it is actually on.
 *
 * The screen beside this one asks for an https URL, because that is what Meta
 * needs — it fetches the image itself on every send. But the card never arrives
 * as a URL. The couple sends it on WhatsApp, it lands in Downloads, and there
 * was nothing between that file and the field. Every event so far needed the
 * image hosted somewhere else first.
 *
 * Stored in the bucket the gallery already uses, under its own prefix, and
 * handed back as a signed URL with a ten-year life — the same shape the gallery
 * hands to guests. Meta must be able to fetch it on every send for as long as
 * the wedding is in the future, so a short-lived link is not an option.
 */

/* Meta's own limits for a template header image. Exceeding them fails at send
   time, per guest, long after this screen said "saved". */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png"]);

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const eventId = String(form?.get("event_id") ?? "").trim();

  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });
  if (!(file instanceof File) || !file.size)
    return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `וואטסאפ מקבל JPG או PNG בלבד — הקובץ הזה הוא ${file.type || "לא מזוהה"}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `הקובץ ${(file.size / 1024 / 1024).toFixed(1)}MB, והמקסימום הוא 5MB` },
      { status: 413 },
    );
  }

  const sb = createServerClient();

  /* The event must exist before its card does, and naming the file after the
     event is what stops one couple's invitation reaching another's guests —
     the failure the field's own comment names. */
  const { data: ev } = await sb.from("events")
    .select("id, name, rsvp_bg").eq("id", eventId).maybeSingle();
  if (!ev) return NextResponse.json({ error: "האירוע לא נמצא" }, { status: 404 });

  const ext = file.type === "image/png" ? "png" : "jpg";
  /* Timestamped, so replacing a card leaves the previous one reachable rather
     than breaking every message already delivered that points at it. */
  const path = `invitations/${eventId}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: storageErr } = await sb.storage.from("gallery")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (storageErr) {
    console.error("[event-image:upload]", storageErr.message);
    return NextResponse.json({ error: "ההעלאה נכשלה" }, { status: 500 });
  }

  const { data: signed } = await sb.storage.from("gallery")
    .createSignedUrl(path, 315_360_000);
  const url = signed?.signedUrl;
  if (!url) return NextResponse.json({ error: "לא הופקה כתובת לתמונה" }, { status: 500 });

  /* The page behind the card, taken from the card.
   *
   * events.rsvp_bg exists so the RSVP page looks like it belongs to the
   * invitation above it — שחר's blue sky, תהל's autumn beige. It was chosen by
   * hand per wedding, which made it a step that gets forgotten: שלמה's page
   * opened in the default cool blue under an ivory card bordered in green vine,
   * and read as a different event.
   *
   * Nothing about the right colour is a judgement call — it is in the image,
   * and the image is being uploaded anyway. Sampled from the top eighth, which
   * is the card's own background rather than its text or its centrepiece.
   *
   * Only when it has not been set. A wash somebody chose deliberately is not
   * overwritten by a replacement card. */
  let wash: string | null = null;
  if (!ev.rsvp_bg) {
    try {
      const meta = await sharp(bytes).metadata();
      const strip = Math.max(1, Math.floor((meta.height ?? 8) / 8));
      const { data: px } = await sharp(bytes)
        .extract({ left: 0, top: 0, width: meta.width ?? 1, height: strip })
        .resize(1, 1, { fit: "fill" })
        .raw().toBuffer({ resolveWithObject: true });
      wash = washFrom({ r: px[0], g: px[1], b: px[2] });
    } catch (err) {
      /* A card that cannot be sampled still has to become the header image.
         The wash is a nicety; the image is what unblocks sending. */
      console.warn("[event-image:wash]", err);
    }
  }

  const { error } = await sb.from("events")
    .update({ wa_header_image_url: url, ...(wash ? { rsvp_bg: wash } : {}) })
    .eq("id", eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url, event: ev.name, wash });
}
