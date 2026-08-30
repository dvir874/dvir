import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { coupleName } from "@/lib/couple-name";
import { shabbatBlock } from "@/lib/shabbat";
import { dueWithin, MAX_FIRST_CONTACT_ATTEMPTS, type ContactState } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

/* GET /api/admin/morning — the four questions, answered once.
 *
 * Across one week Dvir asked the same handful of things about fifteen times:
 * what went out today, can anything else go out, did anyone new confirm, and
 * who needs me. Each one was answered by running a script against the same
 * three tables. This is that script, with a URL.
 *
 * Auth comes from the middleware on /api/admin/*.
 */

/** vercel.json, in UTC. Israel is +3, so 06:00 here is 09:00 on his phone. */
const CRON_UTC: [number, number][] = [
  [6, 0], [7, 0], [8, 15], [10, 30], [13, 0], [16, 30], [18, 30], [18, 50],
];

const IL_OFFSET_MS = 3 * 3_600_000;
const DAY_MS = 86_400_000;

const ilTime = (ms: number) =>
  new Date(ms + IL_OFFSET_MS).toISOString().slice(11, 16);

/** Israeli midnight, as a UTC instant. */
function ilDayStart(nowMs: number): number {
  const il = new Date(nowMs + IL_OFFSET_MS);
  return Date.UTC(il.getUTCFullYear(), il.getUTCMonth(), il.getUTCDate()) - IL_OFFSET_MS;
}

/** The next scheduled runs from now, as UTC instants. */
function upcomingRuns(nowMs: number, howMany = 6): number[] {
  const out: number[] = [];
  for (let day = 0; day < 3 && out.length < howMany; day++) {
    const base = new Date(nowMs + day * DAY_MS);
    for (const [h, m] of CRON_UTC) {
      const t = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h, m);
      if (t > nowMs) out.push(t);
      if (out.length >= howMany) break;
    }
  }
  return out.sort((a, b) => a - b);
}

/* What kind of message this was, read off the body. The templates carry no
   type of their own, and adding one would mean a migration for a label. */
function kindOf(body: string | null): string {
  const s = body ?? "";
  if (/תודה שהייתם|אלבום|תמונות/.test(s)) return "בקשות תמונות";
  if (/טרמפ/.test(s)) return "קבוצת טרמפים";
  if (/מחר זה קורה/.test(s)) return "יום לפני";
  if (/תזכורת|עוד לא קיבלנו/.test(s)) return "תזכורות";
  if (/מוזמנים|הזמנה|מוזמן/.test(s)) return "הזמנות";
  return "אחר";
}

const PERMANENT = new Set([131026, 131050]);

