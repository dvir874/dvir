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
  let approvedBody: string | null = null;
  const templateName = cfg?.genericTemplateName ?? null;
  const waba = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? process.env.WHATSAPP_WABA_ID;
  if (cfg && waba && templateName) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${waba}/message_templates?name=${templateName}`,
        { headers: { Authorization: `Bearer ${cfg.accessToken}` }, cache: "no-store" },
      );
      const j = await r.json();
      const t = j?.data?.[0];
      if (t?.status === "APPROVED") {
        approvedBody = t.components?.find((c: { type: string }) => c.type === "BODY")?.text ?? null;
      }
    } catch { /* the preview is still useful without it */ }
  }

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

  return NextResponse.json({
    note: "מה שהריצה הבאה תשלח. לא נשלחת אף הודעה ולא נכתב דבר.",
    generatedAt: new Date().toISOString(),
    events: preview,
  });
}
