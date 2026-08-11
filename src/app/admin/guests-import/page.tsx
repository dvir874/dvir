"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Upload } from "lucide-react";

/* Guest list import with a mandatory look-before-you-leap step.

   Importing 550 people into a live event is irreversible in practice, and the
   two real failures we hit — the same guest in two phone formats, and rows
   silently dropped — are both invisible unless you show them first. So the
   file is always parsed and reported before anything is written. */

const C = { ivory:"#FDFAF5", cream:"#F6F1E8", gold:"#C5A46D", goldT:"#8B6914",
  dark:"#1C1008", muted:"rgba(28,16,8,0.55)", border:"#E8E0D4", green:"#4A7C59", red:"#B4453C" };

interface Report {
  rowsInFile: number; toImport: number; rejectedCount: number;
  rejected: { row:number; name:string; phone:string; reason:string }[];
  preview: { name:string; phone:string; guest_count:number }[];
  imported?: number; error?: string;
}

function Import() {
  const eventId = useSearchParams().get("event") ?? "";
  const [file, setFile] = useState<File | null>(null);
  const [group, setGroup] = useState("");
  const [rep, setRep] = useState<Report | null>(null);
  const [busy, setBusy] = useState<"check" | "import" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const send = useCallback(async (dry: boolean) => {
    if (!file || !eventId) return;
    setBusy(dry ? "check" : "import"); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("event_id", eventId);
      if (group.trim()) fd.append("source_group", group.trim());
      if (dry) fd.append("dry_run", "1");
      const r = await fetch("/api/guests/import", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) { setErr(j?.error ?? "שגיאה"); setRep(j?.rowsInFile ? j : null); }
      else setRep(j);
    } catch { setErr("ההעלאה נכשלה"); }
    finally { setBusy(null); }
  }, [file, eventId, group]);

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:C.ivory, color:C.dark,
      fontFamily:"Heebo, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"14px 20px",
        display:"flex", alignItems:"center", gap:12 }}>
        <a href={`/admin/flow?event=${eventId}`} style={{ color:C.dark, display:"flex" }}><ArrowRight size={20}/></a>
        <h1 style={{ fontFamily:"'Frank Ruhl Libre', serif", fontSize:18, fontWeight:700, margin:0 }}>
          📋 ייבוא רשימת מוזמנים
        </h1>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:16 }}>
        <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:14,
          padding:"14px 18px", marginBottom:18, fontSize:13.5, lineHeight:1.8 }}>
          קובץ אקסל או CSV עם העמודות: <b>שם · טלפון · כמות אורחים</b>.
          <br/>המערכת מנרמלת כל מספר לפורמט אחיד, מזהה כפילויות מול הרשימה הקיימת,
          ומראה בדיוק מה נדחה — <b>לפני</b> שמייבאים.
        </div>

        <label style={{ display:"block", padding:"22px", borderRadius:14, cursor:"pointer",
          border:`2px dashed ${file ? C.gold : C.border}`, background:"#fff", textAlign:"center" }}>
          <input type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }}
            onChange={e=>{ setFile(e.target.files?.[0] ?? null); setRep(null); setErr(null); }}/>
          <Upload size={22} style={{ color:C.gold }}/>
          <p style={{ margin:"8px 0 0", fontSize:14.5, fontWeight:600 }}>
            {file ? file.name : "בחרו קובץ אקסל"}
          </p>
        </label>

        <input value={group} onChange={e=>setGroup(e.target.value)}
          placeholder="שיוך לקבוצה (אופציונלי) — למשל: צד הכלה"
          style={{ width:"100%", boxSizing:"border-box", marginTop:12, padding:"11px 14px",
            borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit" }}/>

        <button onClick={()=>send(true)} disabled={!file || !!busy}
          style={{ marginTop:12, width:"100%", padding:14, borderRadius:12, border:"none",
            background: !file || busy ? C.border : C.goldT, color:"#fff", fontSize:15.5,
            fontWeight:700, cursor: !file || busy ? "default":"pointer", fontFamily:"inherit" }}>
          {busy==="check" ? "בודק…" : "בדיקה לפני ייבוא"}
        </button>

        {err && <p style={{ marginTop:12, color:C.red, fontSize:14, fontWeight:600 }}>{err}</p>}

        {rep && (
          <div style={{ marginTop:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
              {[{k:"שורות בקובץ",v:rep.rowsInFile,c:C.dark},
                {k:"לייבוא",v:rep.toImport,c:C.green},
                {k:"נדחו",v:rep.rejectedCount,c:rep.rejectedCount?C.red:C.muted}].map(x=>(
                <div key={x.k} style={{ background:"#fff", border:`1px solid ${C.border}`,
                  borderRadius:13, padding:"12px 14px" }}>
                  <div style={{ fontSize:12, color:C.muted }}>{x.k}</div>
                  <div style={{ fontFamily:"'Frank Ruhl Libre', serif", fontSize:26,
                    fontWeight:800, color:x.c }}>{x.v}</div>
                </div>
              ))}
            </div>

            {rep.imported !== undefined ? (
              <div style={{ background:"rgba(74,124,89,0.10)", border:`1px solid ${C.green}`,
                borderRadius:14, padding:20, textAlign:"center" }}>
                <p style={{ fontSize:26, margin:"0 0 6px" }}>✅</p>
                <p style={{ fontWeight:700, color:C.green, margin:0 }}>
                  יובאו {rep.imported} מוזמנים
                </p>
                <a href={`/admin/flow?event=${eventId}`} style={{ display:"inline-block", marginTop:12,
                  padding:"10px 18px", borderRadius:10, background:C.gold, color:"#fff",
                  textDecoration:"none", fontWeight:700, fontSize:14 }}>חזרה לתוכנית</a>
              </div>
            ) : (
              <button onClick={()=>send(false)} disabled={!!busy || rep.toImport===0}
                style={{ width:"100%", padding:14, borderRadius:12, border:"none",
                  background: busy||rep.toImport===0 ? C.border : C.gold, color:"#fff",
                  fontSize:15.5, fontWeight:700, cursor: busy ? "wait":"pointer", fontFamily:"inherit" }}>
                {busy==="import" ? "מייבא…" : `ייבוא ${rep.toImport} מוזמנים`}
              </button>
            )}

            {rep.rejected.length > 0 && (
              <div style={{ marginTop:18, background:"#fff", border:`1px solid ${C.border}`,
                borderRadius:14, overflow:"hidden" }}>
                <p style={{ margin:0, padding:"12px 16px", borderBottom:`1px solid ${C.border}`,
                  fontWeight:700, fontSize:14, color:C.red }}>שורות שנדחו</p>
                {rep.rejected.map((r,i)=>(
                  <div key={i} style={{ padding:"9px 16px", borderBottom:`1px solid ${C.border}`,
                    display:"flex", gap:10, fontSize:13, flexWrap:"wrap" }}>
                    <span style={{ color:C.muted, minWidth:40 }}>#{r.row}</span>
                    <span style={{ fontWeight:600, minWidth:110 }}>{r.name}</span>
                    <span style={{ color:C.muted, direction:"ltr", minWidth:90 }}>{r.phone||"—"}</span>
                    <span style={{ color:C.red, flex:1 }}>{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div style={{padding:40,textAlign:"center"}}>טוען…</div>}><Import/></Suspense>;
}
