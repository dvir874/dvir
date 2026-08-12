import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { toLocalPhone } from "@/lib/phone";
import { parseGuestsFromXlsx } from "@/lib/xlsx-utils";

export const dynamic = "force-dynamic";

async function getEventId(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

/* POST /api/couple/[token]/guests/import
   Accepts: multipart/form-data with file (xlsx/xls)
   Returns: { imported: number }
*/
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  let parsed: { name: string; phone: string; guest_count: number }[];
  try {
    parsed = parseGuestsFromXlsx(buffer);
  } catch {
    return NextResponse.json({ error: "לא ניתן לקרוא את הקובץ. בדקו שהוא קובץ Excel תקין." }, { status: 422 });
  }

  if (parsed.length === 0)
    return NextResponse.json({ error: "לא נמצאו שורות תקינות. ודאו שיש עמודות: שם / שם פרטי, טלפון" }, { status: 422 });

  const sanitized = parsed
    .map((g) => ({
      name: String(g.name ?? "").trim().slice(0, 255),
      /* Stored in one shape, always — see toLocalPhone. Stripping non-digits
         alone left 972-prefixed numbers as typed, and a guest stored that way
         can never be matched to their own WhatsApp reply. */
      phone: toLocalPhone(g.phone).slice(0, 20),
      guest_count: Math.max(1, Math.min(20, Math.floor(Number(g.guest_count) || 1))),
    }))
    .filter((g) => g.name.length > 0);

  if (sanitized.length === 0)
    return NextResponse.json({ error: "לא נמצאו שורות תקינות לאחר בדיקה" }, { status: 422 });

  const sb = createServerClient();

  /* ── Not importing the same person twice ──────────────────────────────
   *
   * This was one insert of every row with no duplicate check at all. A request
   * that times out on a 550-row list — which is exactly the size arriving next
   * — leaves the client no way to tell whether it worked, so she presses import
   * again and the wedding has 1,100 guests. Every one of them then gets
   * invited twice, which spends the daily cap twice over and produces precisely
   * the reports that got this number restricted.
   *
   * Deliberately NOT a unique constraint on (event_id, phone). On the live list
   * עידן אבידרור and שרה שחר share one number, as couples do; a database rule
   * would reject the second of them for ever. The identity that matters is the
   * PERSON — name and phone together — which catches a re-imported file exactly
   * and lets two people share a handset. */
  const key = (g: { name: string; phone: string }) =>
    `${g.name.trim().replace(/\s+/g, " ")}|${g.phone}`;

  const { data: existingRows } = await sb.from("guests")
    .select("name, phone").eq("event_id", eventId);
  const known = new Set((existingRows ?? []).map(r =>
    key({ name: String(r.name ?? ""), phone: String(r.phone ?? "") })));

  const fresh: typeof sanitized = [];
  let duplicates = 0;
  for (const g of sanitized) {
    const k = key(g);
    if (known.has(k)) { duplicates++; continue; }   /* already on the list, or repeated inside the file */
    known.add(k);
    fresh.push(g);
  }

  if (fresh.length === 0) {
    return NextResponse.json({ imported: 0, duplicates, message: "כל השורות כבר קיימות ברשימה" });
  }

  /* In batches. One statement carrying 550 rows is a single point of failure at
     precisely the size where failure is most likely, and a partial success used
     to be indistinguishable from none. */
  const CHUNK = 200;
  let imported = 0;
  for (let i = 0; i < fresh.length; i += CHUNK) {
    const { data, error } = await sb
      .from("guests")
      .insert(fresh.slice(i, i + CHUNK).map(g => ({ ...g, event_id: eventId, status: "pending" })))
      .select("id");
    if (error) {
      /* Say what did land. Rows already written stay written, and the
         duplicate check above means running the import again picks up exactly
         the remainder rather than starting over. */
      return NextResponse.json(
        { error: error.message, imported, duplicates,
          message: `נוספו ${imported} אורחים ואז הייתה תקלה. הריצו את הייבוא שוב — מי שכבר נוסף לא ייכפל.` },
        { status: 500 },
      );
    }
    imported += data?.length ?? 0;
  }

  return NextResponse.json({ imported, duplicates });
}
