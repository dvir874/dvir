import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getWhatsAppConfig, toE164 } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/* Admin inbox for the official WhatsApp number.

   GET  /api/admin/inbox?event_id=X  → conversations, newest activity first
   POST /api/admin/inbox             → reply to a guest, or mark a thread read

   Replies are free-form text, which WhatsApp only allows inside the 24-hour
   window that opens when a guest messages us. We compute that window per
   thread and tell the UI, so the reply box is never offered when it would
   just fail. */

interface MsgRow {
  id: string;
  guest_id: string | null;
  wa_phone: string;
  direction: string;
  body: string | null;
  status: string | null;
  error: string | null;
  created_at: string;
  read_at: string | null;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data, error } = await sb
    .from("wa_messages")
    .select("id, guest_id, wa_phone, direction, body, status, error, created_at, read_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(1000);

  /* The table only exists after the migration — report that plainly instead
     of surfacing a raw Postgres error in the UI. */
  if (error) {
    return NextResponse.json(
      { error: "inbox_unavailable", hint: "טבלת wa_messages טרם נוצרה" },
      { status: 503 },
    );
  }

  const rows = (data ?? []) as MsgRow[];

  const guestIds = [...new Set(rows.map(r => r.guest_id).filter(Boolean))] as string[];
  /* Chunked for the PostgREST .in() limit; without it a large event showed
     phone numbers instead of names throughout the inbox. */
  const guests: { id: string; name: string; phone: string | null; status: string; source_group: string | null }[] = [];
  for (let i = 0; i < guestIds.length; i += 100) {
    const { data } = await sb
      .from("guests").select("id, name, phone, status, source_group")
      .in("id", guestIds.slice(i, i + 100));
    guests.push(...(data ?? []));
  }
  const byId = new Map(guests.map(g => [g.id, g]));

  /* One thread per phone number */
  const threads = new Map<string, MsgRow[]>();
  for (const r of rows) {
    if (!threads.has(r.wa_phone)) threads.set(r.wa_phone, []);
    threads.get(r.wa_phone)!.push(r);
  }

  const now = Date.now();
  const out = [...threads.entries()].map(([phone, msgs]) => {
    const ordered = [...msgs].reverse();              // oldest → newest
    const lastIn = ordered.filter(m => m.direction === "in").at(-1);
    const g = byId.get(msgs.find(m => m.guest_id)?.guest_id ?? "");
    return {
      phone,
      guest: g ? { id: g.id, name: g.name, status: g.status, group: g.source_group } : null,
      unread: ordered.filter(m => m.direction === "in" && !m.read_at).length,
      lastAt: ordered.at(-1)?.created_at ?? null,
      /* Free-form replies are only possible while this is true */
      canReply: !!lastIn && now - new Date(lastIn.created_at).getTime() < WINDOW_MS,
      windowEndsAt: lastIn
        ? new Date(new Date(lastIn.created_at).getTime() + WINDOW_MS).toISOString()
        : null,
      messages: ordered.map(m => ({
        id: m.id, direction: m.direction, body: m.body,
        status: m.status, error: m.error, at: m.created_at,
      })),
    };
  })
  .filter(t => t.messages.some(m => m.direction === "in"))   // only real conversations
  .sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));

  /* Delivery roll-up across every outbound message we logged */
  const outbound = rows.filter(r => r.direction === "out");
  const tally = (s: string) => outbound.filter(r => r.status === s).length;

  return NextResponse.json({
    threads: out,
    unreadTotal: out.reduce((s, t) => s + t.unread, 0),
    delivery: {
      total: outbound.length,
      accepted: tally("accepted"),
      sent: tally("sent"),
      delivered: tally("delivered"),
      read: tally("read"),
      failed: tally("failed"),
      failures: outbound
        .filter(r => r.status === "failed")
        .map(r => ({ name: byId.get(r.guest_id ?? "")?.name ?? r.wa_phone, error: r.error })),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();

  /* Mark a thread as read */
  if (body?.action === "read" && body?.phone) {
    await sb.from("wa_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("wa_phone", body.phone).eq("direction", "in").is("read_at", null);
    return NextResponse.json({ ok: true });
  }

  const phone: string = body?.phone ?? "";
  const text: string = (body?.text ?? "").trim();
  const eventId: string = body?.event_id ?? "";
  if (!phone || !text) return NextResponse.json({ error: "phone and text required" }, { status: 400 });

  const cfg = getWhatsAppConfig();
  if (!cfg) return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });

  const to = toE164(phone);
  if (!to) return NextResponse.json({ error: "invalid phone" }, { status: 400 });

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${cfg.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.error?.error_user_msg ?? json?.error?.message ?? `HTTP ${res.status}`;
    /* 131047 = outside the 24-hour window; say so in plain Hebrew */
    const friendly = String(msg).includes("24") || json?.error?.code === 131047
      ? "חלון 24 השעות נסגר — אפשר לשלוח רק תבנית מאושרת"
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  const { data: g } = await sb
    .from("guests").select("id").eq("phone", to.startsWith("972") ? "0" + to.slice(3) : to).maybeSingle();

  await sb.from("wa_messages").insert({
    event_id: eventId || null,
    guest_id: g?.id ?? null,
    wa_phone: to,
    direction: "out",
    body: text,
    wamid: json?.messages?.[0]?.id ?? null,
    status: "accepted",
  });

  return NextResponse.json({ ok: true, messageId: json?.messages?.[0]?.id });
}
