import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

/* The post-wedding survey, reached with the guest's own RSVP token.
 *
 * Deliberately the same token they already have: the couple does not have to
 * distribute a second link, and a guest who kept the invitation in their chat
 * can reach this from it. It grants nothing the RSVP link did not already
 * grant — the guest's own name and their own answer.
 *
 * Never opens before the wedding. "תודה שהייתם איתנו" sent to someone who has
 * not been anywhere yet is worse than no survey at all, and a date that has not
 * arrived is the one thing this route can check for itself.
 */

const FeedbackSchema = z.object({
  rating:    z.number().int().min(1).max(5).optional(),
  favourite: z.string().max(60).optional().nullable(),
  message:   z.string().max(1000).optional().nullable(),
});

type Params = { params: Promise<{ token: string }> };

async function load(token: string) {
  const sb = createServerClient();
  const { data: guest, error } = await sb
    .from("guests")
    .select("id, name, event_id, status")
    .eq("rsvp_token", token)
    .maybeSingle();
  /* An error and a missing row are different answers, and the page acts
     differently on each — the same distinction /rsvp learned the hard way when
     a Supabase hiccup told guests their invitation did not exist. */
  if (error) return { sb, kind: "unavailable" as const };
  if (!guest) return { sb, kind: "not_found" as const };

  const { data: event } = await sb
    .from("events")
    .select("id, name, date")
    .eq("id", guest.event_id)
    .maybeSingle();

  return { sb, kind: "ok" as const, guest, event };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const rl = checkRateLimit(getClientIp(req), "thanks", LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const r = await load(token);
  if (r.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.kind === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: existing } = await r.sb
    .from("event_feedback")
    .select("rating, favourite, message")
    .eq("guest_id", r.guest.id)
    .maybeSingle();

  const date = r.event?.date as string | undefined;
  /* Compared as dates, not timestamps: the survey should be open on the morning
     after, not at midnight of a day that is technically still the wedding. */
  const tooEarly = !!date && date >= new Date().toISOString().slice(0, 10);

  return NextResponse.json({
    guest: { name: r.guest.name },
    event: r.event ? { name: r.event.name, date: r.event.date } : null,
    tooEarly,
    existing: existing ?? null,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const rl = checkRateLimit(getClientIp(req), "thanks", LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const parsed = FeedbackSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const r = await load(token);
  if (r.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.kind === "unavailable") return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { rating, favourite, message } = parsed.data;
  /* Nothing at all is not an answer. Without this an accidental tap on the
     button would overwrite a real reply with three empty fields. */
  if (rating == null && !favourite && !String(message ?? "").trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const { error } = await r.sb
    .from("event_feedback")
    .upsert({
      event_id: r.guest.event_id,
      guest_id: r.guest.id,
      rating: rating ?? null,
      favourite: favourite ?? null,
      message: message ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "guest_id" });

  /* Reported, never swallowed. A survey that says "תודה" and stored nothing is
     the same shape as every failure this system has spent a day removing. */
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
