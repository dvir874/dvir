"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";

/* Live photo wall — fullscreen slideshow for a venue screen.
   Guests upload via QR → photos appear here in near-real-time.
   Public: uses the gallery album public token. Polls every 20s. */

interface Photo { id: string; public_url: string; is_video: boolean; uploader_name: string | null }

const POLL_MS = 20_000;
const SLIDE_MS = 7_000;

export default function LiveWallPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventName, setEventName] = useState("");
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState(false);
  const knownIds = useRef<Set<string>>(new Set());
  const [freshId, setFreshId] = useState<string | null>(null);

  /* Poll gallery */
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/gallery/${token}`);
        if (!res.ok) { setError(true); return; }
        const d = await res.json();
        if (!alive) return;
        if (d?.album?.event_name) setEventName(d.album.event_name);
        const imgs: Photo[] = (d?.photos ?? []).filter((p: Photo) => !p.is_video);
        // Detect newly arrived photo → jump to it
        const newOnes = imgs.filter(p => !knownIds.current.has(p.id));
        imgs.forEach(p => knownIds.current.add(p.id));
        setPhotos(imgs);
        if (newOnes.length > 0 && knownIds.current.size > newOnes.length) {
          const target = imgs.findIndex(p => p.id === newOnes[0].id);
          if (target >= 0) { setIdx(target); setFreshId(newOnes[0].id); setTimeout(() => setFreshId(null), 5000); }
        }
      } catch { setError(true); }
    }
    load();
    const t = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [token]);

  /* Slideshow rotation */
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % photos.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [photos.length]);

  const memoryUrl = typeof window !== "undefined" ? `${window.location.origin}/memory/${token}` : "";
  const qrSrc = memoryUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&color=1C1008&bgcolor=FFFFFF&data=${encodeURIComponent(memoryUrl)}`
    : null;

  const current = photos[idx];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0a07", overflow: "hidden", fontFamily: "'Heebo', sans-serif" }} dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600;700&display=swap');
        @keyframes wallFade { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
        @keyframes freshPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(197,164,109,0.6); } 50% { box-shadow: 0 0 60px 10px rgba(197,164,109,0.8); } }
      `}</style>

      {/* Photo */}
      {current ? (
        <img
          key={current.id + idx}
          src={current.public_url}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain", animation: "wallFade 1.2s ease both",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#E5C188", textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 60, margin: "0 0 16px" }}>📸</p>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 900, margin: "0 0 10px" }}>
            {error ? "הגלריה לא נמצאה" : "התמונה הראשונה בדרך..."}
          </p>
          {!error && <p style={{ fontSize: 18, opacity: 0.7, margin: 0 }}>סרקו את הקוד והעלו את הרגע שלכם</p>}
        </div>
      )}

      {/* Gradient overlays */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: "linear-gradient(to top, rgba(13,10,7,0.92), transparent)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom, rgba(13,10,7,0.7), transparent)" }} />

      {/* Header — event name */}
      <div style={{ position: "absolute", top: 24, right: 32, color: "#fff" }}>
        <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 900, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          {eventName || "החתונה שלנו"} 💍
        </p>
      </div>

      {/* Fresh photo badge */}
      {freshId && current?.id === freshId && (
        <div style={{ position: "absolute", top: 28, left: 32, background: "#C5A46D", color: "#fff", borderRadius: 9999, padding: "8px 20px", fontSize: 16, fontWeight: 700, animation: "freshPulse 1.5s ease infinite" }}>
          ✨ תמונה חדשה!
        </div>
      )}

      {/* Bottom bar: uploader + count + QR */}
      <div style={{ position: "absolute", bottom: 24, right: 32, left: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div style={{ color: "#fff" }}>
          {current?.uploader_name && (
            <p style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              📷 {current.uploader_name}
            </p>
          )}
          {photos.length > 0 && (
            <p style={{ fontSize: 14, opacity: 0.75, margin: 0 }}>
              {photos.length} תמונות מהאורחים · רגע לפני 💍
            </p>
          )}
        </div>

        {qrSrc && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 10, textAlign: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="QR" style={{ width: 110, height: 110, display: "block" }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1C1008", margin: "6px 0 0", fontFamily: "'Heebo', sans-serif" }}>
              צלמתם? העלו! 📸
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
