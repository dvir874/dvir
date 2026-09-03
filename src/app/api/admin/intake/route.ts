import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { parseIntake, missingFields } from "@/lib/intake-parser";
import { readInvitationImage } from "@/lib/ai/read-image";
import { looksLikeCouple } from "@/lib/couple-name";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

/* Read a couple's WhatsApp message; create the event from what a human
   confirmed. Two steps on purpose — the parse never writes anything. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  /* The picture path is checked before the body is read at all.
   *
   * A request body can only be consumed once, and this handler opened with
   * req.json(). An upload arriving as multipart would have been drained as
   * JSON, failed to parse, and come back as a malformed request rather than as
   * an image — the kind of bug that looks like the model is broken. */
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    return await readImageMode(req);
  }

  const body = await req.json() as {
    mode?: "parse" | "create";
    text?: string;
    fields?: {
      couple?: string; date?: string; venue?: string; address?: string;
      reception?: string; chuppah?: string; client_name?: string; client_phone?: string;
    };
  };

  /* The invitation as a picture, which is how most of them arrive.
   *
   * Dvir: "רוב הזוגות שולחים את ההזמנה כתמונה ומתוכה אני מוציא את הפרטים."
   * The model reads it; src/lib/ai/invitation.ts decides what survives, on the
   * same contract the text parser has — a value needs a shape this system can
   * use AND a quote from the invitation, or it is handed back as rejected
   * rather than dropped into a field.
   *
   * The shape returned matches the text path exactly, so the screen shows the
   * same fields with the same "read from" line under each and Dvir confirms
   * them the same way. Whether a human or a model read the picture changes
   * nothing about who signs off on it. */
  if (body.mode !== "create") {
    const r = parseIntake(body.text ?? "");
    return NextResponse.json({ parsed: r, missing: missingFields(r) });
  }

  const f = body.fields ?? {};
  const need = [["couple", f.couple], ["date", f.date], ["venue", f.venue],
                ["reception", f.reception], ["chuppah", f.chuppah]] as const;
  const blank = need.filter(([, v]) => !String(v ?? "").trim()).map(([k]) => k);
  if (blank.length) return NextResponse.json({ error: `חסר: ${blank.join(", ")}` }, { status: 400 });

  /* The same test the sender applies before putting a value into
     "בעזרת ה׳ *{{1}}* מתחתנים" — refused here rather than at 300 messages. */
  if (!looksLikeCouple(f.couple!.trim()))
    return NextResponse.json({ error: `"${f.couple}" לא נראה כמו שמות בני זוג` }, { status: 400 });

  const sb = createServerClient();
  const { data: ev, error } = await sb.from("events").insert({
    name: `החתונה של ${f.couple!.trim()}`,
    couple_names: f.couple!.trim(),
    date: f.date,
    venue_name: f.venue!.trim(),
    address: (f.address ?? "").trim() || null,
    reception_time: f.reception,
    chuppah_time: f.chuppah,
    client_name: (f.client_name ?? "").trim() || null,
    client_phone: (f.client_phone ?? "").trim() || null,
    status: "info_received",
    couple_token: randomUUID(),
    helper_token: randomUUID(),
  }).select().single();

  if (error || !ev) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 500 });

  /* Both of these, always. שחר was created with an album and no vault token
     and תהל with a vault token and no album; each broke a different feature
     weeks later, and neither could be inferred from the other. */
  await sb.from("vault_tokens").insert({
    event_id: ev.id, token: randomUUID(), owner_token: randomUUID(),
  });
  await sb.from("gallery_albums").insert({
    event_id: ev.id, title: `תמונות מהחתונה של ${f.couple!.trim()}`,
    public_token: randomUUID(), owner_token: randomUUID(), is_public: false,
  });

  return NextResponse.json({
    event_id: ev.id, name: ev.name,
    couple_token: ev.couple_token, helper_token: ev.helper_token,
    /* Stated rather than assumed — the sender refuses without it. */
    next: "העלו את תמונת ההזמנה וייבאו את רשימת האורחים",
  });
}

async function readImageMode(req: NextRequest) {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "לא נבחרה תמונה" }, { status: 400 });
    }
    const out = await readInvitationImage(
      new Uint8Array(await file.arrayBuffer()), file.type);
    if (!out.ok) {
      /* The detail, not swallowed.
       *
       * "לא הצלחנו לקרוא את התמונה" covered a wrong key, a wrong model name, a
       * timeout and a network fault in the same four words — so the first real
       * failure told Dvir nothing about which of them it was. This route is
       * behind requireAdmin and its only reader is him, so the underlying
       * reason belongs on screen rather than in a log he would have to go and
       * find. */
      const say: Record<string, string> = {
        not_configured: "קריאת הזמנה מתמונה לא מופעלת — חסר ANTHROPIC_API_KEY",
        bad_type: `אפשר JPG, PNG או WEBP — הקובץ הזה הוא ${out.detail ?? "לא מזוהה"}`,
        too_large: `התמונה ${out.detail} והמקסימום 5MB`,
        failed: `לא הצלחנו לקרוא את התמונה — ${out.detail ?? "סיבה לא ידועה"}`,
      };
      console.error(`[intake:image] ${out.reason}: ${out.detail ?? ""}`);
      return NextResponse.json(
        { error: say[out.reason] ?? "שגיאה", reason: out.reason, detail: out.detail ?? null },
        { status: 400 });
    }
    const { rejected, ...fields } = out.read;
    return NextResponse.json({
      parsed: { ...fields, unparsed: rejected },
      missing: Object.entries(fields)
        .filter(([, f]) => (f as { value: unknown }).value === null)
        .map(([k]) => k),
    });
}
