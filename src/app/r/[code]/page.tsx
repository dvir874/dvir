import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* A short RSVP link, for SMS.
 *
 * The full link is 70 characters. A Hebrew SMS is UCS-2 — 67 characters per
 * segment — so the URL could not fit inside one segment no matter how short
 * the surrounding text was, and a boundary landing inside it produced
 * "https:" on one part and "//regalifnei.verce…" on the next. A phone that
 * reassembles the parts correctly hides the problem; one that does not shows
 * a link with no address. That is what יעקב בן שושן was tapping on 20/08.
 *
 * It breaks precisely where it hurts: the guests without WhatsApp — the only
 * ones who get an SMS at all — are the ones on older handsets.
 *
 * /r/<first 8 of the token> is 39 characters, so the whole message fits in a
 * single segment and cannot be split. Eight hex characters is 4.3 billion
 * values against a few thousand guests; a collision is refused rather than
 * guessed, because sending a guest to someone else's RSVP is worse than
 * sending them nowhere. */
export default async function ShortRsvp({
  params,
}: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = (code ?? "").toLowerCase().replace(/[^a-f0-9-]/g, "");
  if (clean.length < 6) notFound();

  const sb = createServerClient();
  const { data } = await sb.from("guests")
    .select("rsvp_token").ilike("rsvp_token", `${clean}%`).limit(2);

  if (!data?.length) notFound();
  if (data.length > 1) notFound();   /* ambiguous — never guess */

  redirect(`/rsvp/${data[0].rsvp_token}`);
}
