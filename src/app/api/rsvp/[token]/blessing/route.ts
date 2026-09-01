import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/* A blessing written at the moment the guest confirms.
 *
 * The capability already existed — /memory/[token] takes blessings, the wall
 * shows them, the couple's dashboard counts them — but it lives behind a link
 * sent AFTER the wedding, so a guest reaches it only by tapping a thank-you
 * message. Five people at תהל ואביב found it anyway and wrote something without
 * being asked, which is the whole argument: they wanted to say something to the
 * couple and had nowhere to do it at the moment they felt it.
 *
 * The moment they feel it is now — they have just said they are coming.
 *
 * Deliberately a route of its own rather than another field on the RSVP submit.
 * The RSVP is the product's job and nothing may put it at risk: this is called
 * after the answer is already saved, and if it fails the guest is still
 * confirmed and simply has no blessing. A blessing that fails to save must
 * never look like an RSVP that failed to save.
 *
 * Writes to memory_items, the same table the memory page uses, so it appears on
 * the existing wall and in the existing counter with no new surface anywhere.
 */

const MAX_LEN = 500;

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, "rsvp_blessing", 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "יותר מדי בקשות" }, { status: 429 });

  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  const text = String(body?.blessing ?? "").trim().slice(0, MAX_LEN);
  if (!text) return NextResponse.json({ error: "אין טקסט" }, { status: 400 });

  const sb = createServerClient();

  /* The guest's own token identifies them. Nothing is taken from the request
     body about who they are — a blessing signed with somebody else's name is
     the one thing that would make the wall unusable. */
  const { data: guest } = await sb.from("guests")
    .select("id, name, event_id, category")
    .eq("rsvp_token", token).maybeSingle();
  if (!guest) return NextResponse.json({ error: "not found" }, { status: 404 });

  /* Demo guests exist so a couple can be shown the flow. Their words are not
     real and must never reach a real wall. */
  if (guest.category === "demo") return NextResponse.json({ ok: true, demo: true });

  const { data: vault } = await sb.from("vault_tokens")
    .select("token").eq("event_id", guest.event_id).maybeSingle();
  if (!vault?.token) {
    /* Every event created since 13/08 gets a vault at creation. An older one
       without a vault has nowhere to put this, and losing the blessing is
       better than 500-ing a guest who has already confirmed. */
    console.warn(`[rsvp:blessing] event ${guest.event_id} has no vault token`);
    return NextResponse.json({ ok: false, stored: false });
  }

  /* One per guest. The field is offered once, but a reload or a second tap
     must not put the same person on the wall twice. */
  const { data: existing } = await sb.from("memory_items")
    .select("id").eq("guest_id", guest.id).eq("type", "blessing").limit(1);

  const row = {
    event_id: guest.event_id,
    vault_token: vault.token,
    guest_id: guest.id,
    guest_name: guest.name,
    type: "blessing",
    blessing_text: text,
  };

  const { error } = existing?.length
    ? await sb.from("memory_items").update({ blessing_text: text }).eq("id", existing[0].id)
    : await sb.from("memory_items").insert(row);

  if (error) {
    console.error("[rsvp:blessing]", error.message);
    return NextResponse.json({ ok: false, stored: false });
  }

  return NextResponse.json({ ok: true, stored: true, updated: !!existing?.length });
}
