import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkPhone } from "@/lib/phone-il";

export const dynamic = "force-dynamic";

async function getEventId(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

interface GuestRow {
  firstName: string;
  lastName: string;
  phone: string;
}

/* POST /api/couple/[token]/guests/bulk
   Body: { guests: GuestRow[] }
   Returns: { imported: number }
*/
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const rows: GuestRow[] = Array.isArray(body?.guests) ? body.guests : [];

  /* replace(/\D/g,"") is not normalisation. It turns +972501234567 into
     972501234567 and stores it, which is the shape phone-il.ts exists to
     prevent — the same drift that produced 34 rows in the wrong form and, on
     one guest, two invitations with two different personal links. */
  const sanitized = rows
    .map((r) => ({
      name: `${String(r.firstName ?? "").trim()} ${String(r.lastName ?? "").trim()}`.trim().slice(0, 255),
      phone: checkPhone(r.phone).local ?? "",
    }))
    .filter((g) => g.name.length > 0);

  if (sanitized.length === 0)
    return NextResponse.json({ error: "לא נמצאו שורות תקינות" }, { status: 422 });

  const sb = createServerClient();

  /* This route had no duplicate check of any kind, so the couple pasting a
     list twice — or adding four names and re-pasting the whole sheet — created
     a second row for everyone on it. Two rows means two invitations, two
     personal links and a headcount counted twice. */
  const { data: current } = await sb
    .from("guests").select("name, phone").eq("event_id", eventId);
  const seen = new Set(
    (current ?? []).map(g => checkPhone(g.phone as string).local).filter(Boolean) as string[],
  );
  const skipped: string[] = [];
  const accepted = sanitized.filter(g => {
    if (!g.phone) return true;                 /* phoneless guests are legitimate */
    if (seen.has(g.phone)) { skipped.push(g.name); return false; }
    seen.add(g.phone);
    return true;
  });

  if (!accepted.length) {
    return NextResponse.json({ imported: 0, skipped: skipped.length, skippedNames: skipped.slice(0, 20) });
  }

  const { data, error } = await sb
    .from("guests")
    .insert(accepted.map((g) => ({ ...g, event_id: eventId, status: "pending", guest_count: 1 })))
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    imported: data?.length ?? 0,
    skipped: skipped.length,
    skippedNames: skipped.slice(0, 20),
  });
}
