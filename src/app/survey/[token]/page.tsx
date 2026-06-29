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
type FavMoment = "chuppah" | "first_dance" | "food" | "party" | null;

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
  const [blessing,   setBlessing]   = useState("");
  const [favMoment,  setFavMoment]  = useState<FavMoment>(null);
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
      const FAV_LABELS: Record<string, string> = { chuppah:"החופה", first_dance:"הריקוד הראשון", food:"הארוחה", party:"הבילוי" };
      const reviewParts: string[] = [];
      if (favMoment) reviewParts.push(`הרגע הכי אהוב: ${FAV_LABELS[favMoment]}`);
      if (blessing.trim()) reviewParts.push(blessing.trim());
      const res = await fetch(`/api/survey/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected, review_text: reviewParts.join("\n") || null }),
      });
      if (res.ok) setScreen("done");
    } catch {
      // keep form visible
    } finally {
      setSubmitting(false);
    }
  }

  const FAV_MOMENT_OPTIONS = [
    { value:"chuppah"    as FavMoment, label:"החופה" },
    { value:"first_dance"as FavMoment, label:"הריקוד הראשון" },
    { value:"food"       as FavMoment, label:"הארוחה" },
    { value:"party"      as FavMoment, label:"הבילוי" },
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

  // ──── Form (Stitch b1fbfc3b) ────
  const displayStars = hovered || selected;
  const eventDate = survey?.events?.date
    ? new Date(survey.events.date).toLocaleDateString("he-IL", { day:"numeric", month:"long", year:"numeric" })
    : "";

  const CARD: React.CSSProperties = { background:"#fff", borderRadius:24, padding:"1.5rem", boxShadow:"0 4px 20px rgba(28,16,8,0.04)", marginBottom:"1rem" };

  if (screen === "form") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:480, minHeight:"100dvh", background:T.ivory, display:"flex", flexDirection:"column" }}>

        {/* Back arrow header */}
        <header style={{ background:T.cream, padding:"0 1rem", height:64, display:"flex", alignItems:"center" }}>
          <button onClick={() => window.history.back()} aria-label="חזור"
            style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:"50%", color:T.dark, fontSize:22, minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
            ←
          </button>
        </header>

        {/* Hero section */}
        <section style={{ background:T.cream, borderRadius:"0 0 24px 24px", padding:"1rem 1.25rem 2.5rem", textAlign:"center", boxShadow:"0 4px 20px rgba(28,16,8,0.04)" }}>
          {/* Circular botanical illustration */}
          <div style={{ width:112, height:112, borderRadius:"50%", overflow:"hidden", border:"4px solid #fff", boxShadow:"0 2px 8px rgba(28,16,8,0.08)", margin:"0 auto 1.25rem", background:T.cream, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
              <ellipse cx="36" cy="50" rx="10" ry="16" stroke="#6B7B5A" strokeWidth="1.2" fill="none"/>
              <ellipse cx="24" cy="42" rx="7" ry="12" stroke="#6B7B5A" strokeWidth="1.2" fill="none" transform="rotate(-25 24 42)"/>
              <ellipse cx="48" cy="42" rx="7" ry="12" stroke="#6B7B5A" strokeWidth="1.2" fill="none" transform="rotate(25 48 42)"/>
              <circle cx="36" cy="22" r="3" fill="#C5A46D"/>
              <circle cx="22" cy="28" r="2" fill="#C5A46D"/>
              <circle cx="50" cy="28" r="2" fill="#C5A46D"/>
            </svg>
          </div>
          <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, fontSize:22, color:T.dark, marginBottom:8 }}>
            תודה שהייתם איתנו ❤️
          </h1>
          {survey?.events?.name && (
            <p style={{ fontSize:15, color:T.gold, fontWeight:500, marginBottom:4 }}>{survey.events.name}</p>
          )}
          <p style={{ fontSize:13, color:T.muted, fontWeight:300 }}>{eventDate}</p>
        </section>

        {/* Survey body */}
        <main style={{ flex:1, padding:"1.5rem 1.25rem 0" }}>
          {/* Q1: Star rating */}
          <div style={CARD}>
            <p style={{ fontSize:14, fontWeight:700, color:T.dark, marginBottom:16, letterSpacing:"0.02em" }}>
              איך הייתה החוויה?
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:"6px" }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className="star-btn"
                  aria-label={`${n} כוכב${n > 1 ? "ים" : ""}`}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                >
                  <Star size={30} fill={displayStars >= n ? T.gold : "none"} stroke={displayStars >= n ? T.gold : T.border} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Favorite moment radio */}
          <div style={CARD}>
            <p style={{ fontSize:14, fontWeight:700, color:T.dark, marginBottom:12, letterSpacing:"0.02em" }}>
              מה הרגע שהכי אהבתם?
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {FAV_MOMENT_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, cursor:"pointer", border:`1px solid ${favMoment === opt.value ? T.gold : "transparent"}`, background: favMoment === opt.value ? "rgba(197,164,109,0.08)" : "transparent" }}>
                  <input
                    type="radio"
                    name="fav_moment"
                    value={opt.value ?? ""}
                    checked={favMoment === opt.value}
                    onChange={() => setFavMoment(opt.value)}
                    style={{ accentColor:T.gold, width:18, height:18, cursor:"pointer" }}
                  />
                  <span style={{ fontSize:15, color:T.muted }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Q3: Blessing textarea */}
          <div style={{ ...CARD, marginBottom:0 }}>
            <p style={{ fontSize:14, fontWeight:700, color:T.dark, marginBottom:12, letterSpacing:"0.02em" }}>
              השאירו ברכה לזוג
            </p>
            <textarea
              value={blessing}
              onChange={e => setBlessing(e.target.value.slice(0, 500))}
              placeholder="כתבו ברכה מהלב..."
              rows={4}
              style={{ width:"100%", background:T.ivory, border:`1.5px solid ${T.border}`, borderRadius:16, padding:"14px 16px", fontFamily:"'Heebo',sans-serif", fontSize:15, color:T.dark, resize:"none", outline:"none", boxSizing:"border-box", lineHeight:1.6 }}
            />
          </div>
        </main>

        {/* Submit CTA — sticky bottom */}
        <div style={{ padding:"1.5rem 1.25rem 2rem", background:`linear-gradient(to top, ${T.ivory} 60%, transparent)`, position:"sticky", bottom:0 }}>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            style={{ width:"100%", padding:"16px", borderRadius:9999, border:"none", background:T.gold, color:T.dark, fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:16, cursor:"pointer", opacity:!selected || submitting ? 0.6 : 1, boxShadow:T.shadowCta, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          >
            {submitting ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>שולחים...</> : <>שלחו ←</>}
          </button>
        </div>
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
