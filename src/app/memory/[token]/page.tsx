"use client";

import { use, useEffect, useState, useRef } from "react";
import { Camera, MessageSquareHeart, Video, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const C = {
  cream: "#F6F1E8", ivory: "#FDFAF5", gold: "#C5A46D",
  olive: "#6B7B5A", dark: "#333333", muted: "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

interface EventInfo { name: string; date: string; address?: string | null }

type UploadType = "photo" | "video" | "blessing";
type Screen = "loading" | "error" | "name" | "choose" | "upload" | "done";

export default function MemoryUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [screen,       setScreen]       = useState<Screen>("loading");
  const [event,        setEvent]        = useState<EventInfo | null>(null);
  const [guestName,    setGuestName]    = useState("");
  const [uploadType,   setUploadType]   = useState<UploadType | null>(null);
  const [blessing,     setBlessing]     = useState("");
  const [file,         setFile]         = useState<File | null>(null);
  const [preview,      setPreview]      = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");
  const [uploadCount,  setUploadCount]  = useState(0);
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

  async function handleUpload() {
    if (!guestName.trim()) return;
    if (uploadType === "blessing" && !blessing.trim()) return;
    if ((uploadType === "photo" || uploadType === "video") && !file) return;

    setUploading(true);
    setErrorMsg("");

    const fd = new FormData();
    fd.append("guest_name", guestName.trim());
    fd.append("type", uploadType!);
    if (file)    fd.append("file", file);
    if (blessing) fd.append("blessing_text", blessing.trim());

    try {
      const res = await fetch(`/api/memory/${token}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה בהעלאה");
      setUploadCount((c) => c + 1);
      setScreen("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  }

  function resetForAnother() {
    setUploadType(null);
    setFile(null);
    setPreview(null);
    setBlessing("");
    setErrorMsg("");
    setScreen("choose");
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "";

  /* ── Screens ──────────────────────────────────────────── */

  if (screen === "loading") return (
    <Shell event={null}>
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 size={28} className="animate-spin" style={{ color: C.gold }} />
        <p style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>טוען...</p>
      </div>
    </Shell>
  );

  if (screen === "error") return (
    <Shell event={null}>
      <div className="text-center py-16">
        <AlertCircle size={36} className="mx-auto mb-4" style={{ color: C.gold }} />
        <p className="font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>קישור לא תקין</p>
        <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>פנו לזוג לקבלת קישור תקין</p>
      </div>
    </Shell>
  );

  if (screen === "name") return (
    <Shell event={event}>
      <div className="text-center mb-8">
        <p className="text-2xl mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
          שמחים שאתם כאן! 💛
        </p>
        <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          שתפו רגעים וברכות מהיום המיוחד
        </p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>
          מה השם שלכם?
        </label>
        <input
          autoFocus
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guestName.trim() && setScreen("choose")}
          placeholder="שם מלא"
          className="w-full px-4 py-3.5 rounded-2xl border text-base"
          style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif", outline: "none" }}
        />
      </div>
      <button
        onClick={() => guestName.trim() && setScreen("choose")}
        disabled={!guestName.trim()}
        className="w-full py-4 rounded-2xl font-semibold text-white text-base disabled:opacity-40 transition-all"
        style={{ background: `linear-gradient(135deg,${C.olive},#4A5E3A)`, fontFamily: "Heebo, sans-serif" }}
      >
        המשך →
      </button>
    </Shell>
  );

  if (screen === "choose") return (
    <Shell event={event}>
      <p className="text-center text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
        שלום {guestName}! מה תרצו לשתף?
      </p>
      <div className="grid grid-cols-1 gap-3">
        {([
          { type: "photo" as UploadType,   icon: Camera,              emoji: "📸", label: "תמונה", sub: "שתפו רגע מהחגיגה" },
          { type: "video" as UploadType,   icon: Video,               emoji: "🎬", label: "סרטון", sub: "הקליטו ברכה או רגע מיוחד" },
          { type: "blessing" as UploadType, icon: MessageSquareHeart, emoji: "💌", label: "ברכה", sub: "כתבו ברכה מהלב" },
        ] as { type: UploadType; icon: React.ElementType; emoji: string; label: string; sub: string }[]).map(({ type, icon: Icon, emoji, label, sub }) => (
          <button
            key={type}
            onClick={() => { setUploadType(type); setScreen("upload"); }}
            className="flex items-center gap-4 p-5 rounded-2xl text-right transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.08)" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(197,164,109,0.12)" }}>
              <Icon size={22} style={{ color: C.gold }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                {emoji} {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{sub}</p>
            </div>
            <span style={{ color: C.gold }}>←</span>
          </button>
        ))}
      </div>
    </Shell>
  );

  if (screen === "upload") return (
    <Shell event={event}>
      <button
        onClick={() => { setScreen("choose"); setFile(null); setPreview(null); setBlessing(""); }}
        className="flex items-center gap-1 text-sm mb-6"
        style={{ color: C.gold, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}
      >
        → חזרה
      </button>

      <p className="font-semibold text-lg mb-4 text-center" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
        {uploadType === "photo" ? "📸 העלו תמונה" : uploadType === "video" ? "🎬 העלו סרטון" : "💌 כתבו ברכה"}
      </p>

      {/* File upload area */}
      {(uploadType === "photo" || uploadType === "video") && (
        <div className="mb-6">
          <input
            ref={fileRef}
            type="file"
            accept={uploadType === "photo" ? "image/*" : "video/*"}
            capture={uploadType === "photo" ? "environment" : undefined}
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: uploadType === "photo" ? "4/3" : "16/9" }}>
              {uploadType === "photo" ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <video src={preview} controls className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs text-white"
                style={{ background: "rgba(0,0,0,0.5)", fontFamily: "Heebo, sans-serif" }}
              >
                החלף
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-3 py-12 rounded-2xl transition-all"
              style={{ background: "rgba(197,164,109,0.06)", border: `2px dashed ${C.border}` }}
            >
              <Upload size={32} style={{ color: C.gold }} />
              <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                {uploadType === "photo" ? "לחצו לבחירת תמונה מהגלריה או לצילום" : "לחצו לבחירת סרטון"}
              </p>
              <p className="text-xs" style={{ color: "rgba(51,51,51,0.35)", fontFamily: "Heebo, sans-serif" }}>
                מקסימום 50MB
              </p>
            </button>
          )}
        </div>
      )}

      {/* Blessing text */}
      {uploadType === "blessing" && (
        <div className="mb-6">
          <textarea
            value={blessing}
            onChange={(e) => setBlessing(e.target.value)}
            placeholder="כתבו ברכה מהלב לזוג המאושר... 💛"
            rows={6}
            className="w-full px-4 py-3.5 rounded-2xl border resize-none text-base"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif", outline: "none" }}
          />
          <p className="text-xs mt-1 text-left" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            {blessing.length} תווים
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(200,50,50,0.08)", color: "rgb(190,50,50)", fontFamily: "Heebo, sans-serif" }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={
          uploading ||
          (uploadType !== "blessing" && !file) ||
          (uploadType === "blessing" && !blessing.trim())
        }
        className="w-full py-4 rounded-2xl font-semibold text-white text-base disabled:opacity-40 flex items-center justify-center gap-2.5"
        style={{ background: `linear-gradient(135deg,${C.gold},${C.olive})`, fontFamily: "Heebo, sans-serif" }}
      >
        {uploading
          ? <><Loader2 size={18} className="animate-spin" />שולחים...</>
          : <><Upload size={18} />שתפו עכשיו</>}
      </button>
    </Shell>
  );

  if (screen === "done") return (
    <Shell event={event}>
      <div className="text-center py-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(107,123,90,0.12)" }}>
          <CheckCircle size={48} style={{ color: C.olive }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
          תודה! 💛
        </h2>
        <p className="text-sm mb-8" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          הרגע שלכם נשמר בארכיון החתונה
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={resetForAnother}
            className="w-full py-3.5 rounded-2xl font-medium text-white"
            style={{ background: `linear-gradient(135deg,${C.olive},#4A5E3A)`, fontFamily: "Heebo, sans-serif" }}
          >
            שתפו עוד רגע
          </button>
          <a
            href={`/memory/${token}/wall`}
            className="w-full py-3.5 rounded-2xl font-medium text-center block"
            style={{ background: "rgba(197,164,109,0.10)", color: C.gold, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif" }}
          >
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
    <div className="min-h-screen py-8 px-4" style={{ background: `linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)` }}>
      <div className="max-w-sm mx-auto">
        {/* Branding */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(197,164,109,0.6)", fontFamily: "Heebo, sans-serif" }}>
            רגע לפני · ארכיון זכרונות
          </p>
        </div>
        {/* Event name */}
        {event && (
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold" style={{ color: "#333", fontFamily: "Frank Ruhl Libre, serif" }}>{event.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif" }}>
              {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
