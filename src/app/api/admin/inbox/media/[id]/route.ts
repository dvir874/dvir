import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getWhatsAppConfig } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/* Stream a photo or video a guest sent, so the inbox can show it.
 *
 * Meta hands over only an id. The file lives behind a second, short-lived URL
 * that has to be fetched with our access token, which means the browser cannot
 * load it directly — this route is the only way the image reaches the screen.
 *
 * The id is looked up in wa_messages rather than taken from the URL, so this
 * cannot be used to pull arbitrary media out of the WhatsApp account.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cfg = getWhatsAppConfig();
  if (!cfg) return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });

  const sb = createServerClient();
  const { data: row } = await sb
    .from("wa_messages")
    .select("media_id, media_mime")
    .eq("media_id", id)
    .eq("direction", "in")
    .maybeSingle();
  if (!row?.media_id) return NextResponse.json({ error: "not found" }, { status: 404 });

  const auth = { Authorization: `Bearer ${cfg.accessToken}` };

  const meta = await fetch(`https://graph.facebook.com/v21.0/${row.media_id}`, { headers: auth });
  if (!meta.ok) {
    /* Meta drops media after a while. Say that, rather than showing a broken
       image and leaving the operator wondering whether the guest sent
       anything at all. */
    return NextResponse.json(
      { error: "media_unavailable", hint: "הקובץ כבר לא זמין אצל Meta" },
      { status: 410 },
    );
  }
  const { url } = await meta.json() as { url?: string };
  if (!url) return NextResponse.json({ error: "media_unavailable" }, { status: 410 });

  const file = await fetch(url, { headers: auth });
  if (!file.ok) return NextResponse.json({ error: "media_unavailable" }, { status: 410 });

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": row.media_mime ?? file.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
