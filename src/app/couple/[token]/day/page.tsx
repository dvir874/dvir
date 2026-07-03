"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
};

interface SeatingTable { id: string; name: string; capacity: number }
interface SeatingAssignment { guest_id: string; table_id: string }
interface Guest { id: string; name: string; guest_count: number; status?: string }

export default function WeddingDayPage() {
  const { token } = useParams<{ token: string }>();
  const [stats, setStats] = useState<{ confirmed: number; attendees: number } | null>(null);
  const [eventName, setEventName] = useState("");
  const [galleryToken, setGalleryToken] = useState<string | null>(null);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/couple/${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.stats) setStats({ confirmed: d.stats.confirmed ?? 0, attendees: d.stats.attendees ?? 0 });
        if (d?.event?.name) setEventName(d.event.name);
      })
      .catch(() => {});
    fetch(`/api/couple/${token}/seating`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.tables) setTables(d.tables);
        if (d?.assignments) setAssignments(d.assignments);
        if (d?.guests) setGuests(d.guests);
      })
      .catch(() => {});
    fetch(`/api/couple/${token}/event`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.gallery_token) setGalleryToken(d.gallery_token); })
      .catch(() => {});
  }, [token]);

  const tableById = new Map(tables.map(t => [t.id, t.name]));
  const guestTable = (gid: string) => {
    const a = assignments.find(x => x.guest_id === gid);
    return a ? tableById.get(a.table_id) ?? null : null;
  };

  const filtered = search.trim()
    ? guests.filter(g => g.name.includes(search.trim()))
    : [];

  const galleryUrl = galleryToken && typeof window !== "undefined"
    ? `${window.location.origin}/gallery/${galleryToken}`
    : null;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "'Heebo', sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        input:focus { outline: none; border-color: ${C.gold} !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(150deg, #C5954A, #9B6E2C)`, padding: "20px" }}>
        <a href={`/couple/${token}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,240,200,0.75)", textDecoration: "none", fontSize: 13, marginBottom: 12 }}>
          <ArrowRight size={14} /> לדשבורד
        </a>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 900, color: "#FFF8EC", margin: "0 0 4px" }}>
          🎉 היום זה קורה!
        </h1>
        {eventName && <p style={{ fontSize: 14, color: "rgba(255,240,200,0.7)", margin: 0 }}>{eventName}</p>}
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Final numbers */}
        {stats && (
          <div style={{ background: C.cream, borderRadius: 20, padding: "20px", border: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
            <div>
              <p style={{ fontSize: 34, fontWeight: 900, color: C.green, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>{stats.attendees}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>אורחים מגיעים</p>
            </div>
            <div>
              <p style={{ fontSize: 34, fontWeight: 900, color: C.goldT, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>{tables.length}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>שולחנות</p>
            </div>
          </div>
        )}

        {/* Guest table lookup */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 10px" }}>🔍 איפה יושב...?</p>
          <input
            placeholder="הקלידו שם אורח"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: "'Heebo', sans-serif" }}
          />
          {filtered.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.slice(0, 6).map(g => {
                const table = guestTable(g.id);
                return (
                  <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: C.cream, borderRadius: 10, fontSize: 14 }}>
                    <span style={{ color: C.dark, fontWeight: 500 }}>{g.name}</span>
                    <span style={{ color: table ? C.goldT : C.muted, fontWeight: table ? 700 : 400 }}>
                      {table ? `🪑 ${table}` : "לא שובץ"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gallery share */}
        {galleryUrl && (
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 6px" }}>📸 גלריית האירוע</p>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px", lineHeight: 1.6 }}>
              שתפו את הקישור — האורחים מעלים תמונות בזמן אמת
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigator.clipboard?.writeText(galleryUrl)}
                style={{ flex: 1, padding: "12px", background: C.cream, color: C.goldT, border: `1.5px solid ${C.gold}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
                📋 העתיקו קישור
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`📸 מעלים תמונות מהחתונה כאן:\n${galleryUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: "12px", background: "#25D366", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Heebo', sans-serif" }}>
                💬 שתפו בוואטסאפ
              </a>
            </div>
            {galleryToken && (
              <a
                href={`/wall/${galleryToken}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, padding: "12px", background: "#1C1008", color: "#E5C188", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none", fontFamily: "'Heebo', sans-serif" }}>
                📺 קיר תמונות חי — פתחו על מסך באולם
              </a>
            )}
          </div>
        )}

        {/* Dvir hotline */}
        <a
          href={`https://wa.me/972533318177?text=${encodeURIComponent("💍 היי דביר! זה יום החתונה שלנו — צריכים עזרה דחופה")}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px", background: C.gold, color: "#fff", borderRadius: 14, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(197,164,109,0.4)" }}>
          🆘 צריכים את דביר? לחצו כאן
        </a>

        <p style={{ textAlign: "center", fontSize: 14, color: C.muted, margin: "8px 0 0", lineHeight: 1.7 }}>
          נשמו עמוק. הכל מסודר. תהנו מכל רגע 🤍
        </p>
      </div>
    </div>
  );
}
