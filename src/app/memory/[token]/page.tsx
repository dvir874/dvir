"use client";

import { use, useEffect, useState, useRef } from "react";
import { Upload, Loader2, Lock, X, Check } from "lucide-react";

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

interface EventInfo { name: string; date: string; address?: string | null }
type UploadType = "photo" | "video" | "blessing" | "capsule";
type Screen = "loading" | "error" | "choose" | "name" | "upload" | "blessing_write" | "capsule_write" | "done";

const CAPSULE_TYPES = [
  { value: "blessing",   label: "ברכה",  emoji: "💛" },
  { value: "advice",     label: "עצה",   emoji: "💎" },
  { value: "story",      label: "סיפור", emoji: "📖" },
  { value: "prediction", label: "תחזית", emoji: "🔮" },
];
const UNLOCK_OPTIONS = [
  { years: 1,  label: "בעוד שנה" },
  { years: 5,  label: "בעוד 5 שנים" },
  { years: 10, label: "בעוד 10 שנים" },
];

const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dotPulse { 0%,80%,100%{transform:scale(.6);opacity:.35} 40%{transform:scale(1);opacity:1} }
  .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  .type-card{background:#F6F1E8;border-radius:16px;border:1.5px solid #E8E0D4;padding:24px 16px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;transition:border-color .15s,transform .1s;min-height:100px}
  .type-card:hover{border-color:#C5A46D}
  .type-card:active{transform:scale(.97)}
  @media(prefers-reduced-motion:reduce){.type-card{transition:none}}
`;

export default function MemoryUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [screen,       setScreen]       = useState<Screen>("loading");
  const [event,        setEvent]        = useState<EventInfo | null>(null);
  const [uploadType,   setUploadType]   = useState<UploadType | null>(null);
  const [guestName,    setGuestName]    = useState("");
  const [blessing,     setBlessing]     = useState("");
  const [file,         setFile]         = useState<File | null>(null);
  const [preview,      setPreview]      = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");
  const [unlockYears,  setUnlockYears]  = useState(1);
  const [capsuleType,  setCapsuleType]  = useState("blessing");
  const [capsuleText,  setCapsuleText]  = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/memory/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setScreen("error"); return; }
        setEvent(d.event);
        setScreen("choose");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  function selectType(type: UploadType) {
    setUploadType(type);
    setScreen("name");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function proceedFromName() {
    if (!guestName.trim()) return;
    if (uploadType === "blessing") { setScreen("blessing_write"); return; }
    if (uploadType === "capsule")  { setScreen("capsule_write");  return; }
    setScreen("upload");
  }

  async function handleUpload() {
    if (!guestName.trim()) return;
    setUploading(true);
    setErrorMsg("");
    try {
      if (uploadType === "capsule") {
        if (!capsuleText.trim()) { setErrorMsg("כתבו הודעה"); setUploading(false); return; }
        const res = await fetch(`/api/memory/${token}/capsule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guest_name: guestName.trim(), message_type: capsuleType, content: capsuleText.trim(), unlock_years: unlockYears }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "שגיאה");
        setScreen("done");
        return;
      }

      const fd = new FormData();
      fd.append("guest_name", guestName.trim());

      if (uploadType === "blessing") {
        if (!blessing.trim()) { setErrorMsg("כתבו ברכה"); setUploading(false); return; }
        fd.append("type", "blessing");
        fd.append("blessing_text", blessing.trim());
      } else {
        if (!file) { setErrorMsg("בחרו קובץ"); setUploading(false); return; }
        fd.append("type", uploadType!);
        fd.append("file", file);
      }

      const res  = await fetch(`/api/memory/${token}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה בהעלאה");
      setScreen("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setUploading(false);
    }
  }

  function resetFlow() {
    setUploadType(null); setFile(null); setPreview(null);
    setBlessing(""); setErrorMsg(""); setCapsuleText("");
    setCapsuleType("blessing");
    setScreen("choose");
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { day:"numeric", month:"long", year:"numeric" })
    : "";

  // ──── Loading ────
  if (screen === "loading") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px" }}>
      <style>{CSS}</style>
      <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:900, color:T.goldText }}>רגע לפני</p>
      <div style={{ display:"flex", gap:"8px" }}>
        <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
      </div>
      <p role="status" aria-live="polite" style={{ color:T.muted, fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300 }}>
        מכינים את הדף...
      </p>
    </div>
  );

  // ──── Error ────
  if (screen === "error") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", padding:"24px", textAlign:"center" }}>
      <style>{CSS}</style>
      <div style={{ width:"56px", height:"2px", background:T.gold, margin:"0 auto 16px" }}/>
      <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"20px", fontWeight:700, color:T.dark }}>קישור לא תקין</p>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300, color:T.muted }}>פנו לזוג לקבלת קישור תקין</p>
    </div>
  );

  // ──── E2-S7: Type Selection (landing) ────
  if (screen === "choose") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>

      {/* Botanical hero */}
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

        <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark, marginBottom:"8px" }}>
          מה תרצו לשתף?
        </h1>
        <p style={{ fontSize:"14px", fontWeight:300, color:T.muted, marginBottom:"32px" }}>
          תרומתכם תהפוך לחלק מזכרונות החתונה
        </p>
        {event?.name && (
          <p style={{ fontSize:"13px", fontWeight:600, color:T.goldText, marginBottom:"24px", letterSpacing:".03em" }}>
            {event.name} · {formattedDate}
          </p>
        )}
      </div>

      {/* 2×2 type grid */}
      <div style={{ padding:"0 20px 48px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", maxWidth:"400px", margin:"0 auto", animation:"fadeUp .4s ease .08s both" }}>
        {[
          { type:"photo"   as UploadType, emoji:"📸", label:"תמונה" },
          { type:"video"   as UploadType, emoji:"🎥", label:"וידאו" },
          { type:"blessing"as UploadType, emoji:"✍️", label:"ברכה" },
          { type:"capsule" as UploadType, emoji:"💌", label:"מכתב קפסולת זמן" },
        ].map(({ type, emoji, label }) => (
          <button
            key={type}
            className="type-card"
            onClick={() => selectType(type)}
            aria-label={`שתף ${label}`}
          >
            <span style={{ fontSize:"40px", lineHeight:1 }}>{emoji}</span>
            <span style={{ fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"16px", color:T.dark, textAlign:"center" }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // ──── Name collection (after type selection) ────
  if (screen === "name") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <button onClick={resetFlow} style={{ background:"none", border:"none", cursor:"pointer", color:T.goldText, fontSize:"14px", display:"flex", alignItems:"center", gap:"4px", padding:"8px 0" }}>
          ← חזרה
        </button>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px", maxWidth:"400px", margin:"0 auto", width:"100%" }}>
        <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, marginBottom:"8px", textAlign:"center" }}>
          מה שמכם?
        </h2>
        <p style={{ fontSize:"14px", fontWeight:300, color:T.muted, textAlign:"center", marginBottom:"32px" }}>
          כדי שהזוג ידע מי שלח
        </p>
        <input
          autoFocus
          type="text"
          placeholder="שם פרטי ושם משפחה"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") proceedFromName(); }}
          style={{ width:"100%", padding:"14px 16px", borderRadius:"12px", border:`1.5px solid ${T.border}`, background:T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"16px", outline:"none", boxSizing:"border-box", marginBottom:"16px" }}
        />
        <button
          onClick={proceedFromName}
          disabled={!guestName.trim()}
          style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:guestName.trim() ? "pointer" : "not-allowed", opacity:guestName.trim() ? 1 : 0.4, boxShadow:T.shadowCta }}
        >
          המשך →
        </button>
      </div>
    </div>
  );

  // ──── Photo/Video upload ────
  if (screen === "upload") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <button onClick={() => setScreen("name")} style={{ background:"none", border:"none", cursor:"pointer", color:T.goldText, fontSize:"14px", display:"flex", alignItems:"center", gap:"4px", padding:"8px 0" }}>
          ← חזרה
        </button>
      </div>
      <div style={{ padding:"8px 20px 48px", maxWidth:"400px", margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, textAlign:"center", marginBottom:"24px" }}>
          {uploadType === "photo" ? "📸 העלו תמונה" : "🎥 העלו וידאו"}
        </h2>

        <input
          ref={fileRef}
          type="file"
          accept={uploadType === "photo" ? "image/*" : "video/*"}
          capture={uploadType === "photo" ? "environment" : undefined}
          onChange={handleFileChange}
          style={{ display:"none" }}
        />

        {preview ? (
          <div style={{ position:"relative", borderRadius:"16px", overflow:"hidden", marginBottom:"20px" }}>
            {uploadType === "photo"
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={preview} alt="" style={{ width:"100%", display:"block", borderRadius:"16px" }}/>
              : <video src={preview} controls style={{ width:"100%", display:"block", borderRadius:"16px" }}/>
            }
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              style={{ position:"absolute", top:"8px", left:"8px", background:"rgba(28,16,8,0.6)", border:"none", borderRadius:"50%", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}
            >
              <X size={16}/>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            style={{ width:"100%", padding:"48px 20px", borderRadius:"16px", border:`2px dashed ${T.border}`, background:"rgba(197,164,109,0.04)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px", marginBottom:"20px" }}
          >
            <Upload size={32} style={{ color:T.gold }}/>
            <p style={{ fontSize:"14px", color:T.muted, fontFamily:"'Heebo',sans-serif" }}>
              {uploadType === "photo" ? "בחרו תמונה מהגלריה" : "בחרו וידאו"}
            </p>
            <p style={{ fontSize:"12px", color:T.muted, fontFamily:"'Heebo',sans-serif", opacity:.6 }}>מקסימום 50MB</p>
          </button>
        )}

        {errorMsg && (
          <div style={{ padding:"12px 16px", borderRadius:"10px", background:"rgba(200,50,50,0.07)", color:"rgb(190,50,50)", fontSize:"13px", marginBottom:"16px" }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:file ? "pointer" : "not-allowed", opacity:file ? 1 : 0.4, boxShadow:T.shadowCta, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
        >
          {uploading ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>שולחים...</> : <><Upload size={18}/>שתפו עכשיו</>}
        </button>
      </div>
    </div>
  );

  // ──── Blessing writing ────
  if (screen === "blessing_write") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <button onClick={() => setScreen("name")} style={{ background:"none", border:"none", cursor:"pointer", color:T.goldText, fontSize:"14px", display:"flex", alignItems:"center", gap:"4px", padding:"8px 0" }}>
          ← חזרה
        </button>
      </div>
      <div style={{ padding:"8px 20px 48px", maxWidth:"400px", margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, textAlign:"center", marginBottom:"8px" }}>
          ✍️ כתבו ברכה
        </h2>
        <p style={{ fontSize:"13px", color:T.muted, textAlign:"center", marginBottom:"24px" }}>
          שלום {guestName}, כתבו כמה מילים לזוג המאושר
        </p>

        <textarea
          autoFocus
          value={blessing}
          onChange={e => setBlessing(e.target.value.slice(0, 500))}
          placeholder="כתבו ברכה מהלב... 💛"
          rows={6}
          style={{ width:"100%", padding:"14px 16px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", outline:"none", resize:"none", boxSizing:"border-box", marginBottom:"6px", lineHeight:1.6 }}
        />
        <p style={{ fontSize:"11px", color:T.muted, textAlign:"left", marginBottom:"20px" }}>
          {blessing.length}/500
        </p>

        {errorMsg && (
          <div style={{ padding:"12px 16px", borderRadius:"10px", background:"rgba(200,50,50,0.07)", color:"rgb(190,50,50)", fontSize:"13px", marginBottom:"16px" }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !blessing.trim()}
          style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:blessing.trim() ? "pointer" : "not-allowed", opacity:blessing.trim() ? 1 : 0.4, boxShadow:T.shadowCta, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
        >
          {uploading ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>שולחים...</> : <>שלחו ברכה 💛</>}
        </button>
      </div>
    </div>
  );

  // ──── Time Capsule writing ────
  if (screen === "capsule_write") return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <button onClick={() => setScreen("name")} style={{ background:"none", border:"none", cursor:"pointer", color:T.goldText, fontSize:"14px", display:"flex", alignItems:"center", gap:"4px", padding:"8px 0" }}>
          ← חזרה
        </button>
      </div>
      <div style={{ padding:"8px 20px 48px", maxWidth:"400px", margin:"0 auto" }}>
        <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, textAlign:"center", marginBottom:"8px" }}>
          💌 מכתב לעתיד
        </h2>
        <p style={{ fontSize:"13px", color:T.muted, textAlign:"center", marginBottom:"24px" }}>
          כתבו מכתב לזוג שיתגלה ביום השנה שלהם
        </p>

        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
          {CAPSULE_TYPES.map(ct => (
            <button
              key={ct.value}
              onClick={() => setCapsuleType(ct.value)}
              style={{ flex:1, padding:"8px 4px", borderRadius:"10px", border:`1.5px solid ${capsuleType === ct.value ? T.gold : T.border}`, background:capsuleType === ct.value ? "rgba(197,164,109,0.1)" : "transparent", fontSize:"11px", cursor:"pointer", fontFamily:"'Heebo',sans-serif", color:T.dark, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}
            >
              <span>{ct.emoji}</span>
              <span>{ct.label}</span>
            </button>
          ))}
        </div>

        <textarea
          autoFocus
          value={capsuleText}
          onChange={e => setCapsuleText(e.target.value)}
          placeholder={`כתבו ${CAPSULE_TYPES.find(c => c.value === capsuleType)?.label ?? "מכתב"} לזוג המאושר...`}
          rows={7}
          style={{ width:"100%", padding:"14px 16px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:T.cream, color:T.dark, fontFamily:"'Heebo',sans-serif", fontSize:"15px", outline:"none", resize:"none", boxSizing:"border-box", marginBottom:"16px", lineHeight:1.6 }}
        />

        <p style={{ fontSize:"13px", fontWeight:600, color:T.dark, marginBottom:"8px" }}>מתי לפתוח?</p>
        <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
          {UNLOCK_OPTIONS.map(o => (
            <button
              key={o.years}
              onClick={() => setUnlockYears(o.years)}
              style={{ flex:1, padding:"10px 4px", borderRadius:"10px", border:`1.5px solid ${unlockYears === o.years ? T.goldText : T.border}`, background:unlockYears === o.years ? "rgba(139,105,20,0.08)" : "transparent", fontSize:"12px", cursor:"pointer", fontFamily:"'Heebo',sans-serif", color:T.dark, fontWeight:unlockYears === o.years ? 600 : 400 }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ padding:"12px 16px", borderRadius:"10px", background:"rgba(200,50,50,0.07)", color:"rgb(190,50,50)", fontSize:"13px", marginBottom:"16px" }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !capsuleText.trim()}
          style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,#3D2B1F,#5C3D2E)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", cursor:capsuleText.trim() ? "pointer" : "not-allowed", opacity:capsuleText.trim() ? 1 : 0.4, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}
        >
          {uploading ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }}/>שומרים...</> : <><Lock size={18}/>נעלו את המכתב</>}
        </button>
      </div>
    </div>
  );

  // ──── Done / E2-S9 Locked State (for capsule) ────
  if (screen === "done") {
    if (uploadType === "capsule") {
      const unlockLabel = UNLOCK_OPTIONS.find(o => o.years === unlockYears)?.label ?? `בעוד ${unlockYears} שנים`;
      return (
        <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", textAlign:"center" }}>
          <style>{CSS}</style>

          {/* Gold padlock illustration */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ display:"block", margin:"0 auto 24px" }} aria-hidden="true">
            <rect x="16" y="36" width="48" height="34" rx="8" fill="#C5A46D" fillOpacity=".15" stroke="#C5A46D" strokeWidth="2"/>
            <path d="M27 36 V26 C27 18.3 52.8 18.3 52.8 26 V36" stroke="#C5A46D" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="40" cy="53" r="5" fill="#C5A46D"/>
            <path d="M40 58 V64" stroke="#C5A46D" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>

          <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"28px", fontWeight:700, color:T.dark, marginBottom:"8px", animation:"fadeUp .4s ease both" }}>
            קפסולת הזמן
          </h1>
          <p style={{ fontSize:"64px", fontFamily:"'Frank Ruhl Libre',serif", fontWeight:900, color:T.gold, lineHeight:1, marginBottom:"4px", animation:"fadeUp .4s ease .06s both" }}>
            {unlockYears === 1 ? "365" : unlockYears === 5 ? "1,825" : "3,650"}
          </p>
          <p style={{ fontSize:"16px", fontWeight:300, color:T.muted, marginBottom:"32px", animation:"fadeUp .4s ease .12s both" }}>
            ימים עד לפתיחה
          </p>

          {/* Blurred preview section (SECURITY: placeholder chars only) */}
          <div style={{ width:"100%", maxWidth:"360px", marginBottom:"32px", animation:"fadeUp .4s ease .18s both" }}>
            <p style={{ fontSize:"14px", color:T.muted, marginBottom:"12px" }}>הברכות שלכם מחכות...</p>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{ background:T.cream, borderRadius:"12px", padding:"12px 14px", marginBottom:"8px", textAlign:"right", border:`1px solid ${T.border}` }}
              >
                <span style={{ fontSize:"12px", fontWeight:600, color:T.muted, display:"block", marginBottom:"4px" }}>
                  {guestName} ❤️
                </span>
                <span
                  className="blessing-preview-content"
                  aria-hidden="true"
                  style={{ fontSize:"13px", color:T.dark, filter:"blur(4px)", userSelect:"none", pointerEvents:"none", display:"block" }}
                >
                  {"א".repeat(Math.floor(20 + i * 15))}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={resetFlow}
            style={{ padding:"14px 32px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:"transparent", color:T.goldText, fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", cursor:"pointer" }}
          >
            הוסיפו ברכה לקפסולה
          </button>
        </div>
      );
    }

    // Photo/video/blessing done
    return (
      <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", textAlign:"center" }}>
        <style>{CSS}</style>
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(107,123,90,0.12)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Check size={36} style={{ color:T.olive }}/>
        </div>
        <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"26px", fontWeight:700, color:T.dark, marginBottom:"8px", animation:"fadeUp .4s ease both" }}>
          תודה! 💛
        </h2>
        <p style={{ fontSize:"15px", fontWeight:300, color:T.muted, marginBottom:"32px", animation:"fadeUp .4s ease .08s both" }}>
          הרגע שלכם נשמר בזיכרונות החתונה
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", width:"100%", maxWidth:"360px", animation:"fadeUp .4s ease .16s both" }}>
          <button
            onClick={resetFlow}
            style={{ padding:"16px", borderRadius:"14px", border:"none", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"15px", cursor:"pointer", boxShadow:T.shadowCta }}
          >
            שתפו עוד רגע
          </button>
          <a
            href={`/memory/${token}/wall`}
            style={{ padding:"16px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:"transparent", color:T.goldText, fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", textDecoration:"none", display:"block" }}
          >
            צפו בכל הזכרונות →
          </a>
        </div>
      </div>
    );
  }

  return null;
}
