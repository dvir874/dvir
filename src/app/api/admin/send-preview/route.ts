import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { coupleName, looksLikeCouple } from "@/lib/couple-name";
import { eventTimes } from "@/lib/event-times";
import { weddingDateLine } from "@/lib/hebrew-date";
import { getWhatsAppConfig } from "@/lib/whatsapp";

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
  const winner = preview.find(p => !p.blockedReason && !p.pausedUntil && p.pending > 0) ?? null;

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

    const { count: fresh } = ev ? await sb.from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id).eq("status", "pending").not("phone", "is", null) : { count: 0 };

    nextRun = {
      event: winner.event,
      approx: Math.max(0, Math.min(fresh ?? 0, cap - used)),
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
      perRun: real.map(r => ({
        at: new Date(r.created_at as string).toLocaleTimeString("he-IL",
              { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" }),
        sent: Number(r.sent) || 0,
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
