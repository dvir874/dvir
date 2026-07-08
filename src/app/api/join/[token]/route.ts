import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

/* Open group RSVP — a shareable link (e.g. for a yeshiva class / army group)
   where guests self-register. Resolved via events.open_rsvp_token. */

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const sb = createServerClient();
  const { data: event } = await sb
    .from("events")
    .select("name, date, address")
    .eq("open_rsvp_token", token)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ event });
}

const JoinSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  attending: z.boolean(),
  guest_count: z.number().int().min(1).max(10).default(1),
  group: z.string().max(60).optional().nullable(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, "rsvp", LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { token } = await params;
  const parsed = JoinSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "פרטים לא תקינים" }, { status: 400 });
  const { name, phone, attending, guest_count, group } = parsed.data;

  const sb = createServerClient();
  const { data: event } = await sb
    .from("events")
    .select("id")
    .eq("open_rsvp_token", token)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 20);
  const status = attending ? "confirmed" : "declined";
  const groupPatch = { source_group: group?.trim() || "קישור פתוח" };

  /* Dedupe: same phone already registered for this event → update the answer */
  const { data: existing } = await sb
    .from("guests")
    .select("id, rsvp_token")
    .eq("event_id", event.id)
    .eq("phone", cleanPhone)
    .maybeSingle();

  if (existing) {
    let { error } = await sb
      .from("guests")
      .update({ name: name.trim(), status, guest_count: attending ? guest_count : 0, response_time: new Date().toISOString(), ...groupPatch })
      .eq("id", existing.id);
    if (error && Object.keys(groupPatch).length) {
      // graceful pre-migration fallback (source_group column may not exist yet)
      ({ error } = await sb
        .from("guests")
        .update({ name: name.trim(), status, guest_count: attending ? guest_count : 0, response_time: new Date().toISOString() })
        .eq("id", existing.id));
    }
    if (error) return NextResponse.json({ error: "שגיאה בשמירה" }, { status: 500 });
    return NextResponse.json({ ok: true, updated: true, rsvp_token: existing.rsvp_token });
  }

  const baseRow = {
    event_id: event.id,
    name: name.trim().slice(0, 120),
    phone: cleanPhone,
    status,
    guest_count: attending ? guest_count : 0,
    response_time: new Date().toISOString(),
  };

  let { data: inserted, error } = await sb
    .from("guests")
    .insert({ ...baseRow, ...groupPatch })
    .select("rsvp_token")
    .single();

  if (error && Object.keys(groupPatch).length) {
    ({ data: inserted, error } = await sb.from("guests").insert(baseRow).select("rsvp_token").single());
  }
  if (error) return NextResponse.json({ error: "שגיאה בשמירה" }, { status: 500 });

  return NextResponse.json({ ok: true, rsvp_token: inserted?.rsvp_token ?? null });
}
