"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { buildRideBoard, introMessage } from "@/lib/rides";
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

interface Guest {
  id: string;
  name: string;
  phone?: string | null;
  status: string;
  ride_from?: string | null;
  ride_role?: "offer" | "seek" | null;
}

function waPhone(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
}

export default function RidesPage() {
  const { token } = useParams<{ token: string }>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/couple/${token}/guests`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setGuests(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const riders = useMemo(() => guests.filter(g => g.ride_role && g.ride_from), [guests]);

  /* Grouping used to be by the raw text people typed, which put "חדרה" and
     "חדרה /אולגה" in different places and hid an organised coach inside the
     carpool: eleven of sixteen "seeking" rows were the Tiberias shuttle, so the
     board claimed three times more demand than exists and matching could never
     work. buildRideBoard canonicalises the area, reads "בני ברק , רמת גן" as
     one person naming two, and keeps the coach out of the pool entirely. */
  const board = useMemo(() => buildRideBoard(riders), [riders]);

  const byCity: [string, { offers: Guest[]; seekers: Guest[] }][] = useMemo(
    () => board.areas
      .map(a => [a.area, { offers: a.drivers as Guest[], seekers: a.seekers as Guest[] }] as [string, { offers: Guest[]; seekers: Guest[] }])
      .sort((a, b) => (b[1].offers.length + b[1].seekers.length) - (a[1].offers.length + a[1].seekers.length)),
    [board],
  );

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "'Heebo', sans-serif", paddingBottom: 120 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href={`/couple/${token}`} style={{ color: C.dark, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowRight size={22} />
        </a>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: 0 }}>
          🚗 לוח טרמפים
        </h1>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען...</p>
        ) : riders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🚗</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: "0 0 6px" }}>עוד אין נתוני הגעה</p>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.7 }}>
              כשאורחים יאשרו הגעה ויסמנו שיש להם מקום ברכב<br />או שהם מחפשים טרמפ — הם יופיעו כאן לפי עיר
            </p>
          </div>
        ) : (
          <>
            {/* An organised coach is not a carpool. Kept out of the matching
                and shown with a seat count, because the eleven people on it
                made the board look three times busier than it is. */}
            {board.shuttle.map(s => (
              <div key={s.area} style={{ background: "#fff", border: `1.5px solid ${C.gold}`, borderRadius: 16, padding: "16px", marginBottom: 18 }}>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: C.dark, margin: "0 0 4px" }}>
                  🚌 {s.area}
                </p>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px" }}>
                  {s.guests.length} רשומות · {s.guests.reduce((n, g) => n + ((g as Guest & { guest_count?: number }).guest_count ?? 1), 0)} מקומות
                </p>
                {s.guests.map(g => (
                  <div key={g.id ?? g.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: C.cream, borderRadius: 10, marginBottom: 5, fontSize: 14 }}>
                    <span style={{ color: C.dark, fontWeight: 500 }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>
                      {(g as Guest & { guest_count?: number }).guest_count ?? 1} מקום
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* The introduction is sent BY the couple, who already hold both
                numbers, and names the other guest without carrying their phone
                number into a message. Whether the two then exchange numbers is
                theirs to decide — the part that should never be automatic. */}
            {board.matches.length > 0 ? (
              <div style={{ background: "rgba(74,124,89,0.08)", border: "1.5px solid rgba(74,124,89,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: "0 0 10px" }}>
                  ✨ {board.matches.length} {board.matches.length === 1 ? "התאמה" : "התאמות"} — לחצו לחבר ביניהם
                </p>
                {board.matches.map((m, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                    <p style={{ fontSize: 14, color: C.dark, margin: "0 0 8px", fontWeight: 500 }}>
                      📍 {m.area} — <strong>{m.seeker.name}</strong> מחפש/ת, ל<strong>{m.driver.name}</strong> יש מקום
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a href={`https://wa.me/${waPhone(m.seeker.phone)}?text=${encodeURIComponent(introMessage(m, "seeker"))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: 10, background: C.cream, color: C.goldT, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        💬 עדכנו את {m.seeker.name}
                      </a>
                      <a href={`https://wa.me/${waPhone(m.driver.phone)}?text=${encodeURIComponent(introMessage(m, "driver"))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: 10, background: C.cream, color: C.green, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        💬 עדכנו את {m.driver.name}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Silence here used to look like a broken feature. It is not: it
                 says which side of the pool is empty, which is the only thing
                 that can be acted on. */
              <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 4px" }}>
                  אין עדיין התאמה
                </p>
                <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
                  {board.counts.seekers} מחפשים טרמפ ו-{board.counts.drivers} מציעים מקום — אבל לא באותם יישובים.
                  {board.counts.drivers < board.counts.seekers
                    ? " שווה לשאול את האורחים מי נוסע ויש לו מקום."
                    : " שווה לשאול מי צריך טרמפ ומאיפה."}
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {byCity.map(([city, { offers, seekers }]) => (
                <div key={city} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${offers.length && seekers.length ? "rgba(74,124,89,0.4)" : C.border}`, padding: "16px" }}>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>
                    📍 {city}
                  </p>
                  {offers.length > 0 && (
                    <div style={{ marginBottom: seekers.length > 0 ? 12 : 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.green, margin: "0 0 6px" }}>🚙 יש מקום ברכב:</p>
                      {offers.map(g => (
                        <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: C.cream, borderRadius: 10, marginBottom: 5, fontSize: 14 }}>
                          <span style={{ color: C.dark, fontWeight: 500 }}>{g.name}</span>
                          {g.phone && (
                            <a href={`https://wa.me/${waPhone(g.phone)}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: "#1A9B4E", fontWeight: 600, textDecoration: "none" }}>
                              💬 וואטסאפ
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {seekers.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.goldT, margin: "0 0 6px" }}>🙋 מחפשים טרמפ:</p>
                      {seekers.map(g => (
                        <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: C.cream, borderRadius: 10, marginBottom: 5, fontSize: 14 }}>
                          <span style={{ color: C.dark, fontWeight: 500 }}>{g.name}</span>
                          {g.phone && (
                            <a href={`https://wa.me/${waPhone(g.phone)}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: "#1A9B4E", fontWeight: 600, textDecoration: "none" }}>
                              💬 וואטסאפ
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
              💡 טיפ: ראיתם התאמה? שלחו לשניהם הודעה וחברו ביניהם — האורחים יעשו את השאר
            </p>
          </>
        )}
      </div>

    </div>
  );
}
