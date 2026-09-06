import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getWhatsAppConfig, sendRunSummary } from "@/lib/whatsapp";

type Params = { params: Promise<{ token: string }> };

async function getEvent(token: string) {
  const supabase = createServerClient();
  const { data } = await supabase.from("events").select("id").eq("couple_token", token).single();
  return data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const event = await getEvent(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("couple_requests")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const event = await getEvent(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { category, title, description } = body;
  if (!category || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("couple_requests")
    .insert({ event_id: event.id, category, title, description: description ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  /* The page promises "נחזור אליכם תוך 24 שעות" and this route told nobody.
   *
   * A paying couple could send a request and it would sit in a table waiting
   * for somebody to open a screen. The table has zero rows, which reads like
   * "nobody needs anything" and is more likely "nobody found it": the button
   * on their dashboard was labelled "הודעה לאורחים", and a couple looking for
   * how to ask US something would never press that.
   *
   * The promise is the reason this matters. Everything else in this system
   * that goes quiet is an inconvenience; this one is a commitment made to a
   * customer in writing. */
  (async () => {
    const to = process.env.ADMIN_ALERT_PHONE;
    const cfg = getWhatsAppConfig();
    if (!to || !cfg) return;
    const { data: ev } = await supabase.from("events")
      .select("name, couple_names, client_phone").eq("id", event.id).maybeSingle();
    const who = (ev?.couple_names as string) || (ev?.name as string) || "זוג";
    const phone = String(ev?.client_phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
    try {
      await sendRunSummary(cfg, to, {
        event: "📬 בקשה מזוג",
        sent: "1", failed: "—", left: "24",
        attention: `${who} · ${category} · ${String(title).slice(0, 70)}`
          + (description ? ` — ${String(description).slice(0, 90)}` : "")
          + (phone ? ` · https://wa.me/${phone}` : ""),
      });
    } catch { /* the request is saved either way */ }
  })();

  return NextResponse.json(data, { status: 201 });
}
