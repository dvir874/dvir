import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { coupleName, looksLikeCouple } from "@/lib/couple-name";
import { isEligibleNow } from "@/lib/eligibility";
import { eventTimes } from "@/lib/event-times";
import { weddingDateLine } from "@/lib/hebrew-date";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { venueLine } from "@/lib/venue";

export const dynamic = "force-dynamic";

/* What the next run would send, without sending it.
 *
 * Dvir never sees the message his clients' guests receive. He sees whether they
 * confirmed, which is the outcome and not the artifact — a message can be
 * entirely wrong and still produce confirmations, because guests who know the
 * couple will answer anyway. On 15/08 the sender was one deploy away from
 * inviting שחר's 327 guests to somebody else's wedding, over her photograph,
 * and the only reason it did not happen is that the template selection was read
 * by hand that afternoon. Nothing on any screen would have shown it.
 *
 * So this renders the four template variables from the SAME functions the cron
 * calls — coupleName, eventTimes, weddingDateLine — rather than describing what
 * they are meant to produce. A preview written independently of the sender is a
 * second implementation that agrees with the first until the day it matters.
 *
 * It sends nothing, writes nothing and touches no guest. Read it before a first
 * send to a new client, and after any change to a couple's details.
 */

const FALLBACK_BODY = `💍 משפחה וחברים יקרים!

בעזרת ה׳ *{{1}}* מתחתנים! 🤍
והם שמחים להזמין אתכם לחגוג איתם:

🗓 {{2}}
📍 {{3}}
🥂 {{4}}

לצפייה בהזמנה המלאה ואישור הגעה — לחצו על הכפתור למטה 👇

מחכים לחגוג איתכם! 🤍`;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = createServerClient();
  const cfg = getWhatsAppConfig();
  const today = new Date().toISOString().slice(0, 10);
  const nowMs = Date.now();

  const { data: events } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, wa_header_image_url, send_paused_until, reception_time, chuppah_time")
    .gte("date", today).order("date");

  /* Meta's own copy of the approved template, so the preview shows the text
     that will actually be delivered rather than the text we believe is
     approved. Those two have already disagreed once: v3 was approved half an
     hour after 30 invitations went out under v2. */
  const waba = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? process.env.WHATSAPP_WABA_ID;

  /* Both templates, checked against what the code actually sends.
   *
   * This fetched the invitation only, and on 17/08 the bug was in the other
   * one: reminderTemplateName still pointed at wedding_reminder_buttons_v1,
   * which has zero variables and Dvir's own wedding written into its text. The
   * send passes four, so fifty-three of his reminders died on #132000 — seven
   * days before his wedding — and the screen built to show what will be sent
   * had nothing to say about it, because it only ever looked at invitations.
   *
   * Counting {{n}} in the approved body and comparing it to the four variables
   * we send turns that class of failure into a red line on a screen instead of
   * fifty-three silent failures found by reading the database the next day. */
  async function template(name: string | null) {
    if (!cfg || !waba || !name) return null;
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${waba}/message_templates?name=${name}`,
        { headers: { Authorization: `Bearer ${cfg.accessToken}` }, cache: "no-store" },
      );
      const t = (await r.json())?.data?.[0];
      if (!t) return { name, status: "לא נמצאה ב-Meta", body: null, vars: null, ok: false };
      const body: string | null =
        t.components?.find((c: { type: string }) => c.type === "BODY")?.text ?? null;
      const vars = body ? new Set([...body.matchAll(/\{\{(\d+)\}\}/g)].map(m => m[1])).size : 0;
      return {
        name, status: t.status, body: t.status === "APPROVED" ? body : null, vars,
        /* The send always passes four body variables. Anything else is #132000. */
        ok: t.status === "APPROVED" && vars === 4,
      };
    } catch { return null; }
  }

  /* Meta's own numbers, so nobody has to remember to check them.
   *
   * The account is at TIER_250 and WA_CAP_OVERRIDE is 250 — identical, so the
   * override costs nothing today. The moment Meta grants TIER_1000 those two
   * stop being the same number and our own setting silently becomes the
   * ceiling: the upgrade arrives and nothing changes, because a value that was
   * a brake at 150 became a cap at 250 without anyone noticing.
   *
   * Dvir asked how he would know. The answer cannot be "I check every morning"
   * — that is the shape of every other thing that went wrong this week. */
  let health: { tier: string; quality: string; capped: boolean } | null = null;
  if (cfg && waba) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${waba}/phone_numbers?fields=quality_rating,messaging_limit_tier`,
        { headers: { Authorization: `Bearer ${cfg.accessToken}` }, cache: "no-store" },
      );
      const d = (await r.json())?.data?.[0];
      if (d) {
        const tier = String(d.messaging_limit_tier ?? "");
        const metaCap = Number(tier.replace(/\D/g, "")) || 0;
        const ours = Number(process.env.WA_CAP_OVERRIDE) || 0;
        health = {
          tier, quality: String(d.quality_rating ?? ""),
          /* Meta allows more than we do — the override is now the limit. */
          capped: metaCap > 0 && ours > 0 && ours < metaCap,
        };
      }
    } catch { /* the rest of the screen still works */ }
  }

  const invite   = await template(cfg?.genericTemplateName ?? null);
  const reminder = await template(cfg?.reminderTemplateName ?? null);
  /* The other two the sender can reach. Not shown as cards — they are only
     needed to render what a run ACTUALLY sent, below. */
  const dayBefore = await template(cfg?.dayBeforeTemplateName ?? null);
  const photos    = await template(cfg?.photosUploadTemplateName ?? null);
  const approvedBody = invite?.body ?? null;
  const templateName = cfg?.genericTemplateName ?? null;

  const preview = [];
  for (const ev of events ?? []) {
    const paused = ev.send_paused_until
      && new Date(ev.send_paused_until as string).getTime() > nowMs;

    /* Identical to the cron's checks, in the same order, so an event that
       previews as ready is an event that sends. */
    const couple = coupleName(ev);
    const times  = eventTimes(ev);
    const vName  = (ev.venue_name as string | null)?.trim() || "";
    const vAddr  = (ev.address as string | null)?.trim() || "";
    const venue  =
      vAddr && vName && !vAddr.includes(vName) ? `${vName}, ${vAddr}`
      : vAddr || vName || null;
    const when   = ev.date ? weddingDateLine(ev.date as string) : null;

    const blocked =
      !ev.wa_header_image_url    ? "אין תמונת הזמנה"
      : !couple                  ? "אין שמות בני זוג (couple_names)"
      : !looksLikeCouple(couple) ? `"${couple}" לא נראה כמו שמות בני זוג`
      : !when                    ? "אין תאריך"
      : !venue                   ? "אין מקום"
      : !times                   ? "אין שעות קבלת פנים/חופה"
      : null;

    /* A real guest of this event, so the button URL shown is a URL that exists
       rather than a placeholder that always looks right. */
    const { data: sample } = await sb.from("guests")
      .select("name, rsvp_token").eq("event_id", ev.id)
      .not("rsvp_token", "is", null).neq("category", "demo").limit(1);
    const g = (sample ?? [])[0];

    const { count: pending } = await sb.from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id).eq("status", "pending");

    const rendered = blocked ? null
      : (approvedBody ?? FALLBACK_BODY)
          .replace("{{1}}", couple!).replace("{{2}}", when!)
          .replace("{{3}}", venue!).replace("{{4}}", times!);

    preview.push({
      event: ev.name,
      date: ev.date,
      status: blocked ? "❌ לא יישלח" : paused ? "⏸ מושהה" : "✅ יישלח",
      blockedReason: blocked,
      pausedUntil: paused ? ev.send_paused_until : null,
      pending: pending ?? 0,
      template: templateName,
      templateSource: approvedBody ? "הטקסט המאושר אצל Meta" : "עותק מקומי — לא אומת מול Meta",
      headerImage: ev.wa_header_image_url,
      variables: blocked ? null : { couple, date: when, venue, times },
      button: g?.rsvp_token
        ? { text: "אישור הגעה", url: `https://regalifnei.vercel.app/rsvp/${g.rsvp_token}`, sampleGuest: g.name }
        : null,
      message: rendered,
    });
  }

  /* Which wedding actually wins the next run, and roughly how many go out.
   *
   * The cards below say whether each event COULD send. They do not say which
   * one WILL, and those are different questions: the cron serves one event per
   * run — the nearest wedding that still has pending guests — so an event that
   * previews as ✅ may sit untouched for days behind a closer one.
   *
   * I told Dvir twice that a run would go to תהל ואביב after pausing his own
   * wedding, and twice it went to שחר instead: she sits between them by date
   * with 226 pending, and I checked one blocker and stopped. This line exists so
   * that question is answered by the system rather than by me.
   *
   * The count is deliberately approximate. The real budget is min(remaining,
   * timeCap) evaluated at run time against a rolling window that keeps moving,
   * and a single number stated confidently is how the last two mistakes were
   * made. */
  /* The same question the cron asks, not a near-miss of it.
   *
   * This picked the first event with pending > 0. The cron stopped doing that
   * yesterday: a wedding whose guests were all messaged today still shows a
   * full pending list but has nobody it may contact, so it is skipped. On
   * 18/08 the screen announced "הריצה הבאה: מירב ודביר · ~44" while his 44
   * pending had 3 eligible and the run was going to תהל ואביב.
   *
   * A preview that computes the answer differently from the sender is a second
   * implementation that agrees until the day it matters — which is the same
   * mistake as the address, the couple names and the reminder template. */

  async function eligible(eventId: string): Promise<number> {
    const { data: pend } = await sb.from("guests")
      .select("id").eq("event_id", eventId).eq("status", "pending")
      .not("phone", "is", null).neq("category", "demo").limit(900);
    const ids = (pend ?? []).map(r => r.id as string);
    if (!ids.length) return 0;
    /* Two floors, exactly as the cron applies them: 24h before a first contact,
       72h before a reminder. A single 24h test here would report guests the
       sender will refuse — which is how the 19:31 and 21:30 runs on 18/08 both
       chose an event with nobody to message. */
    const last = new Map<string, string>();
    const arrived = new Set<string>();
    for (let i = 0; i < ids.length; i += 150) {
      const { data } = await sb.from("wa_messages")
        .select("guest_id, status, created_at").eq("direction", "out")
        .in("guest_id", ids.slice(i, i + 150));
      for (const m of data ?? []) {
        const id = m.guest_id as string;
        if (!id) continue;
        if (["delivered", "read"].includes(m.status as string)) arrived.add(id);
        const at = m.created_at as string;
        if (!last.has(id) || at > last.get(id)!) last.set(id, at);
      }
    }
    /* The sender's own rule, imported — not restated. */
    return ids.filter(id => isEligibleNow({
      delivered: arrived.has(id), lastOutboundAt: last.get(id) ?? null,
    })).length;
  }

  let winner: typeof preview[number] | null = null;
  let winnerFree = 0;
  for (const p of preview) {
    if (p.blockedReason || p.pausedUntil || p.pending === 0) continue;
    const ev = (events ?? []).find(e => e.name === p.event);
    const free = ev ? await eligible(ev.id as string) : 0;
    if (free > 0) { winner = p; winnerFree = free; break; }
  }

  let nextRun: { event: string; approx: number; why: string } | null = null;
  if (winner) {
    const ev = (events ?? []).find(e => e.name === winner.event);
    const since = new Date(Date.now() - 24 * 3_600_000).toISOString();

    /* Unique recipients in the rolling window — the same thing Meta counts, and
       the reason a day with many failures leaves little room: an attempt counts
       whether or not it arrived. */
    const { data: recent } = await sb.from("wa_messages")
      .select("wa_phone").eq("direction", "out").gte("created_at", since).limit(3000);
    const used = new Set((recent ?? []).map(r => r.wa_phone).filter(Boolean)).size;

    const { data: lastRun } = await sb.from("wa_runs")
      .select("cap").not("cap", "is", null).order("created_at", { ascending: false }).limit(1);
    const cap = Number(lastRun?.[0]?.cap ?? 0);

    nextRun = {
      event: winner.event,
      /* Eligible now, not merely pending — the cooldown decides both. */
      approx: Math.max(0, Math.min(winnerFree, cap - used)),
      why: `מכסה ${cap} · נוצלו ${used} ב-24 השעות האחרונות (כולל הודעות שנכשלו)`,
    };
  }

  /* The day in one line: how many runs have already fired, how many are still
     to come, and how many messages went out. "כמה שליחות ביום וכמה הודעות" was
     a question that could only be answered by reading wa_runs by hand. */
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const { data: todayRuns } = await sb.from("wa_runs")
    .select("created_at, sent, reason").gte("created_at", dayStart.toISOString())
    .order("created_at");
  const real = (todayRuns ?? []).filter(r => r.reason !== "run_started");
  const sentToday = real.reduce((n, r) => n + (Number(r.sent) || 0), 0);

  /* What each run ACTUALLY sent — not what the next one would.
   *
   * Everything above this line is a forecast: the cards render the template the
   * NEXT run will use, with today's values. That is the right thing for the
   * question "is the message correct before I send it", and it answers nothing
   * about the question Dvir actually asked at 21:50 — "which message just went
   * out?" The screen showed the invitation preview all evening while every
   * message leaving the system was the day-before template, and there was no
   * way to tell them apart.
   *
   * The two are different questions and a forecast can never answer the second,
   * because the template can change between runs — it did today, when
   * WHATSAPP_TEMPLATE_REMINDER moved to the UTILITY template mid-afternoon and
   * the card kept showing the same thing before and after.
   *
   * There is no per-message template column, and adding one would only start
   * recording from today. wa_messages.body already carries a Hebrew label the
   * sender writes at send time, so the mapping is read from what actually
   * happened rather than reconstructed from configuration.
   *
   * A run writes its row when it FINISHES, not when it starts — record() is the
   * last thing it does. So a run's messages are the ones that precede its row
   * and follow the previous run's row, and the obvious reading (everything
   * after the run started) attributes every message to the wrong run and shows
   * an empty list for the one that just sent. Found by running it. */
  const KIND = (body: string): { tpl: typeof invite; label: string; kind: string } | null => {
    const b = body ?? "";
    if (b.includes("מחר מתחתנים"))  return { tpl: dayBefore, label: "מחר מתחתנים",        kind: "day_before" };
    if (b.includes("גלריי"))         return { tpl: photos,    label: "תמונות מהחתונה",     kind: "photos" };
    if (b.includes("תזכורת"))        return { tpl: reminder,  label: "תזכורת אישור הגעה",  kind: "reminder" };
    if (b.includes("הזמנה"))         return { tpl: invite,    label: "הזמנה לחתונה",       kind: "invitation" };
    return null;                    /* a free-text reply Dvir typed — not a template */
  };

  const { data: todayMsgs } = await sb.from("wa_messages")
    .select("created_at, body, event_id").eq("direction", "out")
    .gte("created_at", dayStart.toISOString()).order("created_at").limit(3000);

  /* Rendered with the SAME helpers the sender calls, and with each template's
     own variable order — the day-before passes reception and חופה separately,
     the others pass one combined times line. Getting this wrong would show a
     message nobody received, which is worse than showing nothing. */
  function renderFor(kind: string, eventId: string | null, body: string | null): string | null {
    if (!body) return null;
    const ev = (events ?? []).find(e => e.id === eventId);
    if (!ev) return body;
    const couple = coupleName(ev);
    const venue  = venueLine(ev);
    if (!couple || !venue) return body;
    if (kind === "day_before") {
      const rec = (ev.reception_time as string | null)?.trim();
      const chu = (ev.chuppah_time as string | null)?.trim();
      if (!rec || !chu) return body;
      return body.replace("{{1}}", couple).replace("{{2}}", rec)
                 .replace("{{3}}", chu).replace("{{4}}", venue);
    }
    if (kind === "photos") return body.replace("{{1}}", couple);
    const when  = ev.date ? weddingDateLine(ev.date as string) : null;
    const times = eventTimes(ev);
    if (!when || !times) return body;
    return body.replace("{{1}}", couple).replace("{{2}}", when)
               .replace("{{3}}", venue).replace("{{4}}", times);
  }

  const evName = (id: string | null) =>
    (events ?? []).find(e => e.id === id)?.name as string | undefined;

  function sentIn(prevEnd: string | null, thisEnd: string) {
    const rows = (todayMsgs ?? []).filter(m => {
      const t = m.created_at as string;
      return t <= thisEnd && (!prevEnd || t > prevEnd);
    });
    const groups = new Map<string, { label: string; kind: string; count: number;
                                     template: string | null; status: string | null;
                                     category: string | null; event?: string; rendered: string | null }>();
    for (const m of rows) {
      const k = KIND(String(m.body ?? ""));
      const key = `${k?.kind ?? "free"}|${m.event_id ?? ""}`;
      const g = groups.get(key);
      if (g) { g.count++; continue; }
      groups.set(key, {
        label: k?.label ?? "הודעה חופשית שנכתבה ידנית",
        kind: k?.kind ?? "free",
        count: 1,
        template: k?.tpl?.name ?? null,
        status: k?.tpl?.status ?? null,
        category: k ? (k.kind === "day_before" || k.kind === "photos" ? "UTILITY" : null) : null,
        event: evName(m.event_id as string | null),
        rendered: k ? renderFor(k.kind, m.event_id as string | null, k.tpl?.body ?? null) : null,
      });
    }
    return [...groups.values()].sort((a, b) => b.count - a.count);
  }

  /* Counted from wa_messages, because the run's own number is not the total.
   *
   * record() writes `sent: sent.length` — the group sends for the event it
   * chose — and "מחר מתחתנים" is counted in a separate field that never reaches
   * it. Today's run at 21:52 reports 50 and actually sent 158, so the headline
   * on this screen has been understating every day that had a day-before send.
   *
   * The messages table is what left the system, so it wins. The run's own
   * figure is still shown when the two disagree, because the gap is the bug and
   * hiding it would be the same mistake one level up. */
  const countedIn = (prevEnd: string | null, thisEnd: string) =>
    (todayMsgs ?? []).filter(m => {
      const t = m.created_at as string;
      return t <= thisEnd && (!prevEnd || t > prevEnd);
    }).length;

  /* vercel.json — 09:00, 11:15, 13:30, 16:00, 19:30, 21:30 Israel time. */
  const SCHEDULE = [9 * 60, 11 * 60 + 15, 13 * 60 + 30, 16 * 60, 19 * 60 + 30, 21 * 60 + 30];
  const nowIl = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Jerusalem", hour12: false });
  const nowMin = Number(nowIl.slice(0, 2)) * 60 + Number(nowIl.slice(3, 5));
  const upcoming = SCHEDULE.filter(m => m > nowMin)
    .map(m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);

  return NextResponse.json({
    today: {
      runsDone: real.length,
      runsLeft: upcoming.length,
      upcoming,
      sent: sentToday,
      perRun: real.map((r, i) => ({
        at: new Date(r.created_at as string).toLocaleTimeString("he-IL",
              { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" }),
        sent: Number(r.sent) || 0,
        reason: r.reason ?? null,
        /* Only for runs that sent something — an empty run has nothing to show
           and a row of "0" for every quiet run would bury the ones that matter. */
        counted: countedIn((real[i - 1]?.created_at as string | undefined) ?? null,
                           r.created_at as string),
        messages: (Number(r.sent) || 0) > 0
          ? sentIn((real[i - 1]?.created_at as string | undefined) ?? null,
                   r.created_at as string)
          : [],
      })),
    },
    health,
    templates: { invite, reminder },
    nextRun,
    note: "מה שהריצה הבאה תשלח. לא נשלחת אף הודעה ולא נכתב דבר.",
    generatedAt: new Date().toISOString(),
    events: preview,
  });
}
