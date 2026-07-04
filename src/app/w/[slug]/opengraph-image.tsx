import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Dynamic share preview: couple names + date, so /w/inbal-nadav
   looks like an invitation when shared on WhatsApp. */
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createServerClient();
  const { data: event } = await sb
    .from("events")
    .select("name, date")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  const name = event?.name ?? "החתונה שלנו";
  const dateStr = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFAF5",
          border: "24px solid #C5A46D",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 20 }}>💍</div>
        <div style={{ fontSize: 84, fontWeight: 800, color: "#1C1008", marginBottom: 16, textAlign: "center", padding: "0 60px" }}>
          {name}
        </div>
        {dateStr && (
          <div style={{ fontSize: 40, color: "#8B6914", marginBottom: 32 }}>{dateStr}</div>
        )}
        <div style={{ fontSize: 26, color: "rgba(28,16,8,0.5)" }}>הוזמנתם לחגוג איתנו · רגע לפני</div>
      </div>
    ),
    size
  );
}
