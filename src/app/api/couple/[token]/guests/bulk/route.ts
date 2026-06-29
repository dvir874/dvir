import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

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

  const sanitized = rows
    .map((r) => ({
      name: `${String(r.firstName ?? "").trim()} ${String(r.lastName ?? "").trim()}`.trim().slice(0, 255),
      phone: String(r.phone ?? "").replace(/\D/g, "").slice(0, 20),
    }))
    .filter((g) => g.name.length > 0);

  if (sanitized.length === 0)
    return NextResponse.json({ error: "לא נמצאו שורות תקינות" }, { status: 422 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("guests")
    .insert(sanitized.map((g) => ({ ...g, event_id: eventId, status: "pending", guest_count: 1 })))
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? 0 });
}
