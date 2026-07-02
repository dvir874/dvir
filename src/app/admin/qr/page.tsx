"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* Print-ready A4 sheet of table QR cards linking to the guest photo-upload page.
   Usage: /admin/qr?event=[eventId] */

function QrCards() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";

  const [eventName, setEventName] = useState("");
  const [memoryUrl, setMemoryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/gallery/${eventId}`).then(r => r.ok ? r.json() : null),
    ]).then(([ev, gal]) => {
      if (ev?.name) setEventName(ev.name);
      if (gal?.album?.public_token) setMemoryUrl(`${window.location.origin}/memory/${gal.album.public_token}`);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId]);

  const qrSrc = memoryUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&color=1C1008&bgcolor=FDFAF5&data=${encodeURIComponent(memoryUrl)}`
    : null;

  if (!eventId) return <p style={{ padding: 40, textAlign: "center" }}>חסר מזהה אירוע — /admin/qr?event=[ID]</p>;
  if (loading)  return <p style={{ padding: 40, textAlign: "center" }}>טוען...</p>;
  if (!memoryUrl) return (
    <div dir="rtl" style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>
      <p style={{ fontSize: 16, fontWeight: 600 }}>לאירוע הזה אין עדיין אלבום גלריה</p>
      <p style={{ fontSize: 14, color: "#8C7B6E" }}>צרו אלבום דרך האדמין ואז חזרו לכאן</p>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif", background: "#f0f0f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        .sheet { background: white; width: 210mm; min-height: 297mm; margin: 24px auto; padding: 12mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 8mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
        .card { border: 2px dashed #C5A46D; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8mm; background: #FDFAF5; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .sheet { margin: 0; box-shadow: none; width: auto; min-height: auto; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ background: "#1C1008", padding: "12px 24px", display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>6 כרטיסים לעמוד · גזרו לאורך הקו המקווקו</span>
        <button onClick={() => window.print()}
          style={{ background: "#C5A46D", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          🖨️ הדפס / שמור PDF
        </button>
      </div>

      <div className="sheet">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 900, color: "#8B6914", margin: "0 0 2mm" }}>
              {eventName || "החתונה שלנו"}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1008", margin: "0 0 4mm" }}>
              צילמתם רגע יפה? 📸
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc!} alt="QR להעלאת תמונות" style={{ width: "38mm", height: "38mm" }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: "#1C1008", margin: "4mm 0 0", lineHeight: 1.5 }}>
              סרקו והעלו את התמונות שלכם<br />ישר לאלבום של הזוג 🤍
            </p>
            <p style={{ fontSize: 9, color: "rgba(28,16,8,0.4)", margin: "3mm 0 0" }}>
              רגע לפני 💍
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QrPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>טוען...</div>}>
      <QrCards />
    </Suspense>
  );
}
