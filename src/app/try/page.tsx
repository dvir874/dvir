"use client";

import { useState } from "react";
import Link from "next/link";

/* Live demo — the exact RSVP experience a guest gets, with mock data.
   No DB writes; pure client-side playground for prospects. */

const T = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "#8C7B6E",
  border: "#E8E0D4",
};

const MEALS = [
  { value: "regular",    label: "בשרי",      emoji: "🥩" },
  { value: "vegetarian", label: "צמחוני",    emoji: "🥕" },
  { value: "vegan",      label: "טבעוני",    emoji: "🌿" },
  { value: "kids",       label: "מנת ילדים", emoji: "🧒" },
];

export default function TryDemoPage() {
  const [step, setStep] = useState<"form" | "done">("form");
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [count, setCount] = useState(2);
  const [meal, setMeal] = useState<string | null>(null);

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Demo banner */}
      <div style={{ background: T.dark, color: "#fff", padding: "10px 16px", textAlign: "center", fontSize: 13 }}>
        👀 זו הדגמה חיה — ככה בדיוק ייראה אישור ההגעה של האורחים שלכם ·{" "}
        <Link href="/" style={{ color: "#E5C188", textDecoration: "underline" }}>חזרה לאתר</Link>
      </div>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "32px 20px 60px" }}>
        {step === "form" ? (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeUp 0.4s ease both" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 13, fontWeight: 700, color: T.goldT, letterSpacing: "0.16em", margin: "0 0 14px" }}>
                SAVE THE DATE
              </p>
              <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, color: T.dark, margin: "0 0 6px" }}>
                נועה & אורי
              </h1>
              <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>מתחתנים! 💍</p>
              <p style={{ fontSize: 14, color: T.muted, margin: "12px 0 0" }}>
                יום רביעי · 14.10.2026 · גן האירועים "עדן על המים"
              </p>
            </div>

            {/* Greeting */}
            <p style={{ textAlign: "center", fontSize: 16, fontWeight: 600, color: T.dark, marginBottom: 18 }}>
              היי משפחת ישראלי, נשמח לראותכם! 🤍
            </p>

            {/* Yes / No */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
              <button onClick={() => setChoice(c => c === "no" ? null : "no")}
                style={{ padding: "18px 12px", borderRadius: 16, cursor: "pointer", textAlign: "center", border: `2px solid ${choice === "no" ? "#B85C38" : T.border}`, background: choice === "no" ? "rgba(184,92,56,0.08)" : T.cream }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>✗</div>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, fontWeight: 700, color: choice === "no" ? "#B85C38" : T.dark, margin: 0 }}>מצטערים,<br/>לא נוכל</p>
              </button>
              <button onClick={() => setChoice(c => c === "yes" ? null : "yes")}
                style={{ padding: "18px 12px", borderRadius: 16, cursor: "pointer", textAlign: "center", border: `2px solid ${choice === "yes" ? T.gold : T.border}`, background: choice === "yes" ? T.gold : T.cream }}>
                <div style={{ fontSize: 22, marginBottom: 6, color: choice === "yes" ? "#fff" : T.dark }}>✓</div>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, fontWeight: 700, color: choice === "yes" ? "#fff" : T.dark, margin: 0 }}>כן, נשמח<br/>להגיע</p>
              </button>
            </div>

            {choice === "yes" && (
              <div style={{ animation: "fadeUp 0.3s ease both" }}>
                {/* Count */}
                <p style={{ fontSize: 14, fontWeight: 600, color: T.dark, marginBottom: 4, textAlign: "center" }}>כמות אורחים</p>
                <p style={{ fontSize: 12, fontWeight: 300, color: T.muted, marginBottom: 12, textAlign: "center" }}>כולל אתכם</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 22 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setCount(n)}
                      style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${count === n ? T.gold : T.border}`, background: count === n ? T.gold : T.cream, color: count === n ? "#fff" : T.dark, fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>
                      {n === 5 ? "5+" : n}
                    </button>
                  ))}
                </div>

                {/* Meal */}
                <p style={{ fontSize: 14, fontWeight: 600, color: T.dark, marginBottom: 12, textAlign: "center" }}>בחירת מנה</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 26 }}>
                  {MEALS.map(m => (
                    <button key={m.value} onClick={() => setMeal(x => x === m.value ? null : m.value)}
                      style={{ padding: "14px 8px", borderRadius: 14, cursor: "pointer", textAlign: "center", border: `2px solid ${meal === m.value ? T.gold : T.border}`, background: meal === m.value ? "rgba(197,164,109,0.12)" : T.cream }}>
                      <div style={{ fontSize: 26, marginBottom: 4 }}>{m.emoji}</div>
                      <p style={{ fontSize: 14, fontWeight: meal === m.value ? 600 : 400, color: meal === m.value ? T.goldT : T.dark, margin: 0 }}>{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {choice && (
              <button onClick={() => setStep("done")}
                style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: T.gold, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", boxShadow: "0 4px 12px rgba(197,164,109,0.4)", animation: "fadeUp 0.3s ease both" }}>
                {choice === "yes" ? "אישור הגעה 🎉" : "שליחת תשובה"}
              </button>
            )}
          </>
        ) : (
          /* Done */
          <div style={{ textAlign: "center", paddingTop: 24, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36, color: "#fff" }}>
              {choice === "yes" ? "✓" : "♡"}
            </div>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 700, color: T.dark, margin: "0 0 8px" }}>
              {choice === "yes" ? "נתראה בשמחות! 🥂" : "קיבלנו את תגובתכם 💛"}
            </h2>
            <p style={{ color: T.muted, fontSize: 15, margin: "0 0 28px", lineHeight: 1.7 }}>
              {choice === "yes"
                ? `${count} מקומות נשמרו · האישור הגיע לזוג בזמן אמת`
                : "הזוג קיבל עדכון — בלי שיחות טלפון מביכות"}
            </p>

            <div style={{ background: T.cream, borderRadius: 16, padding: "20px", border: `1px solid ${T.border}`, marginBottom: 24, textAlign: "right" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.goldT, margin: "0 0 10px" }}>מה עוד האורחים שלכם יקבלו:</p>
              {["📅 הוספה ליומן בלחיצה (Google + iPhone)", "🚗 ניווט Waze ישיר לאולם", "🪑 מספר השולחן שלהם לפני האירוע", "📸 העלאת תמונות לאלבום המשותף", "🎁 שליחת מתנה בביט או PayBox"].map(f => (
                <p key={f} style={{ fontSize: 14, color: T.dark, margin: "0 0 7px", lineHeight: 1.6 }}>{f}</p>
              ))}
            </div>

            <a href={`https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! ניסיתי את הדמו באתר — אשמח לשמוע עוד 🙂")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "16px", borderRadius: 12, background: T.gold, color: "#fff", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 12px rgba(197,164,109,0.4)", marginBottom: 12 }}>
              רוצים כזה לחתונה שלכם? דברו איתי 💬
            </a>
            <button onClick={() => { setStep("form"); setChoice(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 13, textDecoration: "underline", fontFamily: "'Heebo', sans-serif" }}>
              נסו שוב
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
