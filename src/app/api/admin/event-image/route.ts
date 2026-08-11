import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

/* The invitation card shown at the top of every WhatsApp message for one
   event. Stored as a URL rather than a file so Meta can fetch it per send;
   sending refuses when it is empty, because the alternative is one couple's
   card reaching another couple's guests. */

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { event_id, url } = await req.json().catch(() => ({}));
  if (!event_id || typeof url !== "string")
    return NextResponse.json({ error: "event_id and url required" }, { status: 400 });

  const trimmed = url.trim();
  if (trimmed && !/^https:\/\/\S+\.(jpe?g|png)(\?\S*)?$/i.test(trimmed))
    return NextResponse.json(
      { error: "הכתובת חייבת להיות https ולהסתיים ב-jpg או png" },
      { status: 422 },
    );

  /* Meta fetches this URL itself, so an unreachable or oversized image fails
     silently at send time. Check it once, here, where we can say so. */
  if (trimmed) {
    try {
      const head = await fetch(trimmed, { method: "HEAD" });
      if (!head.ok)
        return NextResponse.json({ error: `התמונה לא נגישה (HTTP ${head.status})` }, { status: 422 });
      const size = Number(head.headers.get("content-length") ?? 0);
      if (size > 5_000_000)
        return NextResponse.json({ error: "התמונה גדולה מ-5MB" }, { status: 422 });
    } catch {
      return NextResponse.json({ error: "לא ניתן להגיע לתמונה" }, { status: 422 });
    }
  }

  const sb = createServerClient();
  const { error } = await sb.from("events")
    .update({ wa_header_image_url: trimmed || null }).eq("id", event_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, url: trimmed || null });
}
