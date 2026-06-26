"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, Heart, Sparkles, Check } from "lucide-react";

const C = {
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  border: "rgba(197,164,109,0.22)",
  muted:  "rgba(28,16,8,0.52)",
};

const TOTAL_STEPS = 7; // steps 0-6 (not counting welcome)

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ width: "100%", height: 3, borderRadius: 4, overflow: "hidden", background: "rgba(197,164,109,0.15)" }}>
      <div
        style={{
          height:     "100%",
          borderRadius: 4,
          transition: "width 0.5s ease",
          width:      `${(step / total) * 100}%`,
          background: `linear-gradient(90deg, ${C.gold}, #D4BC8A)`,
        }}
      />
    </div>
  );
}

function SelectCard({ children, selected, onClick }: {
  children: React.ReactNode; selected?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width:      "100%",
        padding:    "1rem",
        borderRadius: "1rem",
        border:     `1.5px solid ${selected ? C.gold : C.border}`,
        background: selected ? "rgba(197,164,109,0.10)" : C.ivory,
        boxShadow:  selected ? "0 4px 16px rgba(197,164,109,0.18)" : "none",
        cursor:     "pointer",
        textAlign:  "right",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

function SkipBtn({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      style={{
        display:    "block",
        width:      "100%",
        marginTop:  "0.75rem",
        padding:    "0.75rem",
        borderRadius: "0.875rem",
        background: "transparent",
        border:     "none",
        color:      C.muted,
        fontFamily: "Heebo, sans-serif",
        fontSize:   13,
        cursor:     "pointer",
        textAlign:  "center",
      }}
    >
      דלגו לעכשיו ←
    </button>
  );
}

export default function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();

  // -1 = welcome screen, 0-6 = wizard steps
  const [step,          setStep]          = useState(-1);
  const [mounted,       setMounted]       = useState(false);
  const [animating,     setAnimating]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);

  // Form values
  const [weddingDate,   setWeddingDate]   = useState("");
  const [guestCount,    setGuestCount]    = useState(150);
  const [venue,         setVenue]         = useState<"hall"|"garden"|"abroad"|"unknown">("hall");
  const [hasInvitation, setHasInvitation] = useState<boolean|null>(null);
  const [wantsRsvp,     setWantsRsvp]     = useState<boolean|null>(null);
  const [wantsBudget,   setWantsBudget]   = useState<boolean|null>(null);
  const [manager,       setManager]       = useState("both");

  useEffect(() => {
    setMounted(true);
    fetch(`/api/couple/${token}/onboarding`)
      .then(r => r.json())
      .then(d => { if (d.onboarding_completed) router.replace(`/couple/${token}`); });
  }, [token, router]);

  function advance() {
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
  }
  function back() {
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 200);
  }

  async function finish() {
    setSaving(true);
    // Map preferences to existing API fields
    const style  = hasInvitation === false ? "needs_design" : hasInvitation ? "has_design" : "";
    const fears: string[] = [];
    if (wantsRsvp)    fears.push("rsvp");
    if (wantsBudget)  fears.push("budget");
    try {
      await fetch(`/api/couple/${token}/onboarding`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ guestCount, style, fears, moment: "", manager }),
      });
      setShowSuccess(true);
    } catch {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  /* ── Success screen ─────────────────────────────────────────────────────── */
  if (showSuccess) {
    return (
      <div
        style={{
          minHeight:      "100svh",
          background:     C.cream,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "2rem 1.5rem",
        }}
        dir="rtl"
      >
        {/* Ring */}
        <div
          style={{
            width:      96,
            height:     96,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`,
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            boxShadow:  "0 12px 40px rgba(197,164,109,0.35)",
          }}
        >
          <Sparkles size={40} color="white" />
        </div>

        <h1
          style={{
            fontFamily:  "Frank Ruhl Libre, serif",
            fontSize:    28,
            fontWeight:  800,
            color:       C.dark,
            textAlign:   "center",
            marginBottom: "0.5rem",
          }}
        >
          תוכנית החתונה שלכם מוכנה ✦
        </h1>
        <p
          style={{
            fontFamily:  "Heebo, sans-serif",
            fontSize:    14,
            color:       C.muted,
            textAlign:   "center",
            lineHeight:  1.65,
            maxWidth:    300,
            marginBottom: "2rem",
          }}
        >
          הכנו עבורכם רשימת משימות מותאמת אישית ולוח זמנים.
          <br />המשימה הראשונה שלכם:
        </p>

        {/* First task card */}
        <Link
          href={`/couple/${token}/guests`}
          style={{
            width:          "100%",
            maxWidth:       360,
            display:        "flex",
            alignItems:     "center",
            gap:            "1rem",
            padding:        "1.1rem 1.25rem",
            borderRadius:   "1.125rem",
            background:     "#FFFFFF",
            border:         `1.5px solid ${C.gold}`,
            boxShadow:      "0 6px 24px rgba(197,164,109,0.18)",
            textDecoration: "none",
            marginBottom:   "1.5rem",
          }}
        >
          <span style={{ fontSize: 28 }}>👥</span>
          <div style={{ flex: 1, textAlign: "right" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 2 }}>
              הוסיפו את האורח הראשון
            </p>
            <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>
              מכאן מתחיל הכל — אפשר לייבא מאקסל
            </p>
          </div>
          <ArrowLeft size={18} style={{ color: C.gold, flexShrink: 0 }} />
        </Link>

        <button
          onClick={() => router.replace(`/couple/${token}`)}
          style={{
            fontFamily:  "Heebo, sans-serif",
            fontSize:    13,
            color:       C.muted,
            background:  "transparent",
            border:      "none",
            cursor:      "pointer",
          }}
        >
          קחו אותי ללוח הבקרה ←
        </button>
      </div>
    );
  }

  /* ── Welcome screen ─────────────────────────────────────────────────────── */
  if (step === -1) {
    return (
      <div
        style={{
          minHeight:      "100svh",
          background:     `linear-gradient(160deg, #1C1008 0%, #2E1F10 60%, #3A2A18 100%)`,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "2.5rem 1.5rem",
        }}
        dir="rtl"
      >
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.gold, fontSize: 13, letterSpacing: "0.18em", marginBottom: "2rem", opacity: 0.9 }}>
          ✦ רגע לפני
        </p>

        <div style={{ marginBottom: "1.5rem", fontSize: 64, textAlign: "center" }}>💍</div>

        <h1
          style={{
            fontFamily:  "Frank Ruhl Libre, serif",
            fontSize:    32,
            fontWeight:  900,
            color:       "#FDFAF5",
            textAlign:   "center",
            lineHeight:  1.25,
            marginBottom: "1rem",
          }}
        >
          ברוכים הבאים
          <br />
          <span style={{ color: C.gold }}>לחתונה שלכם</span>
        </h1>

        <p
          style={{
            fontFamily:  "Heebo, sans-serif",
            fontSize:    15,
            color:       "rgba(253,250,245,0.70)",
            textAlign:   "center",
            lineHeight:  1.7,
            maxWidth:    300,
            marginBottom: "2.5rem",
          }}
        >
          נשאל אתכם כמה שאלות קצרות כדי להכין תוכנית מותאמת אישית.
          <br />
          פחות מ-2 דקות.
        </p>

        <button
          onClick={advance}
          style={{
            width:         "100%",
            maxWidth:      360,
            padding:       "1.1rem",
            borderRadius:  "1rem",
            background:    `linear-gradient(135deg, ${C.gold}, #D4BC8A)`,
            border:        "none",
            color:         "#FFFFFF",
            fontFamily:    "Frank Ruhl Libre, serif",
            fontSize:      17,
            fontWeight:    700,
            cursor:        "pointer",
            display:       "flex",
            alignItems:    "center",
            justifyContent: "center",
            gap:           8,
            boxShadow:     "0 8px 32px rgba(197,164,109,0.40)",
          }}
        >
          בואו נתחיל <ArrowLeft size={18} />
        </button>

        <button
          onClick={() => finish()}
          style={{
            marginTop:   "1rem",
            background:  "transparent",
            border:      "none",
            color:       "rgba(253,250,245,0.45)",
            fontFamily:  "Heebo, sans-serif",
            fontSize:    13,
            cursor:      "pointer",
          }}
        >
          דלגו לעכשיו ←
        </button>
      </div>
    );
  }

  /* ── Step render ────────────────────────────────────────────────────────── */
  const stepContent = () => {
    switch (step) {

      /* ─── 0: Date ──────────────────────────────────────────────────────── */
      case 0: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 1 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            📅 מתי היום הגדול?
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.55 }}>
            התאריך הוא הבסיס לתוכנית שלכם — כל משימה תתוזמן בהתאם
          </p>
          <input
            type="date"
            value={weddingDate}
            onChange={e => setWeddingDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            style={{
              width:        "100%",
              padding:      "1rem 1.25rem",
              borderRadius: "1rem",
              border:       `1.5px solid ${weddingDate ? C.gold : C.border}`,
              background:   C.ivory,
              color:        C.dark,
              fontFamily:   "Heebo, sans-serif",
              fontSize:     16,
              outline:      "none",
              boxSizing:    "border-box",
            }}
          />
          <button
            onClick={advance}
            disabled={!weddingDate}
            style={{
              width:       "100%",
              marginTop:   24,
              padding:     "1rem",
              borderRadius: "1rem",
              background:  weddingDate ? `linear-gradient(135deg, ${C.gold}, #D4BC8A)` : "rgba(197,164,109,0.3)",
              border:      "none",
              color:       "#FFFFFF",
              fontFamily:  "Heebo, sans-serif",
              fontSize:    16,
              fontWeight:  600,
              cursor:      weddingDate ? "pointer" : "not-allowed",
              display:     "flex",
              alignItems:  "center",
              justifyContent: "center",
              gap:         8,
            }}
          >
            המשיכו <ArrowLeft size={18} />
          </button>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 1: Venue ─────────────────────────────────────────────────────── */
      case 1: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 2 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            🏛 היכן האירוע?
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 20 }}>
            סוג המקום משפיע על המשימות שניצור עבורכם
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: 24 }}>
            {[
              { id: "hall",    label: "אולם אירועים", emoji: "🏛️" },
              { id: "garden",  label: "גן / חוץ",      emoji: "🌿" },
              { id: "abroad",  label: "חוץ לארץ",      emoji: "✈️" },
              { id: "unknown", label: "עוד לא יודעים", emoji: "🤷" },
            ].map(v => (
              <SelectCard key={v.id} selected={venue === v.id} onClick={() => setVenue(v.id as typeof venue)}>
                <span style={{ display: "block", fontSize: 24, marginBottom: 4 }}>{v.emoji}</span>
                <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, color: C.dark }}>{v.label}</span>
              </SelectCard>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button onClick={advance} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`, border: "none", color: "#FFFFFF", fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 2: Guest count ───────────────────────────────────────────────── */
      case 2: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 3 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            👥 כמה אורחים בערך?
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 24 }}>
            אפשר לשנות אחר כך — זה רק כדי לכייל את התקציב
          </p>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 64, fontWeight: 900, color: C.gold }}>{guestCount}</span>
            <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, marginTop: 2 }}>אורחים</p>
          </div>
          <input
            type="range" min={50} max={600} step={10}
            value={guestCount}
            onChange={e => setGuestCount(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 8, accentColor: C.gold }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.muted, marginBottom: 24 }}>
            <span>600+</span><span>300</span><span>150</span><span>50</span>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button onClick={advance} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`, border: "none", color: "#FFFFFF", fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 3: Invitation ────────────────────────────────────────────────── */
      case 3: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 4 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            🎨 כבר יש לכם הזמנה?
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 24 }}>
            נוכל לעזור לכם לעצב הזמנה דיגיטלית מרשימה
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: 16 }}>
            <SelectCard selected={hasInvitation === true} onClick={() => setHasInvitation(true)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>כן, יש לנו הזמנה</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>מצוין! נוסיף אותה למערכת</p>
                </div>
              </div>
            </SelectCard>
            <SelectCard selected={hasInvitation === false} onClick={() => setHasInvitation(false)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🎨</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>עדיין לא</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>נשמח לעצב עבורכם</p>
                </div>
              </div>
            </SelectCard>
          </div>

          {/* Design service upsell — shows when they don't have invitation */}
          {hasInvitation === false && (
            <div
              style={{
                padding:      "1rem 1.25rem",
                borderRadius: "1rem",
                background:   "rgba(197,164,109,0.07)",
                border:       `1px solid ${C.border}`,
                marginBottom: 16,
              }}
            >
              <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4 }}>
                ✨ עיצוב הזמנה אישי
              </p>
              <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
                דביר מעצב הזמנות דיגיטליות יוקרתיות — ניתן לשלוח ב-WhatsApp, SMS ואימייל.
              </p>
              <a
                href={`https://wa.me/972533318177?text=${encodeURIComponent("💍 שלום! אני מתחיל להשתמש במערכת ואשמח לשמוע על עיצוב הזמנה.")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            6,
                  padding:        "6px 14px",
                  borderRadius:   20,
                  background:     C.gold,
                  color:          "#FFFFFF",
                  fontFamily:     "Heebo, sans-serif",
                  fontSize:       12,
                  fontWeight:     600,
                  textDecoration: "none",
                }}
              >
                📩 בקשו הצעת מחיר
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button onClick={advance} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`, border: "none", color: "#FFFFFF", fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 4: RSVP management ───────────────────────────────────────────── */
      case 4: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 5 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            📱 אישורי הגעה
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
            האם תרצו שנהל עבורכם את אישורי ההגעה — כולל הודעות WhatsApp אוטומטיות לאורחים?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: 24 }}>
            <SelectCard selected={wantsRsvp === true} onClick={() => setWantsRsvp(true)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>כן, תנהלו בשבילנו</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>הוספת אורחים + שליחת הודעות + מעקב</p>
                </div>
              </div>
            </SelectCard>
            <SelectCard selected={wantsRsvp === false} onClick={() => setWantsRsvp(false)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🙋</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>אנחנו נעשה זאת לבד</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>נשתמש במערכת כעזרה בלבד</p>
                </div>
              </div>
            </SelectCard>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button onClick={advance} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`, border: "none", color: "#FFFFFF", fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 5: Budget ────────────────────────────────────────────────────── */
      case 5: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 6 מתוך {TOTAL_STEPS}
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            💰 תקציב החתונה
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
            האם תרצו להתחיל לבנות תקציב מותאם למספר האורחים שלכם?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: 24 }}>
            <SelectCard selected={wantsBudget === true} onClick={() => setWantsBudget(true)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>📊</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>כן, תכינו לנו הצעת תקציב</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>לפי {guestCount} אורחים — ניתן לשנות</p>
                </div>
              </div>
            </SelectCard>
            <SelectCard selected={wantsBudget === false} onClick={() => setWantsBudget(false)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>⏭️</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 700, color: C.dark }}>לא עכשיו</p>
                  <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>אוסיף מידע בהמשך</p>
                </div>
              </div>
            </SelectCard>
          </div>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button onClick={advance} style={{ flex: 1, padding: "1rem", borderRadius: "1rem", background: `linear-gradient(135deg, ${C.gold}, #D4BC8A)`, border: "none", color: "#FFFFFF", fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
          <SkipBtn onSkip={advance} />
        </>
      );

      /* ─── 6: Manager (final) ───────────────────────────────────────────── */
      case 6: return (
        <>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
            שלב 7 מתוך {TOTAL_STEPS} — האחרון!
          </p>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
            🤝 מי מנהל את התכנון?
          </h2>
          <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted, marginBottom: 20 }}>
            נתאים את עדכוני המערכת בהתאם
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: 20 }}>
            {[
              { id: "bride",  label: "הכלה",            emoji: "👰" },
              { id: "groom",  label: "החתן",            emoji: "🤵" },
              { id: "both",   label: "שנינו ביחד",      emoji: "💑" },
              { id: "other",  label: "בן משפחה / יועץ", emoji: "🙋" },
            ].map(m => (
              <SelectCard key={m.id} selected={manager === m.id} onClick={() => setManager(m.id)}>
                <span style={{ display: "block", fontSize: 24, marginBottom: 4 }}>{m.emoji}</span>
                <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, color: C.dark }}>{m.label}</span>
              </SelectCard>
            ))}
          </div>

          {/* Summary box */}
          <div style={{ padding: "0.875rem 1rem", borderRadius: "1rem", background: "rgba(197,164,109,0.07)", border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6 }}>✦ סיכום מה שסיפרתם לנו</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                weddingDate && `📅 ${new Date(weddingDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}`,
                `👥 ${guestCount} אורחים`,
                hasInvitation === false && "🎨 מעוניינים בעיצוב הזמנה",
                hasInvitation === true  && "✅ יש הזמנה",
                wantsRsvp     && "📱 ניהול אישורי הגעה",
                wantsBudget   && "💰 הכנת תקציב",
              ].filter(Boolean).map((line, i) => (
                <p key={i} style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>{line as string}</p>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button onClick={back} style={{ padding: "1rem 1.25rem", borderRadius: "1rem", background: C.ivory, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <ArrowRight size={18} style={{ color: C.dark }} />
            </button>
            <button
              onClick={finish}
              disabled={saving}
              style={{
                flex:       1,
                padding:    "1rem",
                borderRadius: "1rem",
                background: `linear-gradient(135deg, ${C.olive}, #4A6640)`,
                border:     "none",
                color:      "#FFFFFF",
                fontFamily: "Heebo, sans-serif",
                fontSize:   15,
                fontWeight: 600,
                cursor:     saving ? "wait" : "pointer",
                display:    "flex",
                alignItems: "center",
                justifyContent: "center",
                gap:        8,
                opacity:    saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Heart size={18} />}
              {saving ? "בונה את התוכנית שלכם..." : "בנו את תוכנית החתונה ✦"}
            </button>
          </div>
        </>
      );

      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100svh", background: C.cream }} dir="rtl">
      {/* Header */}
      <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: "0.1em" }}>
              רגע לפני ✦
            </p>
            <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: C.muted }}>
              {step + 1} / {TOTAL_STEPS}
            </p>
          </div>
          <ProgressBar step={step + 1} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 1.5rem 3rem" }}>
        <div
          style={{
            maxWidth:   480,
            margin:     "0 auto",
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateX(16px)" : "none",
            transition: "opacity 0.18s ease, transform 0.18s ease",
          }}
        >
          {stepContent()}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
