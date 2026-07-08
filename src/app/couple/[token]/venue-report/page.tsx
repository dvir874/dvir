"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";

/* Venue report — one clean printable page for the venue/catering manager:
   total attendees, meal breakdown, tables, special notes. */

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", green: "#4A7C59",
};

const MEAL_LABEL: Record<string, string> = {
  regular: "בשרי", vegetarian: "צמחוני", vegan: "טבעוני", mehadrin: "דג", kids: "מנות ילדים",
};
const MEAL_ORDER = ["regular", "vegetarian", "vegan", "mehadrin", "kids"];

interface Guest {
  id: string; name: string; status: string; guest_count: number;
  meal_preference?: string | null; meal_note?: string | null;
  meal_counts?: Record<string, number> | null;
  chuppah_only?: boolean | null;
}
interface SeatingTable { id: string; name: string; capacity: number }

export default function VenueReportPage() {
  const { token } = useParams<{ token: string }>();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/couple/${token}/event`).then(r => r.ok ? r.json() : null),
      fetch(`/api/couple/${token}/guests`).then(r => r.ok ? r.json() : []),
      fetch(`/api/couple/${token}/seating`).then(r => r.ok ? r.json() : null),
      fetch(`/api/couple/${token}`).then(r => r.ok ? r.json() : null),
    ]).then(([ev, gs, seat, dash]) => {
      if (ev?.name) setEventName(ev.name);
      if (dash?.event?.date) setEventDate(dash.event.date);
      if (Array.isArray(gs)) setGuests(gs);
      if (seat?.tables) setTables(seat.tables);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const allConfirmed = useMemo(() => guests.filter(g => g.status === "confirmed"), [guests]);
  const chuppahOnly = allConfirmed.filter(g => g.chuppah_only);
  const chuppahPeople = chuppahOnly.reduce((s, g) => s + (g.guest_count ?? 1), 0);
  const confirmed = useMemo(() => allConfirmed.filter(g => !g.chuppah_only), [allConfirmed]);
  const totalAttendees = confirmed.reduce((s, g) => s + (g.guest_count ?? 1), 0);

  /* Meal totals: prefer per-guest meal_counts; fallback to meal_preference × party size */
  const mealTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let counted = 0;
    for (const g of confirmed) {
      const mc = g.meal_counts;
      const mcSum = mc && typeof mc === "object"
        ? Object.values(mc).reduce((s, n) => s + (typeof n === "number" ? n : 0), 0)
        : 0;
      if (mcSum > 0) {
        for (const [k, n] of Object.entries(mc!)) {
          if (typeof n === "number" && n > 0) totals[k] = (totals[k] ?? 0) + n;
        }
        counted += mcSum;
      } else if (g.meal_preference) {
        totals[g.meal_preference] = (totals[g.meal_preference] ?? 0) + (g.guest_count ?? 1);
        counted += g.guest_count ?? 1;
      }
    }
    return { totals, counted, unspecified: Math.max(0, totalAttendees - counted) };
  }, [confirmed, totalAttendees]);

  const notes = confirmed.filter(g => g.meal_note?.trim());

  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f0f0f0", fontFamily: "'Heebo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        .sheet { background: white; max-width: 210mm; margin: 24px auto; padding: 14mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .sheet { margin: 0; box-shadow: none; max-width: none; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ background: "#1C1008", padding: "12px 24px", display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        <a href={`/couple/${token}`} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← לדשבורד</a>
        <button onClick={() => window.print()}
          style={{ background: C.gold, color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          🖨️ הדפס / שמור PDF
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`דוח מנות לאירוע ${eventName}:\nסה"כ מגיעים: ${totalAttendees}\n${MEAL_ORDER.filter(k => mealTotals.totals[k]).map(k => `${MEAL_LABEL[k]}: ${mealTotals.totals[k]}`).join("\n")}${mealTotals.unspecified > 0 ? `\nללא העדפה (רגיל): ${mealTotals.unspecified}` : ""}\nשולחנות: ${tables.length}`)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ background: "#25D366", color: "white", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          💬 שלחו לאולם בוואטסאפ
        </a>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 60, color: C.muted }}>טוען...</p>
      ) : (
        <div className="sheet">
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: `2px solid ${C.gold}`, paddingBottom: 14, marginBottom: 20 }}>
            <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 900, color: C.dark, margin: "0 0 4px" }}>
              דוח מנות והגעה — {eventName}
            </h1>
            {dateStr && <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>{dateStr}</p>}
            <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>
              הופק {new Date().toLocaleDateString("he-IL")} · רגע לפני 💍
            </p>
          </div>

          {/* Headline numbers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24, textAlign: "center" }}>
            <div style={{ background: C.cream, borderRadius: 14, padding: "16px 8px" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 900, color: C.green, margin: 0, lineHeight: 1 }}>{totalAttendees}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0" }}>סועדים (אישרו)</p>
              {chuppahPeople > 0 && <p style={{ fontSize: 11, color: C.goldT, margin: "4px 0 0", fontWeight: 600 }}>+ {chuppahPeople} רק לחופה 💍</p>}
            </div>
            <div style={{ background: C.cream, borderRadius: 14, padding: "16px 8px" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>{confirmed.length}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0" }}>הזמנות (משפחות)</p>
            </div>
            <div style={{ background: C.cream, borderRadius: 14, padding: "16px 8px" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 900, color: C.dark, margin: 0, lineHeight: 1 }}>{tables.length}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0" }}>שולחנות</p>
            </div>
          </div>

          {/* Meal breakdown */}
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 700, color: C.goldT, margin: "0 0 10px" }}>
            🍽️ פירוט מנות
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <tbody>
              {MEAL_ORDER.filter(k => mealTotals.totals[k] > 0).map(k => (
                <tr key={k} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 4px", fontSize: 15, color: C.dark }}>{MEAL_LABEL[k]}</td>
                  <td style={{ padding: "9px 4px", fontSize: 16, fontWeight: 700, color: C.goldT, textAlign: "left" }}>{mealTotals.totals[k]}</td>
                </tr>
              ))}
              {mealTotals.unspecified > 0 && (
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 4px", fontSize: 15, color: C.muted }}>ללא העדפה שצוינה (להיערך כרגיל)</td>
                  <td style={{ padding: "9px 4px", fontSize: 16, fontWeight: 700, color: C.muted, textAlign: "left" }}>{mealTotals.unspecified}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: "10px 4px", fontSize: 16, fontWeight: 700, color: C.dark }}>סה״כ</td>
                <td style={{ padding: "10px 4px", fontSize: 18, fontWeight: 900, color: C.green, textAlign: "left" }}>{totalAttendees}</td>
              </tr>
            </tbody>
          </table>

          {/* Special notes */}
          {notes.length > 0 && (
            <>
              <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 700, color: C.goldT, margin: "0 0 10px" }}>
                ⚠️ בקשות מיוחדות ואלרגיות
              </h2>
              <div style={{ marginBottom: 24 }}>
                {notes.map(g => (
                  <p key={g.id} style={{ fontSize: 14, color: C.dark, margin: "0 0 6px", lineHeight: 1.6 }}>
                    <strong>{g.name}:</strong> {g.meal_note}
                  </p>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 12, margin: 0 }}>
            הנתונים מתעדכנים בזמן אמת במערכת — מומלץ להפיק דוח סופי 3-4 ימים לפני האירוע · regalifnei.vercel.app
          </p>
        </div>
      )}
    </div>
  );
}
