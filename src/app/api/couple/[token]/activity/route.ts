import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/couple/[token]/activity — last guest events (opened / responded) */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: guests } = await sb
    .from("guests")
    .select("id, name, status, guest_count, response_time, opened_at")
    .eq("event_id", event.id);

  if (!guests) return NextResponse.json({ items: [] });

  type Item = { type: "confirmed" | "declined" | "opened"; name: string; count: number; at: string };
  const items: Item[] = [];

  for (const g of guests) {
    if (g.response_time && (g.status === "confirmed" || g.status === "declined")) {
      items.push({ type: g.status, name: g.name, count: g.guest_count ?? 1, at: g.response_time });
    } else if (g.opened_at) {
      items.push({ type: "opened", name: g.name, count: g.guest_count ?? 1, at: g.opened_at });
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return NextResponse.json({ items: items.slice(0, 8) });
}
