import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { failureWriter, newRunId, recordFailure } from "@/lib/failures";

export const dynamic = "force-dynamic";

/* The POST behind the no-JavaScript answer page.
 *
 * A plain form submit, answered with a redirect. No fetch, no JSON, no client
 * state — the browser posts and follows the Location header, which is the one
 * path that works even when scripts do not.
 *
 * It writes exactly what the interactive flow writes, so a guest who answers
 * here is indistinguishable downstream from one who answered on the main page:
 * same status, same guest_count, same response_time, same rsvp_submitted event.
 * Nothing anywhere needs to know which route they used.
 *
 * And it records its own failures. The reason this page exists is that a guest
 * answered into silence on 13/08, so an error here goes to wa_failures rather
 * than to a stack trace nobody reads.
 */

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const back = (q: string) => NextResponse.redirect(new URL(`/rsvp/${token}/simple?${q}`, req.url), 303);

  const sb = createServerClient();
  const w = failureWriter(sb);
  const runId = newRunId("rsvp");

  try {
    const form = await req.formData();
    const answer = String(form.get("answer") ?? "");
    const count = Math.max(1, Math.min(20, parseInt(String(form.get("count") ?? "1"), 10) || 1));
    if (answer !== "yes" && answer !== "no") return back("error=1");

    const { data: guest } = await sb
      .from("guests").select("id, status").eq("rsvp_token", token).maybeSingle();
    if (!guest) return back("error=1");

    const status = answer === "yes" ? "confirmed" : "declined";
    const { error } = await sb.from("guests").update({
      status,
      /* Only the count they chose, and only when they are coming. A decline
         must not overwrite the headcount the couple already has. */
      ...(answer === "yes" ? { guest_count: count } : {}),
      response_time: new Date().toISOString(),
      opened_at: new Date().toISOString(),
      chat_state: null, chat_state_at: null,
    }).eq("id", guest.id);

    if (error) {
      await recordFailure(w, {
        scope: "admin.send", runId, guestId: guest.id, error,
        context: { route: "rsvp.simple", answer, count },
      });
      return back("error=1");
    }

    /* Same event the interactive page logs, and only on a real change, so the
       timeline does not show a guest answering twice. */
    if (guest.status !== status) {
      await sb.from("guest_events")
        .insert({ guest_id: guest.id, event_type: "rsvp_submitted" })
        .then(() => {}, () => {});
    }

    return back(`done=${answer}`);
  } catch (e) {
    await recordFailure(w, {
      scope: "admin.send", runId, error: e, context: { route: "rsvp.simple", token },
    });
    return back("error=1");
  }
}
