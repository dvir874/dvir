"use client";

import { use, useEffect, useState, useRef } from "react";
import { Camera, MessageSquareHeart, Video, Upload, CheckCircle, Loader2, AlertCircle, Mic, Square, Lock } from "lucide-react";

const C = {
  cream: "#F6F1E8", ivory: "#FDFAF5", gold: "#C5A46D",
  olive: "#6B7B5A", dark: "#333333", muted: "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

interface EventInfo { name: string; date: string; address?: string | null }
type UploadType = "photo" | "video" | "blessing" | "audio" | "capsule";
type Screen = "loading" | "error" | "name" | "choose" | "upload" | "audio_rec" | "capsule_write" | "done";

const CAPSULE_TYPES = [
  { value: "blessing",   label: "ברכה",   emoji: "💛" },
  { value: "advice",     label: "עצה",    emoji: "💎" },
  { value: "story",      label: "סיפור",  emoji: "📖" },
  { value: "prediction", label: "תחזית",  emoji: "🔮" },
];
const UNLOCK_OPTIONS = [
  { years: 1,  label: "בעוד שנה" },
  { years: 5,  label: "בעוד 5 שנים" },
  { years: 10, label: "בעוד 10 שנים" },
];

export default function MemoryUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [screen,        setScreen]        = useState<Screen>("loading");
  const [event,         setEvent]         = useState<EventInfo | null>(null);
  const [guestName,     setGuestName]     = useState("");
  const [uploadType,    setUploadType]    = useState<UploadType | null>(null);
  const [blessing,      setBlessing]      = useState("");
  const [file,          setFile]          = useState<File | null>(null);
  const [preview,       setPreview]       = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");
  // Audio
  const [recording,     setRecording]     = useState(false);
  const [audioBlob,     setAudioBlob]     = useState<Blob | null>(null);
  const [audioUrl,      setAudioUrl]      = useState<string | null>(null);
  const [recSeconds,    setRecSeconds]    = useState(0);
  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<BlobPart[]>([]);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  // Capsule
  const [capsuleType,   setCapsuleType]   = useState("blessing");
  const [capsuleText,   setCapsuleText]   = useState("");
  const [unlockYears,   setUnlockYears]   = useState(1);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/memory/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setScreen("error"); return; }
        setEvent(d.event);
        setScreen("name");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start(200);
      mediaRecRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => {
        if (s >= 60) { stopRecording(); return s; }
        return s + 1;
      }), 1000);
    } catch {
      setErrorMsg("לא ניתן לגשת למיקרופון — אפשרו גישה בהגדרות הדפדפן");
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
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

      if (uploadType === "audio") {
        if (!audioBlob) { setErrorMsg("הקליטו הודעה תחילה"); setUploading(false); return; }
        const ext  = audioBlob.type.includes("mp4") ? "m4a" : "webm";
        const audioFile = new File([audioBlob], `blessing.${ext}`, { type: audioBlob.type });
        fd.append("type", "audio");
        fd.append("file", audioFile);
      } else if (uploadType === "blessing") {
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

  function resetForAnother() {
    setUploadType(null); setFile(null); setPreview(null); setBlessing(""); setErrorMsg("");
    setAudioBlob(null); setAudioUrl(null); setRecSeconds(0); setCapsuleText(""); setCapsuleType("blessing");
    setScreen("choose");
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "";

  if (screen === "loading") return <Shell event={null}><div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><Loader2 size={28} style={{ color: C.gold, animation: "spin 1s linear infinite" }} /></div></Shell>;

  if (screen === "error") return (
    <Shell event={null}>
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <AlertCircle size={36} style={{ color: C.gold, margin: "0 auto 1rem" }} />
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>קישור לא תקין</p>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>פנו לזוג לקבלת קישור תקין</p>
      </div>
    </Shell>
  );

  if (screen === "name") return (
    <Shell event={event}>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.4rem", color: C.dark, marginBottom: "0.25rem" }}>שמחים שאתם כאן! 💛</p>
        <p style={{ fontSize: 13, color: C.muted }}>שתפו רגעים וברכות מהיום המיוחד</p>
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.dark, marginBottom: "0.5rem" }}>מה השם שלכם?</label>
        <input autoFocus value={guestName} onChange={(e) => setGuestName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guestName.trim() && setScreen("choose")}
          placeholder="שם מלא"
          style={{ width: "100%", padding: "0.875rem 1rem", borderRadius: 16, border: `1px solid ${C.border}`, background: C.ivory, color: C.dark, fontFamily: "Heebo, sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
      </div>
      <button onClick={() => guestName.trim() && setScreen("choose")} disabled={!guestName.trim()}
        style={{ width: "100%", padding: "1rem", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.olive}, #4A5E3A)`, color: "white", fontSize: 15, fontFamily: "Heebo, sans-serif", cursor: "pointer", opacity: !guestName.trim() ? 0.4 : 1 }}>
        המשך →
      </button>
    </Shell>
  );

  if (screen === "choose") return (
    <Shell event={event}>
      <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginBottom: "1.25rem" }}>שלום {guestName}! מה תרצו לשתף?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {([
          { type: "photo" as UploadType,   icon: Camera,             emoji: "📸", label: "תמונה",          sub: "שתפו רגע מהחגיגה" },
          { type: "video" as UploadType,   icon: Video,              emoji: "🎬", label: "סרטון",          sub: "הקליטו רגע מיוחד" },
          { type: "blessing" as UploadType,icon: MessageSquareHeart, emoji: "💌", label: "ברכה כתובה",    sub: "כתבו ברכה מהלב" },
          { type: "audio" as UploadType,   icon: Mic,                emoji: "🎙️", label: "ברכה קולית",    sub: "הקליטו עד דקה אחת" },
          { type: "capsule" as UploadType, icon: Lock,               emoji: "⏳", label: "הודעה לעתיד",   sub: "תיפתח בשנה הבאה ומעלה" },
        ] as { type: UploadType; icon: React.ElementType; emoji: string; label: string; sub: string }[]).map(({ type, icon: Icon, emoji, label, sub }) => (
          <button key={type} onClick={() => {
            setUploadType(type);
            setScreen(type === "audio" ? "audio_rec" : type === "capsule" ? "capsule_write" : "upload");
          }}
            style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderRadius: 16, border: `1px solid ${C.border}`, background: C.ivory, cursor: "pointer", textAlign: "right" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(197,164,109,0.12)", flexShrink: 0 }}>
              <Icon size={20} style={{ color: C.gold }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{emoji} {label}</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: "Heebo, sans-serif" }}>{sub}</p>
            </div>
            <span style={{ color: C.gold, fontSize: 16 }}>←</span>
          </button>
        ))}
      </div>
    </Shell>
  );

  if (screen === "audio_rec") return (
    <Shell event={event}>
      <button onClick={() => { setScreen("choose"); setAudioBlob(null); setAudioUrl(null); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontFamily: "Heebo, sans-serif", fontSize: 13, marginBottom: "1.25rem" }}>→ חזרה</button>
      <p style={{ textAlign: "center", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", color: C.dark, marginBottom: "1.5rem" }}>🎙️ ברכה קולית</p>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        {/* Timer display */}
        <div style={{ fontSize: "3rem", fontFamily: "Frank Ruhl Libre, serif", color: recording ? "#C0392B" : C.dark, lineHeight: 1, marginBottom: "0.5rem" }}>
          {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:{String(recSeconds % 60).padStart(2, "0")}
        </div>
        {recording && <p style={{ fontSize: 12, color: C.muted }}>מקליט... {60 - recSeconds} שניות נותרו</p>}
      </div>
      {!audioBlob ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          {!recording ? (
            <button onClick={startRecording}
              style={{ width: 80, height: 80, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, #C0392B, #922B21)`, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={30} />
            </button>
          ) : (
            <button onClick={stopRecording}
              style={{ width: 80, height: 80, borderRadius: "50%", border: "none", background: "#C0392B", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1s infinite" }}>
              <Square size={28} />
            </button>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "1.5rem" }}>
          {audioUrl && <audio src={audioUrl} controls style={{ width: "100%", borderRadius: 12, marginBottom: "0.75rem" }} />}
          <button onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecSeconds(0); }}
            style={{ width: "100%", padding: "0.6rem", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", fontFamily: "Heebo, sans-serif", fontSize: 13, cursor: "pointer", color: C.muted }}>
            הקלט מחדש
          </button>
        </div>
      )}
      {errorMsg && <p style={{ textAlign: "center", fontSize: 12, color: "#C0392B", marginBottom: "0.75rem" }}>{errorMsg}</p>}
      <button onClick={handleUpload} disabled={uploading || !audioBlob}
        style={{ width: "100%", padding: "1rem", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.olive})`, color: "white", fontSize: 15, fontFamily: "Heebo, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !audioBlob ? 0.4 : 1 }}>
        {uploading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />שולחים...</> : <><Upload size={18} />שתפו את הברכה</>}
      </button>
    </Shell>
  );

  if (screen === "capsule_write") return (
    <Shell event={event}>
      <button onClick={() => setScreen("choose")}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontFamily: "Heebo, sans-serif", fontSize: 13, marginBottom: "1.25rem" }}>→ חזרה</button>
      <p style={{ textAlign: "center", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", color: C.dark, marginBottom: "0.5rem" }}>⏳ הודעה לעתיד</p>
      <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginBottom: "1.5rem" }}>כתבו הודעה שתיפתח בעתיד</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {CAPSULE_TYPES.map(t => (
          <button key={t.value} onClick={() => setCapsuleType(t.value)}
            style={{ flex: 1, padding: "0.5rem 0.25rem", borderRadius: 10, border: `1.5px solid ${capsuleType === t.value ? C.gold : C.border}`, background: capsuleType === t.value ? "rgba(197,164,109,0.1)" : "transparent", fontSize: 11, cursor: "pointer", fontFamily: "Heebo, sans-serif", color: C.dark, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <textarea value={capsuleText} onChange={(e) => setCapsuleText(e.target.value)}
        placeholder={`כתבו ${CAPSULE_TYPES.find(t => t.value === capsuleType)?.label ?? "הודעה"} לזוג המאושר...`}
        rows={6} style={{ width: "100%", padding: "0.875rem 1rem", borderRadius: 16, border: `1px solid ${C.border}`, background: C.ivory, color: C.dark, fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: "1rem" }} />

      <p style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: "0.5rem" }}>מתי לפתוח?</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {UNLOCK_OPTIONS.map(o => (
          <button key={o.years} onClick={() => setUnlockYears(o.years)}
            style={{ flex: 1, padding: "0.65rem 0.25rem", borderRadius: 10, border: `1.5px solid ${unlockYears === o.years ? C.olive : C.border}`, background: unlockYears === o.years ? "rgba(107,123,90,0.1)" : "transparent", fontSize: 12, cursor: "pointer", fontFamily: "Heebo, sans-serif", color: C.dark }}>
            {o.label}
          </button>
        ))}
      </div>

      {errorMsg && <p style={{ fontSize: 12, color: "#C0392B", marginBottom: "0.75rem" }}>{errorMsg}</p>}
      <button onClick={handleUpload} disabled={uploading || !capsuleText.trim()}
        style={{ width: "100%", padding: "1rem", borderRadius: 16, border: "none", background: `linear-gradient(135deg, #3D2B1F, #5C3D2E)`, color: "white", fontSize: 15, fontFamily: "Heebo, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !capsuleText.trim() ? 0.4 : 1 }}>
        {uploading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />שומרים...</> : <><Lock size={18} />נעלו את ההודעה</>}
      </button>
    </Shell>
  );

  if (screen === "upload") return (
    <Shell event={event}>
      <button onClick={() => { setScreen("choose"); setFile(null); setPreview(null); setBlessing(""); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontFamily: "Heebo, sans-serif", fontSize: 13, marginBottom: "1.25rem" }}>→ חזרה</button>
      <p style={{ textAlign: "center", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", color: C.dark, marginBottom: "1.25rem" }}>
        {uploadType === "photo" ? "📸 העלו תמונה" : uploadType === "video" ? "🎬 העלו סרטון" : "💌 כתבו ברכה"}
      </p>
      <input ref={fileRef} type="file" accept={uploadType === "photo" ? "image/*" : "video/*"}
        capture={uploadType === "photo" ? "environment" : undefined}
        onChange={handleFileChange} style={{ display: "none" }} />

      {(uploadType === "photo" || uploadType === "video") && (
        <div style={{ marginBottom: "1.25rem" }}>
          {preview ? (
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: "0.75rem", aspectRatio: uploadType === "photo" ? "4/3" : "16/9" }}>
              {uploadType === "photo"
                ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <video src={preview} controls style={{ width: "100%", height: "100%" }} />}
              <button onClick={() => { setFile(null); setPreview(null); }}
                style={{ position: "absolute", top: 8, left: 8, padding: "4px 10px", borderRadius: 20, background: "rgba(0,0,0,0.5)", border: "none", color: "white", fontSize: 11, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                החלף
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              style={{ width: "100%", padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`, background: "rgba(197,164,109,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <Upload size={32} style={{ color: C.gold }} />
              <p style={{ fontSize: 13, color: C.muted, fontFamily: "Heebo, sans-serif" }}>{uploadType === "photo" ? "לחצו לבחירת תמונה" : "לחצו לבחירת סרטון"}</p>
              <p style={{ fontSize: 11, color: "rgba(51,51,51,0.35)", fontFamily: "Heebo, sans-serif" }}>מקסימום 50MB</p>
            </button>
          )}
        </div>
      )}

      {uploadType === "blessing" && (
        <div style={{ marginBottom: "1.25rem" }}>
          <textarea value={blessing} onChange={(e) => setBlessing(e.target.value)}
            placeholder="כתבו ברכה מהלב לזוג המאושר... 💛" rows={6}
            style={{ width: "100%", padding: "0.875rem 1rem", borderRadius: 16, border: `1px solid ${C.border}`, background: C.ivory, color: C.dark, fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box" }} />
          <p style={{ fontSize: 11, color: C.muted, textAlign: "left", marginTop: 2 }}>{blessing.length} תווים</p>
        </div>
      )}

      {errorMsg && <div style={{ padding: "0.75rem 1rem", borderRadius: 10, background: "rgba(200,50,50,0.07)", color: "rgb(190,50,50)", fontSize: 13, fontFamily: "Heebo, sans-serif", marginBottom: "0.875rem" }}>{errorMsg}</div>}

      <button onClick={handleUpload}
        disabled={uploading || (uploadType !== "blessing" && !file) || (uploadType === "blessing" && !blessing.trim())}
        style={{ width: "100%", padding: "1rem", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.olive})`, color: "white", fontSize: 15, fontFamily: "Heebo, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: ((uploadType !== "blessing" && !file) || (uploadType === "blessing" && !blessing.trim())) ? 0.4 : 1 }}>
        {uploading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />שולחים...</> : <><Upload size={18} />שתפו עכשיו</>}
      </button>
    </Shell>
  );

  if (screen === "done") return (
    <Shell event={event}>
      <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(107,123,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          {uploadType === "capsule"
            ? <Lock size={36} style={{ color: C.olive }} />
            : <CheckCircle size={40} style={{ color: C.olive }} />}
        </div>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", color: C.dark, marginBottom: "0.5rem" }}>
          {uploadType === "capsule" ? "ההודעה ננעלה! ⏳" : "תודה! 💛"}
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.75rem" }}>
          {uploadType === "capsule"
            ? `ההודעה תיפתח בעוד ${unlockYears} ${unlockYears === 1 ? "שנה" : "שנים"}`
            : "הרגע שלכם נשמר בארכיון החתונה"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button onClick={resetForAnother}
            style={{ padding: "0.875rem", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.olive}, #4A5E3A)`, color: "white", fontSize: 14, fontFamily: "Heebo, sans-serif", cursor: "pointer" }}>
            שתפו עוד רגע
          </button>
          <a href={`/memory/${token}/wall`}
            style={{ padding: "0.875rem", borderRadius: 16, border: `1px solid ${C.border}`, background: "rgba(197,164,109,0.08)", color: C.gold, fontSize: 14, fontFamily: "Heebo, sans-serif", textDecoration: "none", textAlign: "center", display: "block" }}>
            צפו בכל הזכרונות →
          </a>
        </div>
      </div>
    </Shell>
  );

  return null;
}

function Shell({ event, children }: { event: EventInfo | null; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem 3rem", background: `linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)` }}>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(197,164,109,0.6)", fontFamily: "Heebo, sans-serif" }}>
            רגע לפני · ארכיון זכרונות
          </p>
        </div>
        {event && (
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", fontWeight: 700, color: "#333" }}>{event.name}</h1>
            <p style={{ fontSize: 11, color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif", marginTop: 2 }}>
              {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
