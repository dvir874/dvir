import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { parseIntake, missingFields } from "@/lib/intake-parser";
import { looksLikeCouple } from "@/lib/couple-name";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

/* Read a couple's WhatsApp message; create the event from what a human
   confirmed. Two steps on purpose — the parse never writes anything. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json() as {
    mode?: "parse" | "create";
    text?: string;
    fields?: {
      couple?: string; date?: string; venue?: string; address?: string;
      reception?: string; chuppah?: string; client_name?: string; client_phone?: string;
    };
  };

  if (body.mode !== "create") {
    const r = parseIntake(body.text ?? "");
    return NextResponse.json({ parsed: r, missing: missingFields(r) });
  }

  const f = body.fields ?? {};
  const need = [["couple", f.couple], ["date", f.date], ["venue", f.venue],
                ["reception", f.reception], ["chuppah", f.chuppah]] as const;
  const blank = need.filter(([, v]) => !String(v ?? "").trim()).map(([k]) => k);
  if (blank.length) return NextResponse.json({ error: `חסר: ${blank.join(", ")}` }, { status: 400 });

  /* The same test the sender applies before putting a value into
     "בעזרת ה׳ *{{1}}* מתחתנים" — refused here rather than at 300 messages. */
  if (!looksLikeCouple(f.couple!.trim()))
    return NextResponse.json({ error: `"${f.couple}" לא נראה כמו שמות בני זוג` }, { status: 400 });

  const sb = createServerClient();
  const { data: ev, error } = await sb.from("events").insert({
    name: `החתונה של ${f.couple!.trim()}`,
    couple_names: f.couple!.trim(),
    date: f.date,
    venue_name: f.venue!.trim(),
    address: (f.address ?? "").trim() || null,
    reception_time: f.reception,
    chuppah_time: f.chuppah,
    client_name: (f.client_name ?? "").trim() || null,
    client_phone: (f.client_phone ?? "").trim() || null,
    status: "info_received",
    couple_token: randomUUID(),
    helper_token: randomUUID(),
  }).select().single();

  if (error || !ev) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 500 });

  /* Both of these, always. שחר was created with an album and no vault token
     and תהל with a vault token and no album; each broke a different feature
     weeks later, and neither could be inferred from the other. */
  await sb.from("vault_tokens").insert({
    event_id: ev.id, token: randomUUID(), owner_token: randomUUID(),
  });
  await sb.from("gallery_albums").insert({
    event_id: ev.id, title: `תמונות מהחתונה של ${f.couple!.trim()}`,
    public_token: randomUUID(), owner_token: randomUUID(), is_public: false,
  });

  return NextResponse.json({
    event_id: ev.id, name: ev.name,
    couple_token: ev.couple_token, helper_token: ev.helper_token,
    /* Stated rather than assumed — the sender refuses without it. */
    next: "העלו את תמונת ההזמנה וייבאו את רשימת האורחים",
  });
}
