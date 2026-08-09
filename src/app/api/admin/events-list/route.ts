import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/* Every event with just enough progress to choose between them.
   Running several weddings at once, the question is always "which one needs
   me today?" — so each row carries its counts, not only its name. */

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = createServerClient();
  const { data: events } = await sb
    .from("events")
    .select("id, name, date, address, wa_header_image_url")
    .order("date", { ascending: true });

  const rows = events ?? [];
  if (!rows.length) return NextResponse.json({ events: [] });

  const ids = rows.map(e => e.id);
  const byEvent = new Map<string, { total: number; confirmed: number; pending: number }>();
  for (let i = 0; i < ids.length; i += 50) {
    const { data: guests } = await sb
      .from("guests").select("event_id, status, category")
      .in("event_id", ids.slice(i, i + 50));
    for (const g of guests ?? []) {
      if (g.category === "demo") continue;
      const cur = byEvent.get(g.event_id) ?? { total: 0, confirmed: 0, pending: 0 };
      cur.total++;
      if (g.status === "confirmed") cur.confirmed++;
      if (g.status === "pending") cur.pending++;
      byEvent.set(g.event_id, cur);
    }
  }

  return NextResponse.json({
    events: rows.map(e => {
      const c = byEvent.get(e.id) ?? { total: 0, confirmed: 0, pending: 0 };
      return {
        id: e.id, name: e.name, date: e.date, address: e.address,
        hasImage: !!e.wa_header_image_url,
        daysToEvent: e.date
          ? Math.ceil((new Date(e.date).getTime() - Date.now()) / 86_400_000)
          : null,
        ...c,
        responseRate: c.total ? Math.round(((c.total - c.pending) / c.total) * 100) : 0,
      };
    }),
  });
}
