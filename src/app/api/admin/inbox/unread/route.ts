import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* How many guest replies nobody has read yet.
 *
 * The inbox itself has worked for days; the problem was that nothing pointed at
 * it. A guest wrote "הקישור לא עובד" at 14:22 and it sat unseen for three
 * hours, while two guests who had answered "I can't come" in plain words stayed
 * counted as attending — because saying it in a WhatsApp reply is not the same
 * as pressing the button, and only a person reading the thread can tell the
 * difference.
 *
 * Kept to a head-count query: this runs on every admin page load, and it exists
 * to put a number on a link, not to fetch messages.
 */
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  const sb = createServerClient();

  let q = sb.from("wa_messages")
    .select("id", { count: "exact", head: true })
    .eq("direction", "in")
    .is("read_at", null);
  if (eventId) q = q.eq("event_id", eventId);

  const { count, error } = await q;
  /* Zero and "we could not check" must not look alike — a silent zero is how
     the badge would quietly stop working and nobody would notice. */
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ unread: count ?? 0 });
}
