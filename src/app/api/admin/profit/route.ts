import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* What each wedding actually earned.
 *
 * The system knew exactly how many messages went out, to whom, when, and what
 * Meta charged for them — and had no idea whether Dvir made any money. Asked
 * "how much did we profit on שחר", the honest answer was that nothing records
 * it. That is a strange thing for a business to be unable to answer, and it
 * gets worse with every client added.
 *
 * Cost is measured, not estimated: Meta's own pricing_analytics gives real
 * spend per day, and each event is charged its share of the days it sent on,
 * in proportion to the messages it actually sent. Vercel is split evenly
 * across the events live in the month.
 *
 * price_charged is the one number a human has to supply. Everything else here
 * comes from what happened. */

const VERCEL_USD_MONTH = 20;
const USD_ILS = 3.7;

export async function GET(_req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = createServerClient();
  const cfgToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waba = process.env.WHATSAPP_WABA_ID;

  const { data: events } = await sb.from("events")
    .select("id, name, couple_names, date, price_charged, paid_at").order("date");
  const live = (events ?? []).filter(e => !String(e.name).includes("בדיקה"));

  /* Real cost per UTC day, straight from Meta. */
  const perDay = new Map<string, { cost: number; volume: number }>();
  if (cfgToken && waba) {
    const start = Math.floor(Date.now() / 1000) - 90 * 86_400;
    const end = Math.floor(Date.now() / 1000);
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${waba}?fields=pricing_analytics.start(${start}).end(${end}).granularity(DAILY)&access_token=${cfgToken}`,
        { signal: AbortSignal.timeout(25_000) },
      );
      const j = await r.json();
      for (const pt of j?.pricing_analytics?.data?.[0]?.data_points ?? []) {
        const day = new Date(pt.start * 1000).toISOString().slice(0, 10);
        perDay.set(day, { cost: pt.cost ?? 0, volume: pt.volume ?? 0 });
      }
    } catch { /* no cost data — reported as null rather than guessed */ }
  }

  /* How many messages each event sent on each day. */
  const { data: msgs } = await sb.from("wa_messages")
    .select("event_id, created_at").eq("direction", "out").limit(9000);
  const byEventDay = new Map<string, Map<string, number>>();
  const dayTotals = new Map<string, number>();
  for (const m of msgs ?? []) {
    if (!m.event_id) continue;
    const day = String(m.created_at).slice(0, 10);
    if (!byEventDay.has(m.event_id)) byEventDay.set(m.event_id, new Map());
    const em = byEventDay.get(m.event_id)!;
    em.set(day, (em.get(day) ?? 0) + 1);
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + 1);
  }

  const monthsLive = new Set(live.map(e => String(e.date).slice(0, 7)));
  const vercelPerEvent = live.length
    ? (VERCEL_USD_MONTH * monthsLive.size) / live.length
    : 0;

  const rows = live.map(e => {
    const days = byEventDay.get(e.id as string) ?? new Map();
    let metaUsd = 0; let sent = 0; let measured = false;
    for (const [day, n] of days) {
      sent += n;
      const d = perDay.get(day);
      const total = dayTotals.get(day) ?? 0;
      if (d && total) { metaUsd += d.cost * (n / total); measured = true; }
    }
    const costIls = (metaUsd + vercelPerEvent) * USD_ILS;
    const charged = e.price_charged == null ? null : Number(e.price_charged);
    /* price_charged is what was AGREED. Whether the money arrived is paid_at,
       and the two were being summed under one heading called "הכנסות" — 894₪
       on a screen where 115₪ had actually been received. */
    const paidAt = (e as { paid_at?: string | null }).paid_at ?? null;
    return {
      id: e.id, name: e.name, couple: e.couple_names, date: e.date,
      sent, charged, paidAt,
      cost: Math.round(costIls),
      costMeasured: measured,
      profit: charged == null ? null : Math.round(charged - costIls),
      margin: charged && charged > 0
        ? Math.round(100 * (charged - costIls) / charged) : null,
    };
  });

  const known = rows.filter(r => r.charged != null);
  return NextResponse.json({
    rows,
    totals: {
      /* Three numbers, because they are three different facts and conflating
         them is how a business believes it has money it has not been paid. */
      agreed: known.reduce((s, r) => s + (r.charged ?? 0), 0),
      collected: known.filter(r => r.paidAt).reduce((s, r) => s + (r.charged ?? 0), 0),
      outstanding: known.filter(r => !r.paidAt).reduce((s, r) => s + (r.charged ?? 0), 0),
      /* Kept so an older client of this route keeps working; it means agreed. */
      revenue: known.reduce((s, r) => s + (r.charged ?? 0), 0),
      cost: rows.reduce((s, r) => s + r.cost, 0),
      profit: known.reduce((s, r) => s + (r.profit ?? 0), 0),
      missingPrice: rows.length - known.length,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { event_id, price } = (await req.json()) as { event_id?: string; price?: number | null };
  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });
  const sb = createServerClient();
  const { error } = await sb.from("events")
    .update({ price_charged: price === null || price === undefined ? null : Number(price) })
    .eq("id", event_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
