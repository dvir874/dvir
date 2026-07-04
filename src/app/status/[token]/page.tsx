import { createServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/* Read-only status page for parents/family — numbers only, no editing.
   Reached via events.share_token. */

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.52)", border: "#E8E0D4", green: "#4A7C59" };

export default async function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb
    .from("events")
    .select("id, name, date")
    .eq("share_token", token)
    .maybeSingle();
  if (!event) notFound();

  const { data: guests } = await sb
    .from("guests")
    .select("status, guest_count")
    .eq("event_id", event.id);

  const all = guests ?? [];
  const confirmed = all.filter(g => g.status === "confirmed");
  const attendees = confirmed.reduce((s, g) => s + (g.guest_count ?? 1), 0);
  const declined = all.filter(g => g.status === "declined").length;
  const pending  = all.filter(g => g.status === "pending").length;

  const daysLeft = event.date
    ? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 13, fontWeight: 700, color: C.goldT, letterSpacing: "0.14em", margin: "0 0 20px" }}>
        רגע לפני 💍
      </p>

      <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 900, textAlign: "center", margin: "0 0 6px" }}>
        {event.name}
      </h1>
      {event.date && (
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 32px" }}>
          {new Date(event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {daysLeft !== null && (
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 64, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>{daysLeft}</p>
          <p style={{ fontSize: 14, color: C.muted, margin: "6px 0 0" }}>ימים לחתונה</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 420 }}>
        <div style={{ background: C.cream, borderRadius: 16, padding: "18px 8px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, color: C.green, margin: 0, lineHeight: 1 }}>{attendees}</p>
          <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>מגיעים ✓</p>
        </div>
        <div style={{ background: C.cream, borderRadius: 16, padding: "18px 8px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>{pending}</p>
          <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>ממתינים</p>
        </div>
        <div style={{ background: C.cream, borderRadius: 16, padding: "18px 8px", textAlign: "center", border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, color: C.muted, margin: 0, lineHeight: 1 }}>{declined}</p>
          <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>לא מגיעים</p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: C.muted, marginTop: 32, textAlign: "center", lineHeight: 1.7 }}>
        עמוד צפייה בלבד · מתעדכן בזמן אמת<br />
        נבנה באהבה ע״י רגע לפני 💍
      </p>
    </div>
  );
}
