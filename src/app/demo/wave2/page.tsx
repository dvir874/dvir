"use client";
/**
 * Wave 2 Visual Demo — CEO Review Package
 * Shows all 5 screen states with mock data for visual verification.
 * Route: /demo/wave2
 * Remove or restrict to dev-only before any sensitive deployment.
 */

import { useState } from "react";
import { Star, Camera, X, Lock, Check, ChevronLeft, ChevronRight } from "lucide-react";

const T = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  olive:    "#6B7B5A",
  border:   "#E8E0D4",
  shadowCard: "0 2px 8px rgba(28,16,8,0.06)",
  shadowCta:  "0 4px 12px rgba(197,164,109,0.4)",
} as const;

const CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
  .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  .type-card{background:#F6F1E8;border-radius:16px;border:1.5px solid #E8E0D4;padding:24px 16px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;transition:border-color .15s,transform .1s;min-height:100px}
  .type-card:hover{border-color:#C5A46D}
  .type-card:active{transform:scale(.97)}
  .star-btn{background:none;border:none;cursor:pointer;padding:4px;transition:transform .12s}
  .star-btn:hover{transform:scale(1.15)}
  .wall-item{break-inside:avoid;margin-bottom:4px}
`;

// Sample photos for gallery/wall demo
const SAMPLE_PHOTOS = [
  { id:"p1", public_url:"https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=75", uploader_name:"דנה ורון" },
  { id:"p2", public_url:"https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=75", uploader_name:"משפחת כהן" },
  { id:"p3", public_url:"https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&q=75", uploader_name:"יעל לוי" },
  { id:"p4", public_url:"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=75", uploader_name:"אבי גולן" },
  { id:"p5", public_url:"https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=75", uploader_name:"שירה ברק" },
];

const SAMPLE_BLESSINGS = [
  { id:"b1", guest_name:"דודה רחל", blessing_text:"ענבל ונדב היקרים, שתמיד תראו זה את זה בעיניים מאוהבות כמו היום. אהבה לנצח!" },
  { id:"b2", guest_name:"חברי העבודה", blessing_text:"כל הכבוד לזוג המאושר! מאחלים לכם חיים של שמחה, בריאות ואהבה." },
  { id:"b3", guest_name:"אמא של ענבל", blessing_text:"בתי היקרה, ראיתי אותך גדלה ועכשיו רואה אותך מאושרת. אין לי מילים." },
];

const MIXED_ITEMS = [
  { ...SAMPLE_PHOTOS[0], type:"photo" as const },
  { ...SAMPLE_BLESSINGS[0], type:"blessing" as const, public_url:undefined as undefined },
  { ...SAMPLE_PHOTOS[1], type:"photo" as const },
  { ...SAMPLE_PHOTOS[2], type:"photo" as const },
  { ...SAMPLE_BLESSINGS[1], type:"blessing" as const, public_url:undefined as undefined },
  { ...SAMPLE_PHOTOS[3], type:"photo" as const },
  { ...SAMPLE_BLESSINGS[2], type:"blessing" as const, public_url:undefined as undefined },
  { ...SAMPLE_PHOTOS[4], type:"photo" as const },
];

type Tab = "s6_gallery" | "s7_memory" | "s8_survey" | "s9_capsule" | "s10_wall";

export default function Wave2Demo() {
  const [tab, setTab] = useState<Tab>("s7_memory");
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [recommend, setRecommend] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const mediaItems = MIXED_ITEMS.filter(i => i.type === "photo");
  const currentPhoto = lightbox !== null ? mediaItems[lightbox] : null;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id:"s6_gallery", label:"E2-S6 גלריה", emoji:"📸" },
    { id:"s7_memory",  label:"E2-S7 העלאה", emoji:"✍️" },
    { id:"s8_survey",  label:"E2-S8 סקר", emoji:"⭐" },
    { id:"s9_capsule", label:"E2-S9 קפסולה", emoji:"🔒" },
    { id:"s10_wall",   label:"E2-S10 קיר", emoji:"🖼" },
  ];

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:"#1C1008", fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>

      {/* Top nav */}
      <div style={{ background:"rgba(28,16,8,0.95)", borderBottom:"1px solid rgba(197,164,109,0.2)", padding:"12px 16px", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(8px)" }}>
        <p style={{ color:T.gold, fontSize:"11px", fontWeight:600, letterSpacing:".1em", textAlign:"center", marginBottom:"10px" }}>
          WAVE 2 — CEO REVIEW DEMO
        </p>
        <div style={{ display:"flex", gap:"6px", overflowX:"auto", scrollbarWidth:"none", justifyContent:"center" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ flexShrink:0, padding:"8px 14px", borderRadius:"20px", border:`1px solid ${tab === t.id ? T.gold : "rgba(197,164,109,0.25)"}`, background:tab === t.id ? T.gold : "transparent", color:tab === t.id ? T.dark : "rgba(255,255,255,0.7)", fontFamily:"'Heebo',sans-serif", fontSize:"12px", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen container */}
      <div style={{ background:T.ivory }}>

        {/* ── E2-S6: Gallery populated ── */}
        {tab === "s6_gallery" && (
          <div style={{ minHeight:"100dvh", background:T.ivory }}>
            <div style={{ padding:"20px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, margin:0 }}>גלריה</h1>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"13px", color:T.muted }}>{SAMPLE_PHOTOS.length} תמונות</span>
                <div style={{ padding:"8px 16px", borderRadius:"10px", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontSize:"14px", fontWeight:600, display:"flex", alignItems:"center", gap:"6px" }}>
                  <Camera size={14}/> העלו
                </div>
              </div>
            </div>
            <p style={{ textAlign:"center", color:T.goldText, fontSize:"13px", fontWeight:600, marginBottom:"12px", letterSpacing:".03em" }}>ענבל ונדב · ט״ו בספטמבר 2026</p>

            {/* Masonry */}
            <div style={{ padding:"0 4px 100px", columnCount:2, columnGap:"4px" }}>
              {SAMPLE_PHOTOS.map((p, idx) => (
                <div key={p.id} className="wall-item" onClick={() => setLightbox(idx)} style={{ cursor:"pointer" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.public_url} alt={`תמונה מאת ${p.uploader_name}`} style={{ width:"100%", display:"block", borderRadius:"8px", filter:"sepia(0.12) saturate(1.08) brightness(1.02)" }} loading="eager"/>
                </div>
              ))}
            </div>

            {/* FAB */}
            <div style={{ position:"fixed", bottom:"24px", right:"20px", width:"56px", height:"56px", borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},#B8935A)`, boxShadow:"0 4px 16px rgba(197,164,109,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Camera size={22} color="#fff"/>
            </div>

            {/* Lightbox */}
            {lightbox !== null && currentPhoto && (
              <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(28,16,8,0.92)", display:"flex", flexDirection:"column" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px" }}>
                  <button onClick={() => setLightbox(null)} aria-label="סגור" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", display:"flex" }}><X size={24}/></button>
                  <span style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px" }}>{lightbox + 1} / {SAMPLE_PHOTOS.length}</span>
                  <div style={{ width:"32px" }}/>
                </div>
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:"0 48px" }}>
                  {lightbox > 0 && (
                    <button onClick={() => setLightbox(i => i !== null ? i - 1 : i)} style={{ position:"absolute", right:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}><ChevronRight size={20}/></button>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SAMPLE_PHOTOS[lightbox].public_url} alt="" style={{ maxWidth:"100%", maxHeight:"65dvh", objectFit:"contain", borderRadius:"8px", filter:"sepia(0.12) saturate(1.08) brightness(1.02)" }}/>
                  {lightbox < SAMPLE_PHOTOS.length - 1 && (
                    <button onClick={() => setLightbox(i => i !== null ? i + 1 : i)} style={{ position:"absolute", left:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}><ChevronLeft size={20}/></button>
                  )}
                </div>
                <div style={{ textAlign:"center", padding:"16px", color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>📷 {SAMPLE_PHOTOS[lightbox].uploader_name}</div>
              </div>
            )}
          </div>
        )}

        {/* ── E2-S7: Memory type selection ── */}
        {tab === "s7_memory" && (
          <div style={{ minHeight:"100dvh", background:T.ivory }}>
            <div style={{ textAlign:"center", padding:"40px 24px 0", animation:"fadeUp .35s ease both" }}>
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ display:"block", margin:"0 auto 20px" }} aria-hidden="true">
                <path d="M60 72 C60 72 60 40 60 12" stroke={T.olive} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M60 55 C50 48 35 50 28 42" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M60 45 C70 38 85 40 92 32" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M60 65 C53 60 42 62 36 56" stroke={T.olive} strokeWidth="1" strokeLinecap="round"/>
                <path d="M60 38 C66 32 76 34 80 28" stroke={T.olive} strokeWidth="1" strokeLinecap="round"/>
                <circle cx="60" cy="12" r="3" fill={T.gold}/>
                <circle cx="28" cy="42" r="2" fill={T.olive}/>
                <circle cx="92" cy="32" r="2" fill={T.olive}/>
                <circle cx="36" cy="56" r="1.5" fill={T.olive} opacity=".7"/>
                <circle cx="80" cy="28" r="1.5" fill={T.olive} opacity=".7"/>
              </svg>
              <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark, marginBottom:"8px" }}>מה תרצו לשתף?</h1>
              <p style={{ fontSize:"14px", fontWeight:300, color:T.muted, marginBottom:"12px" }}>תרומתכם תהפוך לחלק מזכרונות החתונה</p>
              <p style={{ fontSize:"13px", fontWeight:600, color:T.goldText, marginBottom:"24px", letterSpacing:".03em" }}>ענבל ונדב · ט״ו בספטמבר 2026</p>
            </div>
            <div style={{ padding:"0 20px 48px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", maxWidth:"400px", margin:"0 auto", animation:"fadeUp .4s ease .08s both" }}>
              {[
                { emoji:"📸", label:"תמונה" },
                { emoji:"🎥", label:"וידאו" },
                { emoji:"✍️", label:"ברכה" },
                { emoji:"💌", label:"מכתב קפסולת זמן" },
              ].map(item => (
                <button key={item.label} className="type-card">
                  <span style={{ fontSize:"40px", lineHeight:1 }}>{item.emoji}</span>
                  <span style={{ fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"16px", color:T.dark, textAlign:"center" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── E2-S8: Survey form ── */}
        {tab === "s8_survey" && (
          <div style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
            <div style={{ maxWidth:"420px", margin:"0 auto", padding:"48px 24px 80px" }}>
              <div style={{ textAlign:"center", marginBottom:"24px", animation:"fadeUp .4s ease both" }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display:"block", margin:"0 auto 16px" }} aria-hidden="true">
                  <circle cx="32" cy="32" r="20" stroke={T.olive} strokeWidth="1.2" strokeDasharray="3 2.5"/>
                  <circle cx="32" cy="12" r="2.5" fill={T.gold}/>
                  <circle cx="32" cy="52" r="2.5" fill={T.gold}/>
                  <circle cx="12" cy="32" r="1.8" fill={T.olive}/>
                  <circle cx="52" cy="32" r="1.8" fill={T.olive}/>
                </svg>
                <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"28px", fontWeight:700, color:T.dark, marginBottom:"8px" }}>תודה שהייתם איתנו ❤️</h1>
                <p style={{ fontSize:"14px", fontWeight:300, color:T.muted }}>כמה שניות שיעזרו לנו לשפר</p>
              </div>

              <div style={{ marginBottom:"28px" }}>
                <p style={{ fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"16px", textAlign:"center" }}>איך הייתה החוויה שלכם?</p>
                <div style={{ display:"flex", justifyContent:"center", gap:"8px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className="star-btn" aria-label={`${n} כוכבים`} onMouseEnter={() => setHoveredStar(n)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setStars(n)}>
                      <Star size={36} fill={(hoveredStar || stars) >= n ? T.gold : "none"} stroke={(hoveredStar || stars) >= n ? T.gold : T.border} strokeWidth={1.5}/>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:"28px" }}>
                <p style={{ fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"10px" }}>מה הייתה הרגע הכי יפה?</p>
                <div style={{ position:"relative" }}>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value.slice(0,500))} placeholder="ספרו לנו..." rows={4} style={{ width:"100%", padding:"14px 16px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.6 }}/>
                  <span style={{ position:"absolute", bottom:"10px", left:"14px", fontSize:"11px", fontWeight:300, color:T.muted }}>{feedback.length}/500</span>
                </div>
              </div>

              <div style={{ marginBottom:"32px" }}>
                <p style={{ fontSize:"16px", fontWeight:600, color:T.dark, marginBottom:"12px" }}>האם תמליצו לחברים?</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[
                    { value:"yes",     label:"בהחלט כן 😊" },
                    { value:"prob",    label:"כנראה שכן" },
                    { value:"unsure",  label:"לא בטוח" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setRecommend(opt.value)} style={{ padding:"13px 16px", borderRadius:"12px", border:`1.5px solid ${recommend === opt.value ? T.gold : T.border}`, background:recommend === opt.value ? "rgba(197,164,109,0.1)" : T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", fontWeight:recommend === opt.value ? 600 : 400, cursor:"pointer", textAlign:"right" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:"pointer", boxShadow:T.shadowCta }}>
                שלחו
              </button>
              <p style={{ textAlign:"center", fontSize:"12px", fontWeight:300, color:T.muted, marginTop:"12px" }}>התגובות שלכם נשמרות בצורה מאובטחת</p>
            </div>
          </div>
        )}

        {/* ── E2-S9: Time Capsule locked ── */}
        {tab === "s9_capsule" && (
          <div style={{ minHeight:"100dvh", background:T.ivory, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", textAlign:"center" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ display:"block", margin:"0 auto 24px" }} aria-hidden="true">
              <rect x="16" y="36" width="48" height="34" rx="8" fill="#C5A46D" fillOpacity=".15" stroke="#C5A46D" strokeWidth="2"/>
              <path d="M27 36 V26 C27 18.3 52.8 18.3 52.8 26 V36" stroke="#C5A46D" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="40" cy="53" r="5" fill="#C5A46D"/>
              <path d="M40 58 V64" stroke="#C5A46D" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>

            <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"28px", fontWeight:700, color:T.dark, marginBottom:"8px", animation:"fadeUp .4s ease both" }}>קפסולת הזמן</h1>
            <p style={{ fontSize:"64px", fontFamily:"'Frank Ruhl Libre',serif", fontWeight:900, color:T.gold, lineHeight:1, marginBottom:"4px", animation:"fadeUp .4s ease .06s both" }}>365</p>
            <p style={{ fontSize:"16px", fontWeight:300, color:T.muted, marginBottom:"32px", animation:"fadeUp .4s ease .12s both" }}>ימים עד לפתיחה</p>

            <div style={{ width:"100%", maxWidth:"360px", marginBottom:"32px" }}>
              <p style={{ fontSize:"14px", color:T.muted, marginBottom:"12px" }}>הברכות שלכם מחכות...</p>
              {[
                { name:"דנה ורון", len:35 },
                { name:"משפחת כהן", len:52 },
                { name:"יעל לוי", len:28 },
              ].map((b, i) => (
                <div key={i} style={{ background:T.cream, borderRadius:"12px", padding:"12px 14px", marginBottom:"8px", textAlign:"right", border:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:"12px", fontWeight:600, color:T.muted, display:"block", marginBottom:"4px" }}>{b.name} ❤️</span>
                  <span aria-hidden="true" style={{ fontSize:"13px", color:T.dark, filter:"blur(4px)", userSelect:"none", pointerEvents:"none", display:"block" }}>
                    {"א".repeat(b.len)}
                  </span>
                </div>
              ))}
            </div>

            <button style={{ padding:"14px 32px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:"transparent", color:T.goldText, fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", cursor:"pointer" }}>
              הוסיפו ברכה לקפסולה
            </button>
          </div>
        )}

        {/* ── E2-S10: Memory Wall ── */}
        {tab === "s10_wall" && (
          <div style={{ minHeight:"100dvh", background:T.ivory }}>
            <div style={{ padding:"24px 20px 16px", textAlign:"center" }}>
              <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark, marginBottom:"6px" }}>קיר הזכרונות</h1>
              <p style={{ fontSize:"13px", color:T.muted }}>מ-7 אורחים</p>
              <p style={{ fontSize:"13px", fontWeight:600, color:T.goldText, marginTop:"4px", letterSpacing:".03em" }}>ענבל ונדב</p>
            </div>

            <div style={{ padding:"0 4px 100px", columnCount:2, columnGap:"4px" }}>
              {MIXED_ITEMS.map((item, idx) => {
                if (item.type === "photo" && item.public_url) {
                  return (
                    <div key={item.id} className="wall-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.public_url} alt={`תמונה מאת ${item.guest_name}`} loading="lazy" style={{ width:"100%", display:"block", borderRadius:"8px", filter:"sepia(0.12) saturate(1.08) brightness(1.02)" }}/>
                    </div>
                  );
                }
                if (item.type === "blessing" && "blessing_text" in item && item.blessing_text) {
                  return (
                    <div key={item.id} className="wall-item">
                      <div style={{ background:T.cream, borderRadius:"16px", padding:"16px", border:`1px solid ${T.border}` }}>
                        <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:400, color:T.dark, lineHeight:1.6, marginBottom:"10px", display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                          {item.blessing_text}
                        </p>
                        <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"13px", fontWeight:600, color:T.muted, textAlign:"end" }}>— {item.guest_name} ❤️</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div style={{ position:"fixed", bottom:"24px", right:"20px", width:"56px", height:"56px", borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},#B8935A)`, boxShadow:"0 4px 16px rgba(197,164,109,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Camera size={22} color="#fff"/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
