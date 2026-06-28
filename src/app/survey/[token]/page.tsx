"use client";

import { use, useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";

const T = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  olive:    "#6B7B5A",
  border:   "#E8E0D4",
  shadowCta: "0 4px 12px rgba(197,164,109,0.4)",
} as const;

type Screen = "loading" | "error" | "form" | "already_done" | "done";
type RecommendValue = "yes" | "probably" | "unsure";

interface SurveyData {
  id: string;
  rating: number | null;
  responded_at: string | null;
  ref_code_generated?: string | null;
  events: { name: string; date: string; client_name: string } | null;
}

const CSS = `
  @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
  .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .star-btn{background:none;border:none;cursor:pointer;padding:4px;transition:transform .12s}
  .star-btn:hover{transform:scale(1.15)}
`;

export default function SurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [screen,     setScreen]     = useState<Screen>("loading");
  const [survey,     setSurvey]     = useState<SurveyData | null>(null);
  const [hovered,    setHovered]    = useState(0);
  const [selected,   setSelected]   = useState(5);
  const [feedback,   setFeedback]   = useState("");
  const [recommend,  setRecommend]  = useState<RecommendValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/survey/${token}`)
      .then(r => r.json())
      .then((d: SurveyData & { error?: string }) => {
        if (d.error) { setScreen("error"); return; }
        setSurvey(d);
        setScreen(d.responded_at ? "already_done" : "form");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/survey/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected, review_text: feedback.trim() || null }),
      });
      if (res.ok) setScreen("done");
    } catch {
      // keep form visible
    } finally {
      setSubmitting(false);
    }
  }

  const RECOMMEND_OPTIONS: { value: RecommendValue; label: string }[] = [
    { value:"yes",      label:"בהחלט כן 😊" },
    { value:"probably", label:"כנראה שכן" },
    { value:"unsure",   label:"לא בטוח" },
  ];

  // ──── Loading ────
  if (screen === "loading") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px" }}>
      <style>{CSS}</style>
      <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:900, color:T.goldText }}>רגע לפני</p>
      <div style={{ display:"flex", gap:"8px" }}>
        <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
      </div>
      <p role="status" aria-live="polite" style={{ color:T.muted, fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300 }}>
        טוענים...
      </p>
    </div>
  );

  // ──── Error ────
  if (screen === "error") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", padding:"24px", textAlign:"center" }}>
      <style>{CSS}</style>
      <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"20px", fontWeight:700, color:T.dark }}>הקישור אינו תקין</p>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300, color:T.muted }}>פנו לזוג לקבלת קישור תקין</p>
    </div>
  );

  // ──── Already submitted ────
  if (screen === "already_done") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:"24px", textAlign:"center", gap:"16px" }}>
      <style>{CSS}</style>
      {/* Botanical wreath */}
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ display:"block", margin:"0 auto" }} aria-hidden="true">
        <circle cx="36" cy="36" r="22" stroke={T.olive} strokeWidth="1.2" strokeDasharray="4 3"/>
        <circle cx="36" cy="14" r="3" fill={T.gold}/>
        <circle cx="36" cy="58" r="3" fill={T.gold}/>
        <circle cx="14" cy="36" r="2" fill={T.olive}/>
        <circle cx="58" cy="36" r="2" fill={T.olive}/>
      </svg>
      <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark }}>
        כבר שלחתם לנו פידבק — תודה! 💛
      </h1>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"15px", fontWeight:300, color:T.muted }}>
        הפידבק שלכם עוזר לנו לשפר את השירות לזוגות הבאים
      </p>
    </div>
  );

  // ──── E2-S8 Form ────
  const displayStars = hovered || selected;

  if (screen === "form") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:"420px", margin:"0 auto", padding:"48px 24px 80px" }}>

        {/* Botanical wreath */}
        <div style={{ textAlign:"center", marginBottom:"24px", animation:"fadeUp .4s ease both" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display:"block", margin:"0 auto 16px" }} aria-hidden="true">
            <circle cx="32" cy="32" r="20" stroke={T.olive} strokeWidth="1.2" strokeDasharray="3 2.5"/>
            <circle cx="32" cy="12" r="2.5" fill={T.gold}/>
            <circle cx="32" cy="52" r="2.5" fill={T.gold}/>
            <circle cx="12" cy="32" r="1.8" fill={T.olive}/>
            <circle cx="52" cy="32" r="1.8" fill={T.olive}/>
          </svg>
          <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"28px", fontWeight:700, color:T.dark, marginBottom:"8px" }}>
            תודה שהייתם איתנו ❤️
          </h1>
          <p style={{ fontSize:"14px", fontWeight:300, color:T.muted }}>
            כמה שניות שיעזרו לנו לשפר
          </p>
        </div>

        {/* Star rating */}
        <div style={{ marginBottom:"28px", animation:"fadeUp .4s ease .08s both" }}>
          <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"16px", textAlign:"center" }}>
            איך הייתה החוויה שלכם?
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:"8px" }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                className="star-btn"
                aria-label={`${n} כוכב${n > 1 ? "ים" : ""}`}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(n)}
              >
                <Star
                  size={36}
                  fill={displayStars >= n ? T.gold : "none"}
                  stroke={displayStars >= n ? T.gold : T.border}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Open text */}
        <div style={{ marginBottom:"28px", animation:"fadeUp .4s ease .16s both" }}>
          <p style={{ fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"10px" }}>
            מה הייתה הרגע הכי יפה?
          </p>
          <div style={{ position:"relative" }}>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value.slice(0, 500))}
              placeholder="ספרו לנו..."
              rows={4}
              style={{ width:"100%", padding:"14px 16px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.6 }}
            />
            <span style={{ position:"absolute", bottom:"10px", left:"14px", fontSize:"11px", fontWeight:300, color:T.muted }}>
              {feedback.length}/500
            </span>
          </div>
        </div>

        {/* Recommend radio */}
        <div style={{ marginBottom:"32px", animation:"fadeUp .4s ease .24s both" }}>
          <p style={{ fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"12px" }}>
            האם תמליצו לחברים?
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {RECOMMEND_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRecommend(opt.value)}
                style={{ padding:"13px 16px", borderRadius:"12px", border:`1.5px solid ${recommend === opt.value ? T.gold : T.border}`, background:recommend === opt.value ? "rgba(197,164,109,0.1)" : T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", fontWeight:recommend === opt.value ? 600 : 400, cursor:"pointer", textAlign:"right" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:"pointer", opacity:!selected || submitting ? 0.5 : 1, boxShadow:T.shadowCta, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", animation:"fadeUp .4s ease .3s both" }}
        >
          {submitting ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>שולחים...</> : "שלחו"}
        </button>
        <p style={{ textAlign:"center", fontSize:"12px", fontWeight:300, color:T.muted, marginTop:"12px" }}>
          התגובות שלכם נשמרות בצורה מאובטחת
        </p>
      </div>
    </div>
  );

  // ──── E2-S8 Success State ────
  if (screen === "done") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:"32px 24px", textAlign:"center", gap:"16px" }}>
      <style>{CSS}</style>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display:"block", margin:"0 auto" }} aria-hidden="true">
        <circle cx="32" cy="32" r="20" stroke={T.olive} strokeWidth="1.2" strokeDasharray="3 2.5"/>
        <circle cx="32" cy="12" r="2.5" fill={T.gold}/>
        <circle cx="32" cy="52" r="2.5" fill={T.gold}/>
        <circle cx="12" cy="32" r="1.8" fill={T.olive}/>
        <circle cx="52" cy="32" r="1.8" fill={T.olive}/>
      </svg>
      <h1 role="status" aria-live="polite" style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"32px", fontWeight:700, color:T.gold }}>
        תודה! ❤️
      </h1>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"16px", fontWeight:300, color:T.muted }}>
        הפידבק שלכם יעזור לנו לשפר
      </p>
    </div>
  );

  return null;
}
