"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const C = {
  ivory:   "#FDFAF5",
  cream:   "#F6F1E8",
  gold:    "#C5A46D",
  goldText:"#8B6914",
  dark:    "#1C1008",
  muted:   "rgba(28,16,8,0.52)",
  border:  "#E8E0D4",
  olive:   "#6B7B5A",
} as const;

interface RecapData {
  total_invited:        number;
  total_arrived:        number;
  arrival_rate:         number;
  avg_response_days:    number | null;
  budget_planned:       number;
  budget_actual:        number;
  total_memories:       number;
  total_audio:          number;
  task_completion_rate: number;
  top_table_photos:     number;
}

function fmt(n: number) { return n.toLocaleString("he-IL"); }

const ACTION_CARDS = [
  { emoji: "📸", label: "הגלריה שלנו",    href: (token: string) => `/gallery/${token}` },
  { emoji: "⭐", label: "דרגו את הספקים", href: (token: string) => `/couple/${token}/vendors` },
  { emoji: "🎁", label: "מתנות",           href: (token: string) => `/couple/${token}/gifts` },
];

export default function RecapPage({ params }: { params: Promise<{ token: string }> }) {
  const { token }      = use(params);
  const [recap,        setRecap]     = useState<RecapData | null>(null);
  const [event,        setEvent]     = useState<{ name: string; date: string; hero_url?: string | null } | null>(null);
  const [loading,      setLoading]   = useState(true);
  const [error,        setError]     = useState<string | null>(null);
  const [daysUntil,    setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/couple/${token}/recap`)
      .then(async r => {
        const d = await r.json();
        if (r.status === 425) { setDaysUntil(d.daysUntil); setLoading(false); return; }
        if (!r.ok) { setError(d.error || "שגיאה"); setLoading(false); return; }
        setEvent(d.event);
        setRecap(d.recap);
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינה"); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      <Loader2 size={32} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (daysUntil !== null) return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>⏳</p>
      <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 24, color: C.dark, marginBottom: 8 }}>
        הסיכום יהיה מוכן אחרי החתונה
      </h1>
      <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 15, color: C.muted, fontWeight: 300 }}>
        עוד {daysUntil} ימים עד היום הגדול
      </p>
    </div>
  );

  if (error || !recap || !event) return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{error ?? "לא נמצא"}</p>
    </div>
  );

  const weddingDate = new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark, paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", animation: "fadeIn 0.5s ease" }}>

        {/* Hero heading */}
        <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 32, color: C.goldText, marginBottom: 8 }}>
            החתונה הייתה מושלמת ✨
          </h1>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: C.dark, fontStyle: "italic", marginBottom: 4 }}>
            {event.name}
          </p>
          <p style={{ fontSize: 14, color: C.muted, fontWeight: 300 }}>{weddingDate}</p>
        </div>

        {/* Stats row */}
        <div style={{ background: C.cream, borderRadius: 20, padding: "20px 16px", marginBottom: 24, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>👥</span>
              <span style={{ fontSize: 15, color: C.dark }}>
                <strong style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18 }}>{fmt(recap.total_arrived)}</strong>
                {" "}אורחים שמחו איתכם
              </span>
            </div>
            {recap.total_memories > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📸</span>
                <span style={{ fontSize: 15, color: C.dark }}>
                  <strong style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18 }}>{fmt(recap.total_memories)}</strong>
                  {" "}תמונות הועלו
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2×2 action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {ACTION_CARDS.map(card => (
            <a
              key={card.label}
              href={card.href(token)}
              style={{ background: C.cream, borderRadius: 20, padding: "20px 16px", border: `1px solid ${C.border}`, textDecoration: "none", color: C.dark, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}
            >
              <span style={{ fontSize: 28 }}>{card.emoji}</span>
              <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, color: C.dark }}>{card.label}</span>
            </a>
          ))}
        </div>

        {/* Couple photo hero */}
        {event.hero_url && (
          <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28, aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.hero_url} alt="תמונת החתונה" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 16, color: C.goldText, marginBottom: 6 }}>
            רגע לפני
          </p>
          <p style={{ fontSize: 13, color: C.muted, fontWeight: 300, lineHeight: 1.6 }}>
            בנינו לכם מקום לאהוב את המסע כל הדרך.
            <br />
            תודה שאפשרתם לנו להיות חלק מהיום הזה ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
