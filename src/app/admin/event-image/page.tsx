"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

/* Set the invitation card for one event. Deliberately a URL field rather than
   an uploader: Meta fetches the image itself on every send, so it has to live
   somewhere public anyway, and a URL is one less thing to get wrong. */

const C = { ivory:"#FDFAF5", cream:"#F6F1E8", gold:"#C5A46D", goldT:"#8B6914",
  dark:"#1C1008", muted:"rgba(28,16,8,0.55)", border:"#E8E0D4", green:"#4A7C59", red:"#B4453C" };

function EventImage() {
  const eventId = useSearchParams().get("event") ?? "";
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!eventId) return;
    const r = await fetch(`/api/admin/event-flow?event_id=${eventId}`);
    if (!r.ok) return;
    const d = await r.json();
    setName(d.event.name ?? "");
    setSaved(d.event.imageUrl ?? null);
    setUrl(d.event.imageUrl ?? "");
  }, [eventId]);
  useEffect(() => { load(); }, [load]);

  /* The card arrives on WhatsApp and lands in Downloads. Asking for an https
     URL is right — Meta fetches the image itself on every send — but there was
     nothing between that file and this field, so every event so far needed the
     image hosted somewhere else first. */
  async function upload(file: File) {
    setUploading(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("event_id", eventId);
      const r = await fetch("/api/admin/event-image/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (r.ok) { setUrl(j.url); setSaved(j.url); setMsg({ ok: true, text: "הועלה ונשמר ✓" }); }
      else setMsg({ ok: false, text: j?.error ?? "ההעלאה נכשלה" });
    } catch {
      setMsg({ ok: false, text: "ההעלאה נכשלה" });
    } finally { setUploading(false); }
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/event-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, url }),
      });
      const j = await r.json();
      setMsg(r.ok ? { ok: true, text: "נשמר ✓" } : { ok: false, text: j?.error ?? "שגיאה" });
      if (r.ok) setSaved(j.url);
    } finally { setBusy(false); }
  }

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:C.ivory, color:C.dark,
      fontFamily:"Heebo, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        input:focus{outline:none;border-color:${C.gold}!important}`}</style>

      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"14px 20px",
        display:"flex", alignItems:"center", gap:12 }}>
        <a href={`/admin/flow?event=${eventId}`} style={{ color:C.dark, display:"flex" }}><ArrowRight size={20}/></a>
        <div>
          <h1 style={{ fontFamily:"'Frank Ruhl Libre', serif", fontSize:18, fontWeight:700, margin:0 }}>
            🖼 תמונת ההזמנה
          </h1>
          {name && <p style={{ fontSize:12, color:C.muted, margin:"2px 0 0" }}>{name}</p>}
        </div>
      </div>

      <div style={{ maxWidth:620, margin:"0 auto", padding:16 }}>
        <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:14,
          padding:"14px 18px", marginBottom:18, fontSize:13.5, lineHeight:1.8, color:C.dark }}>
          זו התמונה שכל אורח יראה בראש הודעת הוואטסאפ. <b>בלעדיה המערכת מסרבת לשלוח</b> —
          כדי שלא תצא בטעות ההזמנה של זוג אחר.
          <br/>מומלץ 1125×600 פיקסלים, עד 5MB, בפורמט JPG.
        </div>

        <label style={{ display:"block", fontSize:13, color:C.muted, marginBottom:6 }}>
          כתובת התמונה (https)
        </label>
        {/* The path people actually have: a file on this machine. */}
        <label style={{ display:"block", border:`1.5px dashed ${C.gold}`, borderRadius:12,
          padding:"18px 16px", textAlign:"center", cursor:uploading?"default":"pointer",
          background:"rgba(197,164,109,0.06)", marginBottom:14 }}>
          <input type="file" accept="image/jpeg,image/png" disabled={uploading}
            onChange={e=>{ const f=e.target.files?.[0]; if (f) upload(f); e.target.value=""; }}
            style={{ display:"none" }} />
          <div style={{ fontSize:15, fontWeight:600, color:C.dark }}>
            {uploading ? "מעלה…" : "בחרו את ההזמנה מהמחשב"}
          </div>
          <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
            JPG או PNG, עד 5MB — נשמר ונקבע אוטומטית
          </div>
        </label>

        <div style={{ textAlign:"center", fontSize:12, color:C.muted, margin:"0 0 14px" }}>
          או הדביקו כתובת
        </div>

        <input value={url} onChange={e=>setUrl(e.target.value)} dir="ltr"
          placeholder="https://regalifnei.vercel.app/wedding/…jpg"
          style={{ width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:11,
            border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", background:"#fff" }}/>

        <button onClick={save} disabled={busy || !eventId}
          style={{ marginTop:12, width:"100%", padding:14, borderRadius:12, border:"none",
            background: busy ? C.border : C.gold, color:"#fff", fontSize:15.5, fontWeight:700,
            cursor: busy ? "wait" : "pointer", fontFamily:"inherit" }}>
          {busy ? "בודק ושומר…" : "שמירה"}
        </button>

        {msg && (
          <p style={{ marginTop:12, fontSize:14, fontWeight:600, color: msg.ok ? C.green : C.red }}>
            {msg.text}
          </p>
        )}

        {saved && (
          <div style={{ marginTop:22 }}>
            <p style={{ fontSize:13, color:C.muted, marginBottom:8 }}>כך זה ייראה בראש ההודעה:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={saved} alt="תמונת ההזמנה" style={{ width:"100%", borderRadius:14,
              border:`1px solid ${C.border}` }}/>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div style={{padding:40,textAlign:"center"}}>טוען…</div>}><EventImage/></Suspense>;
}
