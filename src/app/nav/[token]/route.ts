import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { wazeLink } from "@/lib/venue";

export const dynamic = "force-dynamic";

/* One tap, from the wedding-day message, to navigation.
 *
 * The same problem /s/[token] solves, for the guest instead of for Dvir. A
 * waze.com/ul?q= URL carrying a Hebrew address encodes to about a hundred and
 * eighty characters of percent signs, and it goes inside a template parameter
 * on the line beside the couple's own note — so what 240 people would read on
 * the morning of the wedding is a wall of %D7%. This is forty characters and
 * resolves at the moment they tap it.
 *
 * Keyed on the event id. Not a secret and not treated as one: the only thing
 * behind it is the venue address, printed in full two lines above the link in
 * the very message that carries it. share_token and open_rsvp_token would read
 * better and are null for שחר and for every event created before them;
 * couple_token would open the couple's own dashboard and must never travel to
 * a guest list. One link serves the whole wedding rather than one per person.
 *
 * A wedding with no address still returns something: guests tapping a dead
 * link on the morning of the wedding is worse than any error we could show
 * them, so it falls through to Waze itself, which at least opens the app they
 * expected. */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await ctx.params;
  const clean = String(token ?? "").replace(/[^A-Za-z0-9-]/g, "");
  if (!clean) return NextResponse.redirect("https://waze.com/", 302);

  const sb = createServerClient();
  const { data: ev } = await sb.from("events")
    .select("venue_name, address")
    .eq("id", clean).maybeSingle();

  const link = wazeLink(ev as Parameters<typeof wazeLink>[0]);
  return NextResponse.redirect(link ?? "https://waze.com/", 302);
}
