import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { readGuests } from "@/lib/ai/read-guests";
import { guestListSummary } from "@/lib/ai/guest-list";

export const dynamic = "force-dynamic";
/* A 500-name list is a long answer from the model. */
export const maxDuration = 180;

/* Read a guest list out of whatever the couple sent — pasted text, or a
 * photograph of a page.
 *
 * READS ONLY. Nothing here writes a guest, and that is deliberate: importing
 * starts invitations going out to real people, and the point of this endpoint
 * is to put the result in front of a person first. The existing import route
 * does the writing, once somebody has looked.
 *
 * The answer always carries three lists — what was read, what was refused, and
 * what the model did not return at all. The third is the one that matters:
 * nobody counts 174 names, so a guest lost here is discovered at the wedding.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  /* The picture path is checked before the body is read at all — a body can be
     consumed once, and req.json() on a multipart upload drains it into a parse
     error that looks like a broken model. Same order as /api/admin/intake. */
  const isMultipart = req.headers.get("content-type")?.includes("multipart/form-data");

  const out = isMultipart
    ? await (async () => {
        const form = await req.formData();
        const file = form.get("image");
        if (!(file instanceof File)) {
          return { ok: false as const, reason: "bad_type" as const, detail: "לא צורפה תמונה" };
        }
        return readGuests({
          bytes: new Uint8Array(await file.arrayBuffer()),
          mime: file.type || "image/jpeg",
        });
      })()
    : await (async () => {
        const body = await req.json().catch(() => ({})) as { text?: string };
        return readGuests({ text: String(body.text ?? "") });
      })();

  if (!out.ok) {
    const say: Record<string, string> = {
      not_configured: "קריאת רשימות לא מוגדרת — חסר ANTHROPIC_API_KEY",
      too_large: "הרשימה גדולה מדי",
      bad_type: "אפשר להעלות רק JPG, PNG או WEBP",
      empty: "לא הודבק טקסט",
      failed: `לא הצלחנו לקרוא את הרשימה — ${out.detail ?? "סיבה לא ידועה"}`,
    };
    console.error(`[guests-read] ${out.reason}: ${out.detail ?? ""}`);
    return NextResponse.json(
      { error: say[out.reason] ?? "שגיאה", reason: out.reason, detail: out.detail ?? null },
      { status: out.reason === "not_configured" ? 501 : 400 },
    );
  }

  const { read } = out;
  return NextResponse.json({
    guests: read.guests,
    rejected: read.rejected,
    /* Never omitted, even when empty — a caller that only renders this when
       present would show nothing on the one run where it mattered. */
    missed: read.missed,
    summary: guestListSummary(read),
    /* From a photograph the source is the model's own transcription, so a line
       it never saw cannot be detected. The screen has to say so. */
    sourceIsTranscript: out.usedTranscript,
    total: read.guests.reduce((a, g) => a + (g.count ?? 1), 0),
  });
}