export async function GET() {
  const sb = createServerClient();
  const now = Date.now();
  const dayStart = ilDayStart(now);
  const today = new Date(now + IL_OFFSET_MS).toISOString().slice(0, 10);

  const [evRes, outRes] = await Promise.all([
    sb.from("events")
      .select("id, name, couple_names, date, rides_group_url")
      .gte("date", today).order("date").limit(8),
    /* Everything sent in the last 24h — enough for both the cap and today's
       tally, and one query rather than two overlapping ones. */
    sb.from("wa_messages")
      .select("guest_id, event_id, body, status, error_code, wa_phone, wamid, created_at")
      .eq("direction", "out").gte("created_at", new Date(now - DAY_MS).toISOString())
      .limit(3000),
  ]);

  const events = evRes.data ?? [];
  const out = outRes.data ?? [];

  /* ── 1. the cap, which gates everything else ───────────────────────── */
  const CAP = Number(process.env.WA_CAP_OVERRIDE) || 250;

  /* Only sends Meta accepted. A rejected send never opened a conversation and
     cannot count against a limit on conversations — counting them would hand
     back part of tomorrow's reach for messages nobody received. */
  const accepted = out.filter(m => m.wamid);
  const firstSeen = new Map<string, number>();
  for (const m of accepted) {
    const p = m.wa_phone as string;
    const t = new Date(m.created_at as string).getTime();
    const prev = firstSeen.get(p);
    if (prev === undefined || t < prev) firstSeen.set(p, t);
  }
  const used = firstSeen.size;

  /* Slots at each upcoming run, because a recipient leaves the window exactly
     24h after they entered it. "Full" is a statement about right now, not
     about the rest of the day, and the difference is the whole question. */
  const stamps = [...firstSeen.values()];
  const runs = upcomingRuns(now).map(at => {
    const stillIn = stamps.filter(t => t > at - DAY_MS).length;
    const shabbat = shabbatBlock(new Date(at));
    return {
      at: new Date(at).toISOString(),
      time: ilTime(at),
      slots: Math.max(0, CAP - stillIn),
      blocked: shabbat.blocked,
      reason: shabbat.reason ?? null,
    };
  });
  const nextOpen = runs.find(r => r.slots > 0 && !r.blocked) ?? null;

  /* ── 2. what went out today ────────────────────────────────────────── */
  const evName = new Map(events.map(e => [e.id as string, coupleName(e) ?? (e.name as string)]));
  const todayOut = out.filter(m => new Date(m.created_at as string).getTime() >= dayStart);
  const tally = new Map<string, Map<string, { count: number; failed: number }>>();
  for (const m of todayOut) {
    const ev = evName.get(m.event_id as string);
    if (!ev) continue;
    const kind = kindOf(m.body as string | null);
    if (!tally.has(ev)) tally.set(ev, new Map());
    const row = tally.get(ev)!;
    const cur = row.get(kind) ?? { count: 0, failed: 0 };
    cur.count++;
    if (m.status === "failed" || m.error_code) cur.failed++;
    row.set(kind, cur);
  }
  const sentToday = [...tally.entries()].map(([wedding, kinds]) => ({
    wedding,
    items: [...kinds.entries()].map(([kind, v]) => ({ kind, ...v }))
      .sort((a, b) => b.count - a.count),
  }));

  /* ── 3. the weddings ───────────────────────────────────────────────── */
  const weddings = [];
  const unreachable: { name: string; phone: string; reason: string; token: string; wedding: string }[] = [];

  for (const ev of events) {
    const { data: gs } = await sb.from("guests")
      .select("id, name, phone, status, guest_count, category, response_time, rsvp_token, do_not_contact")
      .eq("event_id", ev.id).limit(1200);
    const real = (gs ?? []).filter(g => g.category !== "demo");
    if (!real.length) continue;

    const confirmed = real.filter(g => g.status === "confirmed");
    const pending = real.filter(g => g.status === "pending");
    const declined = real.filter(g => g.status === "declined");
    const meals = confirmed.reduce((s, g) => s + (Number(g.guest_count) || 1), 0);
    const confirmedToday = real.filter(g =>
      g.response_time && new Date(g.response_time as string).getTime() >= dayStart
      && g.status === "confirmed").length;

    /* What is due tomorrow — the same reading the sender uses, so this number
       and the number of messages that leave cannot disagree. */
    const ids = new Set(pending.map(g => g.id as string));
    const per = new Map<string, { last: string | null; got: boolean; rem: number }>();
    for (const id of ids) per.set(id, { last: null, got: false, rem: 0 });

    /* One read of this event's outbound history, serving both the "due
       tomorrow" count below and the unreachable list further down. It was two
       near-identical queries — eight per load across four weddings, on a phone,
       over cellular — and the second added only error_code.

       The count matters: a silently truncated page would leave guests with no
       history at all, and a guest with no history reads as due right now. So
       the ceiling is checked rather than assumed.
       Unconditional, and that is the point: gating it on "are there pending
       guests" would have been free in the common case and wrong in the rare
       one, because the unreachable list below reads the same rows for guests
       who are not pending at all. */
    const HISTORY_CAP = 8000;
    const { data: hist, count: histCount } = await sb.from("wa_messages")
      .select("guest_id, body, status, created_at, error_code", { count: "exact" })
      .eq("direction", "out").eq("event_id", ev.id).limit(HISTORY_CAP);
    if ((histCount ?? 0) > HISTORY_CAP) {
      console.warn(`[morning] ${ev.id}: ${histCount} messages exceeds ${HISTORY_CAP} — counts below are partial`);
    }
    for (const m of hist ?? []) {
      const row = per.get(m.guest_id as string);
      if (!row) continue;
      const at = m.created_at as string;
      if (!row.last || at > row.last) row.last = at;
      if (m.status === "delivered" || m.status === "read") row.got = true;
      if (/תזכורת|עוד לא קיבלנו/.test(String(m.body ?? ""))) row.rem++;
    }
    const states: ContactState[] = [...per.values()]
      .map(r => ({ delivered: r.got, lastOutboundAt: r.last, remindersSent: r.rem }));
    const due = dueWithin(states, now + DAY_MS, now);

    const date = String(ev.date);
    weddings.push({
      id: ev.id, name: coupleName(ev) ?? ev.name, date,
      days: Math.round((new Date(date).getTime() - ilDayStart(now)) / DAY_MS),
      confirmed: confirmed.length, pending: pending.length, declined: declined.length,
      meals, confirmedToday,
      dueTomorrow: due.now + due.soon,
      exhausted: due.never,
    });

    /* Guests every attempt failed on, for permanent reasons. Temporary Meta
       throttles are not listed: the system retries those by itself, and a list
       that mixes them is one where the seven that need a phone call are lost
       among eighteen that need nothing. */
    const attempts = new Map<string, { arrived: boolean; accepted: number; codes: Set<number> }>();
    for (const m of hist ?? []) {
      const id = m.guest_id as string;
      if (!id) continue;
      if (!attempts.has(id)) attempts.set(id, { arrived: false, accepted: 0, codes: new Set() });
      const a = attempts.get(id)!;
      if (m.status === "delivered" || m.status === "read") a.arrived = true;
      if (!m.error_code && m.status !== "failed") a.accepted++;
      if (m.error_code) a.codes.add(Number(m.error_code));
    }
    for (const g of real) {
      const a = attempts.get(g.id as string);
      if (!a || a.arrived || g.do_not_contact) continue;

      const permanent = [...a.codes].some(c => PERMANENT.has(c));
      /* The sender has stopped on its own. eligibility.ts caps first contacts
         at four accepted sends, and a guest who hits that ceiling would
         otherwise vanish: no more messages, and no row anywhere saying why.
         Silencing someone without saying so is worse than the duplicate
         messages the ceiling exists to prevent. */
      const ceilinged = a.accepted >= MAX_FIRST_CONTACT_ATTEMPTS;
      if (!permanent && !ceilinged) continue;

      unreachable.push({
        name: String(g.name), phone: String(g.phone ?? ""),
        reason: a.codes.has(131050) ? "ביקש לא לקבל"
              : permanent ? "אין וואטסאפ"
              : `${a.accepted} הודעות נשלחו, אף אחת לא נמסרה`,
        token: String(g.rsvp_token ?? ""),
        wedding: coupleName(ev) ?? String(ev.name),
      });
    }
  }

  /* ── 4. guest messages nobody answered ─────────────────────────────── */
  const { data: inbound } = await sb.from("wa_messages")
    .select("guest_id, body, created_at").eq("direction", "in")
    .gte("created_at", new Date(now - 3 * DAY_MS).toISOString())
    .order("created_at", { ascending: false }).limit(200);
  /* A question is free text that is not an RSVP answer. Bare numbers, button
     titles and blessings are the conversation working, not a person waiting. */
  const isAnswer = (s: string) =>
    /^\d{1,2}$/.test(s.trim())
    || /^(מגיע|לא מגיע|כן, לא נוכל|רגע, טעיתי|כן|לא|מאשר\w*)[.!]?$/.test(s.trim())
    || /^\[(reaction|sticker|image|audio|video|document)\]/.test(s.trim())
    || /^(מזל טוב|תודה|בשעה טובה|אמן)/.test(s.trim());
  const waiting = (inbound ?? []).filter(m => {
    const s = String(m.body ?? "").trim();
    return s.length > 2 && !isAnswer(s);
  });

  return NextResponse.json({
    now: new Date(now).toISOString(),
    cap: { used, cap: CAP, blocked: used >= CAP, nextOpen, runs: runs.slice(0, 4) },
    sentToday: { groups: sentToday, total: todayOut.length },
    weddings,
    needsYou: {
      unreachable,
      questions: waiting.slice(0, 8).map(m => ({
        guestId: m.guest_id, text: String(m.body ?? "").slice(0, 120),
        at: m.created_at,
      })),
    },
  });
}
