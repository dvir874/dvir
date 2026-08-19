import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("message_queue")
    .select("*, guests(name, side)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { event_id, messages } = body as {
    event_id: string;
    messages: { guest_id?: string; phone: string; message_text: string; template_key: string; scheduled_at?: string }[];
  };

  if (!event_id || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "event_id and messages[] required" }, { status: 400 });
  }

  /* DEC-007, which CLAUDE.md says this route enforces and it never did.
   *
   * Every message the business number sends opens the same way, and the
   * reason is not branding. A guest gets one WhatsApp from an unknown number
   * about the most important day of someone else's life; the opening line is
   * how they know in half a second that this is the wedding thing and not a
   * scam. A queued message that skips it is the one that gets reported, and a
   * report is what restricted this number on 9/8 and stopped all three
   * weddings for days.
   *
   * Rejecting the whole batch rather than filtering it: a partial insert
   * means somebody has to work out which of two hundred rows went in. */
  const OPENING = "💍 משפחה וחברים יקרים!";
  const offenders = messages
    .map((m, i) => ({ i, text: (m.message_text ?? "").trimStart() }))
    .filter(m => !m.text.startsWith(OPENING));
  if (offenders.length) {
    return NextResponse.json({
      error: `כל הודעה חייבת להיפתח ב-"${OPENING}" — ${offenders.length} מתוך ${messages.length} לא נפתחות כך`,
      first_bad_index: offenders[0].i,
      first_bad_preview: offenders[0].text.slice(0, 60),
    }, { status: 400 });
  }

  const supabase = createServerClient();
  const rows = messages.map(m => ({
    event_id,
    guest_id:     m.guest_id ?? null,
    template_key: m.template_key,
    phone:        m.phone,
    message_text: m.message_text,
    wa_link:      `https://wa.me/${m.phone.replace(/[^0-9]/g, "").replace(/^0/, "972")}?text=${encodeURIComponent(m.message_text)}`,
    status:       "pending",
    scheduled_at: m.scheduled_at ?? null,
  }));

  const { data, error } = await supabase.from("message_queue").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, status, error_msg } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createServerClient();
  const update: Record<string, unknown> = { status };
  if (status === "sent") update.sent_at = new Date().toISOString();
  if (status === "pending") { update.error_msg = null; update.sent_at = null; }
  if (error_msg) update.error_msg = error_msg;

  const { data, error } = await supabase.from("message_queue").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
