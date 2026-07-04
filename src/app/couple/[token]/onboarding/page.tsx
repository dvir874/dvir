"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const C = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  olive:    "#6B7B5A",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  border:   "#E8E0D4",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;600&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes dotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
  @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
  @keyframes ringScale{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
`;

function BotanicalIllustration() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M110 180 Q110 140 110 100" stroke="#C5A46D" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M110 150 Q90 130 70 120" stroke="#6B7B5A" strokeWidth="1.5" fill="none"/>
      <ellipse cx="60" cy="115" rx="18" ry="10" fill="#6B7B5A" opacity="0.25" transform="rotate(-30 60 115)"/>
      <ellipse cx="75" cy="108" rx="14" ry="8" fill="#6B7B5A" opacity="0.2" transform="rotate(-20 75 108)"/>
      <path d="M110 140 Q130 120 155 112" stroke="#6B7B5A" strokeWidth="1.5" fill="none"/>
      <ellipse cx="163" cy="108" rx="18" ry="10" fill="#6B7B5A" opacity="0.25" transform="rotate(25 163 108)"/>
      <ellipse cx="148" cy="100" rx="14" ry="8" fill="#6B7B5A" opacity="0.2" transform="rotate(15 148 100)"/>
      <path d="M110 120 Q85 100 68 85" stroke="#C5A46D" strokeWidth="1" fill="none" opacity="0.4"/>
      <ellipse cx="62" cy="80" rx="15" ry="8" fill="#C5A46D" opacity="0.15" transform="rotate(-40 62 80)"/>
      <path d="M110 115 Q138 95 155 78" stroke="#C5A46D" strokeWidth="1" fill="none" opacity="0.4"/>
      <ellipse cx="160" cy="74" rx="15" ry="8" fill="#C5A46D" opacity="0.15" transform="rotate(35 160 74)"/>
      <path d="M110 100 Q108 80 106 65" stroke="#6B7B5A" strokeWidth="1.2" fill="none"/>
      <circle cx="106" cy="60" r="6" fill="#C5A46D" opacity="0.3"/>
      <circle cx="106" cy="60" r="3" fill="#C5A46D" opacity="0.5"/>
      <circle cx="67" cy="117" r="4" fill="#C5A46D" opacity="0.4"/>
      <circle cx="162" cy="110" r="4" fill="#C5A46D" opacity="0.4"/>
      <circle cx="63" cy="82" r="3" fill="#6B7B5A" opacity="0.4"/>
      <circle cx="159" cy="76" r="3" fill="#6B7B5A" opacity="0.4"/>
      <circle cx="110" cy="92" r="12" stroke="#C5A46D" strokeWidth="2" fill="none" opacity="0.6"/>
      <circle cx="110" cy="92" r="4" fill="#C5A46D" opacity="0.4"/>
    </svg>
  );
}

function RingSVG() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
         style={{ animation: "ringScale 0.6s ease both" }}>
      <circle cx="30" cy="34" r="14" stroke="#C5A46D" strokeWidth="4" fill="none"/>
      <path d="M22 20 L30 12 L38 20 L34 26 L26 26 Z" fill="#C5A46D"/>
      <path d="M26 26 L30 20 L34 26" stroke="#FDFAF5" strokeWidth="0.8" fill="none"/>
      <path d="M30 12 L30 20" stroke="#FDFAF5" strokeWidth="0.8"/>
    </svg>
  );
}

function Confetti() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 1.5,
      size: 5 + Math.random() * 6,
      color: ["#C5A46D","#F6F1E8","#6B7B5A","#FFFFFF","#E8E0D4"][i % 5],
      shape: i % 2 === 0 ? "circle" : "rect",
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`,
          top: -10,
          width:  p.shape === "circle" ? p.size : p.size * 0.6,
          height: p.shape === "circle" ? p.size : p.size * 1.4,
          borderRadius: p.shape === "circle" ? "50%" : 2,
          background: p.color,
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in both`,
        }}/>
      ))}
    </div>
  );
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={i} style={{
            width:        done ? 8 : 10,
            height:       done ? 8 : 10,
            borderRadius: "50%",
            background:   done ? C.olive : active ? C.gold : "transparent",
            border:       done ? "none" : active ? "none" : `1.5px solid ${C.border}`,
            animation:    active ? "dotPulse 1.5s infinite" : "none",
            transition:   "all 0.3s",
          }}/>
        );
      })}
    </div>
  );
}

function FloatingLabelInput({
  label, value, onChange, type = "text", min,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; min?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <label style={{
        position: "absolute", right: 14,
        top: focused || filled ? 6 : "50%",
        transform: focused || filled ? "none" : "translateY(-50%)",
        fontSize: focused || filled ? 10 : 14,
        color: focused ? C.gold : C.muted,
        transition: "all 0.2s",
        pointerEvents: "none",
        fontFamily: "Heebo, sans-serif", fontWeight: 300,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: filled || focused ? "22px 14px 8px" : "14px",
          borderRadius: 12,
          border: `1.5px solid ${focused ? C.gold : C.border}`,
          background: C.ivory,
          color: C.dark,
          fontFamily: "Heebo, sans-serif",
          fontSize: 16, outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

function GoldCTA({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "1rem",
        borderRadius: 14,
        background: disabled ? "rgba(197,164,109,0.3)" : `linear-gradient(135deg, ${C.gold}, #D4BC8A)`,
        border: "none",
        color: "#FFFFFF",
        fontFamily: "Frank Ruhl Libre, serif",
        fontSize: 17, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 6px 24px rgba(197,164,109,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        minHeight: 52,
        transition: "opacity 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function ImportCard({
  icon, label, sub, outline, selected, onClick,
}: {
  icon: string; label: string; sub?: string; outline?: boolean; selected?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", padding: "1rem 1.25rem",
        borderRadius: 14,
        border: selected
          ? `2px solid ${C.gold}`
          : outline
            ? `1.5px dashed ${C.muted}`
            : `1.5px solid ${C.border}`,
        background: selected ? `rgba(197,164,109,0.08)` : "transparent",
        display: "flex", alignItems: "center", gap: 14,
        textAlign: "right", cursor: "pointer",
        marginBottom: 10,
        boxShadow: selected ? "0 4px 16px rgba(197,164,109,0.18)" : "none",
        transition: "all 0.18s",
        minHeight: 60,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: outline ? `rgba(140,123,110,0.1)` : `rgba(107,123,90,0.15)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 20,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, color: outline ? C.muted : C.dark, margin: 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, fontWeight: 300, color: C.muted, margin: "2px 0 0" }}>{sub}</p>}
      </div>
      {selected && <span style={{ color: C.gold, fontSize: 18, flexShrink: 0 }}>✓</span>}
    </button>
  );
}

export default function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();

  const [step,        setStep]        = useState<number>(-1);
  const [mounted,     setMounted]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [brideName,    setBrideName]    = useState("");
  const [groomName,    setGroomName]    = useState("");
  const [weddingDate,  setWeddingDate]  = useState("");
  const [venueName,    setVenueName]    = useState("");
  const [importMethod, setImportMethod] = useState<string|null>(null);

  const daysLeft = weddingDate
    ? Math.ceil((new Date(weddingDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const previewName = (brideName || groomName)
    ? `חתונת ${brideName}${brideName && groomName ? " ו" : ""}${groomName}`
    : null;

  useEffect(() => {
    setMounted(true);
    fetch(`/api/couple/${token}/onboarding`)
      .then(r => r.json())
      .then(d => {
        if (d.onboarding_completed) router.replace(`/couple/${token}`);
        if (d.event?.bride_name) setBrideName(d.event.bride_name);
        if (d.event?.groom_name) setGroomName(d.event.groom_name);
      })
      .catch(() => {});
  }, [token, router]);

  function advance() { setStep(s => s + 1); }
  function back()    { setStep(s => s - 1); }

  async function finish() {
    setSaving(true);
    try {
      await fetch(`/api/couple/${token}/onboarding`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          guestCount:   150,
          style:        importMethod === "skip" ? "needs_list" : "has_list",
          fears:        [],
          moment:       "",
          manager:      "both",
          bride_name:   brideName  || undefined,
          groom_name:   groomName  || undefined,
          venue_name:   venueName  || undefined,
          date:         weddingDate || undefined,
        }),
      });
      setShowSuccess(true);
    } catch {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  /* ── Celebration (E3-S5) ─── */
  if (showSuccess) {
    return (
      <div dir="rtl" style={{
        minHeight: "100svh", background: C.ivory,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "2rem 1.5rem",
        position: "relative", overflow: "hidden",
        fontFamily: "Heebo, sans-serif",
      }}>
        <style>{CSS}</style>
        <Confetti />
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360, textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
          <div style={{ marginBottom: 20 }}><RingSVG /></div>

          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 36, color: C.dark, margin: "0 0 8px" }}>
            הכל מוכן! 🎉
          </h1>

          {previewName && (
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 28, color: C.goldText, margin: "0 0 20px" }}>
              {previewName}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 20 }}>
            <div style={{ height: 1, flex: 1, background: C.border }}/>
            <span style={{ color: C.gold, fontSize: 18 }}>✦</span>
            <div style={{ height: 1, flex: 1, background: C.border }}/>
          </div>

          {daysLeft !== null && daysLeft > 0 && (
            <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 16, color: C.muted, marginBottom: 24 }}>
              {daysLeft} ימים עד היום הגדול
            </p>
          )}

          <div style={{ background: C.cream, borderRadius: 14, padding: "16px 20px", marginBottom: 28, textAlign: "right", border: `1px solid ${C.border}` }}>
            {["פרטי החתונה נשמרו", "RSVP מוכן לשליחה", "הפלטפורמה מוכנה"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ color: C.olive, fontSize: 16, flexShrink: 0 }}>✓</span>
                <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 400, color: C.dark, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>

          <GoldCTA label="לדשבורד שלי" onClick={() => router.replace(`/couple/${token}`)} />
        </div>
      </div>
    );
  }

  /* Optional intro video (Loom/YouTube embed URL) — set to enable the "איך זה עובד" button */
  const INTRO_VIDEO_URL = "";

  /* ── Welcome (E3-S1) ─── */
  if (step === -1) {
    return (
      <div dir="rtl" style={{
        minHeight: "100svh", background: C.ivory,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "2.5rem 1.5rem",
        fontFamily: "Heebo, sans-serif",
      }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          {/* Phase 1: illustration 400ms */}
          <div style={{ marginBottom: 8, animation: "fadeUp 0.4s ease both" }}><BotanicalIllustration /></div>
          {/* Phase 2: text 400ms, 100ms delay */}
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 32, color: C.dark, margin: "0 0 12px", lineHeight: 1.25, animation: "fadeUp 0.4s ease 0.1s both" }}>
            ברוכים הבאים לרגע לפני
          </h1>
          {INTRO_VIDEO_URL && (
            <a href={INTRO_VIDEO_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "9px 18px", background: "rgba(197,164,109,0.12)", border: `1.5px solid ${C.gold}`, borderRadius: 9999, fontSize: 13, fontWeight: 600, color: "#8B6914", textDecoration: "none", fontFamily: "Heebo, sans-serif" }}>
              ▶️ 2 דקות — איך זה עובד
            </a>
          )}
          <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 18, color: C.muted, margin: "0 0 2.5rem", lineHeight: 1.6, animation: "fadeUp 0.4s ease 0.1s both" }}>
            המקום שבו חתונה הופכת לחוויה שלמה
          </p>
          {/* Phase 3: CTA 300ms, 200ms delay */}
          <div style={{ animation: "fadeUp 0.3s ease 0.2s both" }}>
            <GoldCTA label="בואו נתחיל 💍" onClick={advance} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Wizard wrapper ─── */
  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", flexDirection: "column", fontFamily: "Heebo, sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {step > 0
          ? <button onClick={back} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 24, lineHeight: 1, minHeight: 44, minWidth: 44 }}>←</button>
          : <div style={{ width: 44 }}/>}
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.gold, margin: 0 }}>רגע לפני</p>
        <div style={{ width: 44 }}/>
      </div>

      <div style={{ flex: 1, padding: "20px 20px 40px", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <ProgressDots step={step} total={4} />

        {/* Step 0 — Names (E3-S2) */}
        {step === 0 && (
          <div key="step0" style={{ animation: "fadeUp 0.3s ease both" }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 24px" }}>
              מה השמות שלכם?
            </h2>
            <FloatingLabelInput label="שם הכלה" value={brideName} onChange={setBrideName} />
            <FloatingLabelInput label="שם החתן"  value={groomName} onChange={setGroomName} />
            {previewName && (
              <div style={{ background: C.cream, border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, textAlign: "center" }}>
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: C.goldText, margin: 0 }}>
                  {previewName}
                </p>
              </div>
            )}
            <GoldCTA label="המשך" onClick={advance} disabled={brideName.length < 2 || groomName.length < 2} />
          </div>
        )}

        {/* Step 1 — Date + Venue (E3-S3) */}
        {step === 1 && (
          <div key="step1" style={{ animation: "fadeUp 0.3s ease both" }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 24px" }}>
              מתי ואיפה?
            </h2>
            <FloatingLabelInput
              label="תאריך החתונה" type="date" value={weddingDate} onChange={setWeddingDate}
              min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
            />
            <FloatingLabelInput label="שם האולם / מקום" value={venueName} onChange={setVenueName} />
            {daysLeft !== null && daysLeft > 0 && (
              <div style={{ background: C.cream, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 20px", marginBottom: 20, textAlign: "center", animation: "fadeUp 0.3s ease both" }}>
                <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, margin: 0 }}>
                  {daysLeft} ימים עד היום הגדול
                </p>
              </div>
            )}
            <GoldCTA label="המשך" onClick={advance} disabled={!weddingDate} />
          </div>
        )}

        {/* Step 2 — Guest Import (E3-S4) */}
        {step === 2 && (
          <div key="step2" style={{ animation: "fadeUp 0.3s ease both" }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 24, color: C.dark, margin: "0 0 6px" }}>
              הוסיפו את האורחים הראשונים שלכם
            </h2>
            <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, margin: "0 0 24px" }}>
              תוכלו להוסיף עוד מאוחר יותר
            </p>
            <ImportCard icon="👥" label="ייבוא מאנשי קשר"   sub="בוחרים מי נכנס — לא מעלים הכל"  selected={importMethod==="contacts"} onClick={() => setImportMethod("contacts")} />
            <ImportCard icon="📄" label="ייבוא מקובץ"        sub="Excel, Google Sheets, CSV"         selected={importMethod==="file"}     onClick={() => setImportMethod("file")} />
            <ImportCard icon="✏️" label="הכנסה ידנית"        sub="הוסיפו אחד אחד"                   selected={importMethod==="manual"}   onClick={() => setImportMethod("manual")} />
            <ImportCard icon="➡️" label="אין רשימה עדיין — דלגו לשלב הבא" outline selected={importMethod==="skip"} onClick={() => setImportMethod("skip")} />
            {!importMethod && (
              <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, textAlign: "center", margin: "0 0 12px" }}>
                בחרו אפשרות כדי להמשיך
              </p>
            )}
            <GoldCTA label={saving ? "שומר..." : "המשיכו"} onClick={finish} disabled={!importMethod || saving} />
          </div>
        )}
      </div>
    </div>
  );
}
