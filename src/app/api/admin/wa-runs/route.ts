import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  policyFor, getWhatsAppConfig, fetchAccountHealth, warmupCap, recentPeakRecipients,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/* GET /api/admin/wa-runs?event_id=X&limit=20
   "Did the 15:00 run actually send anything, and to whom?"

   Until now that question had no answer inside the product. The sender
   reported everything — names sent, names failed with reasons, Meta's cap and
   quality rating, how much of the rolling window was left — into an HTTP
   response that went to Vercel's logs and aged out. Answering it meant querying
   the database by hand, every time.

   Two things are returned, because two different questions get asked:

   `runs`   what each scheduled run did. Includes the ones that sent nothing:
            a run that stopped on window_full is not the same as a run that did
            not happen, and only this table can tell them apart.

   `next`   what the next run is going to face — how much of the daily cap is
            left, and how many guests are still waiting in each group. This is
            the number that answers "why did it only send 24?" without anyone
            having to reconstruct it.

   A GAP between runs is the one failure the sender itself can never report:
   a scheduler that does not fire writes nothing anywhere. `expectedRuns` makes
   that visible instead of leaving it to be noticed. */

/* Kept in step with vercel.json. Hardcoding "10:00" in the screen's empty
   state meant the one place that tells an operator when to expect the next run
   went stale the moment the schedule moved — and it moved the same afternoon
   it was written. */
/* Mirrors vercel.json. The file above it warns that this "went stale the moment
   the schedule moved" — and it went stale again the same way on 13/08, when the
   crons were shifted to 08:15 and 16:30 UTC to clear the rolling window and this
   constant was left at [7, 16]. It is only used for expectedRuns and the
   schedule display, so being wrong here does not stop a send; it stops us
   noticing a send that never happened. */
/* The two DAILY runs — vercel.json, 11:15 and 19:30 Israel.
 *
 * There is a third cron, "15 18 * * 6", which fires only on מוצ״ש. It is left
 * out on purpose: this list drives expectedRuns, and counting a weekly run as
 * a daily one would report six missing runs every week. Undercounting costs a
 * real missed run going unnoticed on a Saturday night; overcounting cries wolf
 * six days out of seven, and an alarm nobody believes is worse than no alarm. */
