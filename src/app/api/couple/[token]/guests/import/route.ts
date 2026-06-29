import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
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
      phone: String(g.phone ?? "").replace(/\D/g, "").slice(0, 20),
      guest_count: Math.max(1, Math.min(20, Math.floor(Number(g.guest_count) || 1))),
    }))
    .filter((g) => g.name.length > 0);

  if (sanitized.length === 0)
    return NextResponse.json({ error: "לא נמצאו שורות תקינות לאחר בדיקה" }, { status: 422 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("guests")
    .insert(sanitized.map((g) => ({ ...g, event_id: eventId, status: "pending" })))
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? 0 });
}
