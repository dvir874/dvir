"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { Camera, X, Download, ChevronLeft, ChevronRight } from "lucide-react";

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

interface MemoryItem {
  id: string;
  guest_name: string;
  type: "photo" | "video" | "blessing";
  public_url?: string | null;
  blessing_text?: string | null;
  mime_type?: string | null;
  uploaded_at: string;
}

interface EventInfo { name: string; date: string }

const CSS = `
  @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
  .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .wall-item{break-inside:avoid;margin-bottom:4px}
`;

export default function MemoryWall({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [items,    setItems]    = useState<MemoryItem[]>([]);
  const [event,    setEvent]    = useState<EventInfo | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const loadItems = useCallback(async () => {
    const [infoRes, itemsRes] = await Promise.all([
      fetch(`/api/memory/${token}`),
      fetch(`/api/memory/${token}/items`),
    ]);
    if (infoRes.ok) {
      const d = await infoRes.json();
      if (d.event) setEvent(d.event);
    }
    if (itemsRes.ok) {
      const d = await itemsRes.json();
      if (Array.isArray(d)) setItems(d);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadItems();
    const id = setInterval(loadItems, 30_000);
    return () => clearInterval(id);
  }, [loadItems]);

  // Only photos/videos in lightbox
  const mediaItems = items.filter(i => i.type === "photo" && i.public_url);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(() => setLightbox(i => i !== null ? Math.max(0, i - 1) : null), []);
  const nextPhoto = useCallback(() => setLightbox(i => i !== null ? Math.min(mediaItems.length - 1, i + 1) : null), [mediaItems.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft")  nextPhoto();
      if (e.key === "ArrowRight") prevPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, nextPhoto, prevPhoto]);

  const totalGuests = new Set(items.map(i => i.guest_name)).size;
  const currentPhoto = lightbox !== null ? mediaItems[lightbox] : null;

  // ──── Loading ────
  if (loading) return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px" }}>
      <style>{CSS}</style>
      <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:900, color:T.goldText }}>רגע לפני</p>
      <div style={{ display:"flex", gap:"8px" }}>
        <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
      </div>
      <p role="status" aria-live="polite" style={{ color:T.muted, fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300 }}>
        טוענים את הזיכרונות...
      </p>
    </div>
  );

  // ──── Empty state ────
  if (items.length === 0) return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px", padding:"32px", textAlign:"center" }}>
      <style>{CSS}</style>
      {/* Botanical branch */}
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" style={{ display:"block", margin:"0 auto" }} aria-hidden="true">
        <path d="M40 56 C40 56 40 28 40 8" stroke={T.olive} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 40 C30 35 18 36 12 30" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M40 30 C50 25 62 26 68 20" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="30" r="2" fill={T.olive}/>
        <circle cx="68" cy="20" r="2" fill={T.olive}/>
        <circle cx="40" cy="8" r="2.5" fill={T.gold}/>
      </svg>
      <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark }}>
        הזיכרונות בדרך...
      </h1>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300, color:T.muted }}>
        היו הראשונים לשתף רגע
      </p>
      <a
        href={`/memory/${token}`}
        style={{ marginTop:"8px", padding:"16px 32px", borderRadius:"14px", background:`linear-gradient(135deg,${T.gold},#B8935A)`, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"15px", textDecoration:"none", boxShadow:T.shadowCta }}
      >
        הוסיפו זיכרון ראשון
      </a>
    </div>
  );

  // ──── E2-S10 Memory Wall ────
  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ padding:"24px 20px 16px", textAlign:"center", animation:"fadeUp .4s ease both" }}>
        <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark, marginBottom:"6px" }}>
          קיר הזכרונות
        </h1>
        {totalGuests > 0 && (
          <p style={{ fontSize:"13px", color:T.muted }}>
            מ-{totalGuests} {totalGuests === 1 ? "אורח" : "אורחים"}
          </p>
        )}
        {event?.name && (
          <p style={{ fontSize:"13px", fontWeight:600, color:T.goldText, marginTop:"4px", letterSpacing:".03em" }}>
            {event.name}
          </p>
        )}
      </div>

      {/* Masonry grid — mixed photos + blessings */}
      <div style={{ padding:"0 4px 100px", columnCount:2, columnGap:"4px" }}>
        {items.map((item, idx) => {
          if (item.type === "photo" && item.public_url) {
            const mediaIdx = mediaItems.findIndex(m => m.id === item.id);
            return (
              <div key={item.id} className="wall-item" onClick={() => setLightbox(mediaIdx)} style={{ cursor:"pointer" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.public_url}
                  alt={`תמונה מהאירוע מאת ${item.guest_name}`}
                  loading="lazy"
                  style={{ width:"100%", display:"block", borderRadius:"8px", filter:"sepia(0.12) saturate(1.08) brightness(1.02)" }}
                />
              </div>
            );
          }

          if (item.type === "blessing" && item.blessing_text) {
            return (
              <div key={item.id} className="wall-item">
                {/* BlessingCard per spec */}
                <div style={{ background:T.cream, borderRadius:"16px", padding:"16px", border:`1px solid ${T.border}`, animation:`fadeUp .4s ease ${(idx * 0.04).toFixed(2)}s both` }}>
                  <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"15px", fontWeight:400, color:T.dark, lineHeight:1.6, marginBottom:"10px", display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {item.blessing_text}
                  </p>
                  <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"13px", fontWeight:600, color:T.muted, textAlign:"end" }}>
                    — {item.guest_name} ❤️
                  </p>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* FAB */}
      <a
        href={`/memory/${token}`}
        aria-label="הוסיפו זיכרון"
        style={{ position:"fixed", bottom:`calc(24px + env(safe-area-inset-bottom))`, right:"20px", width:"56px", height:"56px", borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},#B8935A)`, boxShadow:"0 4px 16px rgba(197,164,109,0.5)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}
      >
        <Camera size={22} color="#fff"/>
      </a>

      {/* Lightbox */}
      {lightbox !== null && currentPhoto?.public_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="תצוגת תמונה"
          style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(28,16,8,0.92)", display:"flex", flexDirection:"column" }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx > 50)  prevPhoto();
            if (dx < -50) nextPhoto();
            touchStartX.current = null;
          }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", flexShrink:0 }}>
            <button onClick={closeLightbox} aria-label="סגור" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", padding:"8px", display:"flex" }}>
              <X size={24}/>
            </button>
            <span style={{ color:"rgba(255,255,255,0.6)", fontFamily:"'Heebo',sans-serif", fontSize:"13px" }}>
              {lightbox + 1} / {mediaItems.length}
            </span>
            <a
              href={currentPhoto.public_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label="הורד תמונה"
              style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", padding:"8px", display:"flex" }}
            >
              <Download size={22}/>
            </a>
          </div>

          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:"0 48px" }}>
            {lightbox > 0 && (
              <button onClick={prevPhoto} aria-label="תמונה קודמת" style={{ position:"absolute", right:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                <ChevronRight size={20}/>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.public_url}
              alt={`תמונה מהאירוע מאת ${currentPhoto.guest_name}`}
              style={{ maxWidth:"100%", maxHeight:"70dvh", objectFit:"contain", borderRadius:"8px", filter:"sepia(0.12) saturate(1.08) brightness(1.02)" }}
            />
            {lightbox < mediaItems.length - 1 && (
              <button onClick={nextPhoto} aria-label="תמונה הבאה" style={{ position:"absolute", left:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                <ChevronLeft size={20}/>
              </button>
            )}
          </div>

          {currentPhoto.guest_name && (
            <div style={{ textAlign:"center", padding:"16px", color:"rgba(255,255,255,0.5)", fontFamily:"'Heebo',sans-serif", fontSize:"13px" }}>
              📷 {currentPhoto.guest_name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