const SCHEDULED_HOURS_UTC = [8, 16];

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 100);
  const eventId = req.nextUrl.searchParams.get("event_id");

  const { data: runs, error } = await sb
    .from("wa_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  /* The table is new. Before its migration is applied every screen reading
     this must still render, showing "no runs recorded yet" rather than an
     error — a missing table is a missing feature, never a broken admin. */
  if (error) {
    return NextResponse.json({
      runs: [], next: null, available: false,
      note: "טבלת ההרצות עוד לא נוצרה — הריצו את המיגרציה",
    });
  }

  /* How many scheduled runs should have happened since the first row we have.
     Compared against the rows actually present, this is what turns "the
     scheduler stopped firing" from something nobody notices into a number. */
  let expectedRuns: number | null = null;
  if (runs?.length) {
    const first = new Date(runs[runs.length - 1].created_at as string);
    const hours = (Date.now() - first.getTime()) / 3_600_000;
    expectedRuns = Math.max(1, Math.round((hours / 24) * SCHEDULED_HOURS_UTC.length));
  }

  /* What the next run will be looking at. Deliberately computed the same way
     the sender computes it, so this screen can never disagree with what
     actually happens — five screens giving five answers to "who has been
     reached" is a failure this product has already had. */
  let next: Record<string, unknown> | null = null;
  const today = new Date().toISOString().slice(0, 10);
  const { data: evs } = await sb.from("events")
    .select("id, name, date").gte("date", today).order("date").limit(1);
  const ev = eventId
    ? { id: eventId, name: null }
    : (evs ?? [])[0];

  if (ev) {
    const { data: pending } = await sb.from("guests")
      .select("id, phone, rsvp_token, category, opened_at")
      .eq("event_id", ev.id).eq("status", "pending");

    const ids = (pending ?? [])
      .filter(g => g.category !== "demo" && g.phone && g.rsvp_token)
      .map(g => g.id as string);

    const contacted = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const slice = ids.slice(i, i + 100);
      const { data: m } = await sb.from("wa_messages")
        .select("guest_id, status").eq("direction", "out").in("guest_id", slice);
      (m ?? []).forEach(x => {
        if (["delivered", "read"].includes(x.status) && x.guest_id) contacted.add(x.guest_id);
      });
      const { data: man } = await sb.from("guest_events")
        .select("guest_id").eq("event_type", "manual_sent").in("guest_id", slice);
      (man ?? []).forEach(x => x.guest_id && contacted.add(x.guest_id));
    }

    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { data: win } = await sb.from("wa_messages")
      .select("wa_phone").eq("direction", "out").gte("created_at", since);
    const windowUsed = new Set((win ?? []).map(r => r.wa_phone).filter(Boolean)).size;

    /* The cap, from Meta rather than from history.
       Reading it off the last recorded run left the screen showing "—" until a
       run had happened, which is exactly when an operator most wants to know
       what the ceiling is — the first thing they ask on opening this page is
       "how much can go out today", and "we will tell you after we have already
       sent" is not an answer. Falls back to the last run, then to nothing. */
    let cap: number | null = null;
    const cfg = getWhatsAppConfig();
    if (cfg) {
      try {
        const [health, peak] = await Promise.all([
          fetchAccountHealth(cfg), recentPeakRecipients(sb),
        ]);
        cap = warmupCap(health, peak);
      } catch { /* Meta unreachable — fall through to history */ }
    }
    if (cap === null) cap = ((runs ?? []).find(r => r.cap)?.cap as number) ?? null;

    next = {
      event: ev.name,
      firstContact: ids.filter(id => !contacted.has(id)).length,
      reminders: ids.filter(id => contacted.has(id)).length,
      windowUsed,
      cap,
      remaining: cap === null ? null : Math.max(0, cap - windowUsed),
    };
  }

  /* Guests the automation has permanently given up on, by name.

     The sender already skips them, and a count of them appears in each run —
     but a number nobody can act on is how 47 guests stayed invisible for two
     days. These are the people whose most recent attempt failed with a policy
     of "never": no timer, no retry and no verification will reach them, and
     the only remaining move is a human with a phone. */
  const needsHuman: { id: string; name: string; phone: string | null; why: string }[] = [];
  if (ev) {
    const { data: guests } = await sb.from("guests")
      .select("id, name, phone, status").eq("event_id", ev.id).eq("status", "pending");
    const byId = new Map((guests ?? []).map(g => [g.id as string, g]));

    const ids = [...byId.keys()];
    const latest = new Map<string,
      { at: string; status: string; code: number | null; err: string | null }>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data: m } = await sb.from("wa_messages")
        .select("guest_id, status, error_code, error, created_at")
        .eq("direction", "out").in("guest_id", ids.slice(i, i + 100));
      for (const x of m ?? []) {
        if (!x.guest_id) continue;
        const prev = latest.get(x.guest_id);
        if (!prev || x.created_at > prev.at) {
          latest.set(x.guest_id, {
            at: x.created_at, status: x.status, code: x.error_code, err: x.error,
          });
        }
      }
    }
    for (const [id, m] of latest) {
      if (m.status !== "failed") continue;
      const pol = policyFor(m.code, m.err);
      if (pol.action !== "never") continue;
      const g = byId.get(id);
      if (g) needsHuman.push({ id, name: g.name as string, phone: g.phone as string | null, why: pol.human });
    }
  }

  /* Messages Meta accepted and then never reported on again.

     A delivery report arrives within minutes or it does not arrive at all.
     Anything still sitting at "accepted" an hour later means the webhook lost
     it — and sixteen of those went unnoticed for two days, surfacing only
     because someone asked about one guest by name.

     A number nobody has to notice by accident. If this is not zero an hour
     after a run, the delivery pipeline is dropping reports again. */
  const staleCutoff = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count: stuck } = await sb.from("wa_messages")
    .select("id", { count: "exact", head: true })
    .eq("direction", "out").in("status", ["accepted", "sent"])
    .lt("created_at", staleCutoff);

  /* Guests who tapped a button and then went quiet mid-exchange.
     "מגיע" is now recorded on the tap itself, so the only state that can sit
     here is a guest who tapped "לא מגיע" and never answered "רק לוודא" — which
     is deliberately not recorded, because a mistaken tap would remove somebody
     from a wedding they meant to attend. That safety costs visibility, so the
     ones waiting are listed rather than left silent. Anything older than two
     hours wants a human, not another message. */
  const midChatCutoff = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
  const { data: midChat } = await sb.from("guests")
    .select("id, name, phone, chat_state")
    .not("chat_state", "is", null)
    .lt("chat_state_at", midChatCutoff);

  for (const g of midChat ?? []) {
    needsHuman.push({
      id: g.id as string,
      name: g.name as string,
      phone: g.phone as string | null,
      why: g.chat_state === "awaiting_decline_confirm"
        ? "לחץ ׳לא מגיע׳ ולא אישר — לא נרשם כלום"
        : "התחיל לענות ולא סיים",
    });
  }

  /* A guest who wrote to us and is still waiting.
     נוי told us her link hung, was asked in plain words how many were coming,
     answered "תודה רבה\n1" — and was sent a reminder to confirm three hours
     later. The bare number is understood now, but anything the handler cannot
     read still lands in the inbox and nowhere else. If someone took the trouble
     to reply and is still pending, that is a person waiting for a person. */
  const { data: wrote } = await sb.from("wa_messages")
    .select("guest_id, body, created_at")
    .eq("direction", "in").not("guest_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(300);

  const wroteIds = [...new Set((wrote ?? []).map(m => m.guest_id as string))];
  const stillPending = new Map<string, { name: string; phone: string | null }>();
  for (let i = 0; i < wroteIds.length; i += 100) {
    const { data } = await sb.from("guests")
      .select("id, name, phone")
      .in("id", wroteIds.slice(i, i + 100))
      .eq("status", "pending");
    for (const g of data ?? []) {
      stillPending.set(g.id as string, { name: g.name as string, phone: g.phone as string | null });
    }
  }

  const seenGuest = new Set(needsHuman.map(h => h.id));
  for (const msg of wrote ?? []) {
    const id = msg.guest_id as string;
    if (seenGuest.has(id)) continue;
    const g = stillPending.get(id);
    if (!g) continue;
    seenGuest.add(id);
    needsHuman.push({
      id, name: g.name, phone: g.phone,
      why: `הגיב/ה ולא נרשם: "${String(msg.body ?? "").slice(0, 40)}"`,
    });
  }

  return NextResponse.json({
    runs: runs ?? [], next, expectedRuns, needsHuman, available: true,
    stuck: stuck ?? 0,
    /* Israel local, for the screen to render without knowing about UTC */
    schedule: SCHEDULED_HOURS_UTC.map(h => (h + 3) % 24),
  });
}
