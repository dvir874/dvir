import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { whatsappInviteLink, whatsappReminderLink } from "@/lib/phone";

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
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app";

  const clean = String(token ?? "").replace(/[^A-Za-z0-9-]/g, "");
  if (!clean) return NextResponse.redirect(base, 302);

  const sb = createServerClient();
  const { data: g } = await sb.from("guests")
    .select("name, phone, rsvp_token, status, event_id")
    .eq("rsvp_token", clean).maybeSingle();

  /* A dead token opens WhatsApp with nothing rather than an error page — he is
     walking between meetings and a 404 helps nobody. */
  if (!g?.phone) return NextResponse.redirect("https://wa.me/", 302);

  /* A guest who already answered gets the reminder wording rather than a fresh
     invitation; sending "אתם מוזמנים" to somebody who confirmed last week
     reads as a system that lost them. */
  const answered = g.status && g.status !== "pending";
  let link: string;
  if (answered) {
    const { data: ev } = await sb.from("events")
      .select("name, couple_names").eq("id", g.event_id as string).maybeSingle();
    link = whatsappReminderLink(
      String(g.phone), String(g.name ?? ""), String(g.rsvp_token),
      String(ev?.couple_names ?? ev?.name ?? ""));
  } else {
    link = whatsappInviteLink(String(g.phone), String(g.name ?? ""), String(g.rsvp_token));
  }

  return NextResponse.redirect(link, 302);
}
