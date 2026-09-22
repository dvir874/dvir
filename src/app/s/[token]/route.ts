import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { whatsappInviteLink, whatsappReminderLink, whatsappCountLink, whatsappDayOfLink } from "@/lib/phone";
import { venueLine } from "@/lib/venue";
import { APP_URL } from "@/lib/app-url";

export const dynamic = "force-dynamic";

/* One tap, from an alert, to a WhatsApp draft addressed to that guest.
 *
 * Dvir gets his alerts on a phone and asked for what the admin screen already
 * gives him: a link that opens WhatsApp with the guest's own invitation
 * already written. The obvious way — putting the wa.me URL in the alert — does
 * not fit: the invitation text encodes to roughly seven hundred characters and
 * a Meta template parameter cannot carry several of those.
 *
 * So the alert carries this instead, about forty characters, and the redirect
 * builds the real link at the moment he taps it. It also means the message
 * text can be improved later without every alert already sent going stale.
 *
 * The token is the guest's own rsvp_token, which already appears in the link
 * they were sent, so this exposes nothing that was not already addressed to
 * them. What it produces is a draft in the SENDER's WhatsApp — nothing leaves
 * without a person pressing send.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await ctx.params;
  const base = APP_URL;

  const clean = String(token ?? "").replace(/[^A-Za-z0-9-]/g, "");
  if (!clean) return NextResponse.redirect(base, 302);

  const sb = createServerClient();
  const { data: g } = await sb.from("guests")
    .select("name, phone, rsvp_token, status, event_id, chat_state")
    .eq("rsvp_token", clean).maybeSingle();

  /* A dead token opens WhatsApp with nothing rather than an error page — he is
     walking between meetings and a 404 helps nobody. */
  if (!g?.phone) return NextResponse.redirect("https://wa.me/", 302);

  const { data: ev } = await sb.from("events")
    .select("name, couple_names, date, venue_name, address, reception_time, chuppah_time")
    .eq("id", g.event_id as string).maybeSingle();
  const who = String(ev?.couple_names ?? ev?.name ?? "");

  /* On the day itself, every other wording is wrong.
   *
   * This route only ever produced an invitation, a reminder or a headcount
   * question — all three written for a guest who has days left to answer. On
   * 22/09 Dvir tapped it for two guests who had hours, and what he needed to
   * send was when to arrive and where. "אתם מוזמנים" on the morning of the
   * חופה is worse than no message.
   *
   * Decided by the event date rather than by which alert linked here, so it is
   * right no matter where the tap came from. In Israel, because a wedding is a
   * date in Israel and UTC is a different day for three hours every night —
   * the same reason israelToday exists in the cron. */
  const todayIL = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  const isToday = String(ev?.date ?? "") === todayIL;

  /* A guest who already answered gets the reminder wording rather than a fresh
     invitation; sending "אתם מוזמנים" to somebody who confirmed last week
     reads as a system that lost them. */
  const answered = g.status && g.status !== "pending";
  let link: string;
  if (isToday) {
    /* No table number here, unlike the cron's own day-of message: that line
       comes from guestLineFactory, which lives inside the cron route and would
       have to be lifted out to be reused. The two guests this was built for
       needed the hour and the address; a table number is one more line in a
       chat that is now open. Worth lifting when the first seated guest needs
       it. */
    link = whatsappDayOfLink(
      String(g.phone), String(g.name ?? ""), who,
      (ev?.reception_time as string | null) ?? null,
      (ev?.chuppah_time as string | null) ?? null,
      venueLine(ev as Parameters<typeof venueLine>[0]) || null,
      null,
      `${base}/nav/${g.event_id}`);
  } else if (answered) {

    /* Confirmed, and stuck on "how many".
     *
     * They tapped "מגיע/ה", were asked the headcount, and stopped — eleven of
     * them across the live weddings, the oldest since 20/08. Sending them the
     * reminder text, which opens "עוד לא קיבלנו את אישור ההגעה שלכם", tells
     * somebody who confirmed three weeks ago that we never heard from them.
     * The open question is the number, so ask for the number. */
    link = String(g.chat_state ?? "").startsWith("awaiting_count")
      ? whatsappCountLink(String(g.phone), String(g.name ?? ""), who)
      : whatsappReminderLink(
          String(g.phone), String(g.name ?? ""), String(g.rsvp_token), who);
  } else {
    link = whatsappInviteLink(String(g.phone), String(g.name ?? ""), String(g.rsvp_token));
  }

  return NextResponse.redirect(link, 302);
}
