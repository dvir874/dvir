"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight, Camera } from "lucide-react";

const T = {
  ivory:     "#FDFAF5",
  cream:     "#F6F1E8",
  gold:      "#C5A46D",
  goldText:  "#8B6914",
  dark:      "#1C1008",
  muted:     "#8C7B6E",
  olive:     "#6B7B5A",
  border:    "#E8E0D4",
  shadowCard: "0 2px 8px rgba(28,16,8,0.06)",
} as const;

interface Photo {
  id: string;
  public_url: string | null;
  mime_type: string | null;
  is_video: boolean;
  uploader_name: string | null;
  uploaded_at: string;
}
interface AlbumInfo {
  id: string;
  title: string;
  event_name: string;
  status: string;
  photo_count: number;
}

type Screen = "loading" | "error" | "empty" | "grid";

export default function GalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [screen,   setScreen]   = useState<Screen>("loading");
  const [album,    setAlbum]    = useState<AlbumInfo | null>(null);
  const [photos,   setPhotos]   = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null); // index
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/gallery/${token}`)
      .then(r => r.json())
      .then((d: { album?: AlbumInfo; photos?: Photo[]; error?: string }) => {
        if (d.error || !d.album) { setScreen("error"); return; }
        setAlbum(d.album);
        const list = (d.photos ?? []).filter(p => p.public_url);
        setPhotos(list);
        setScreen(list.length === 0 ? "empty" : "grid");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => i !== null ? Math.max(0, i - 1) : null), []);
  const next = useCallback(() => setLightbox(i => i !== null ? Math.min(photos.length - 1, i + 1) : null), [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft")  next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, next, prev]);

  const handleDownload = async (photo: Photo) => {
    if (!photo.public_url) return;
    const a = document.createElement("a");
    a.href = photo.public_url;
    a.download = `תמונה-מהאירוע.jpg`;
    a.target = "_blank";
    a.click();
  };

  const DOTS_STYLE = `
    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
      40%            { transform: scale(1);   opacity: 1; }
    }
    .loading-dot { width:10px;height:10px;border-radius:50%;background:${T.gold};animation:dotPulse 1.2s ease-in-out infinite; }
    .loading-dot:nth-child(2){animation-delay:.2s}
    .loading-dot:nth-child(3){animation-delay:.4s}
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .gallery-column { break-inside:avoid; }
  `;

  // ──── Loading ────
  if (screen === "loading") {
    return (
      <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px" }}>
        <style>{DOTS_STYLE}</style>
        <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:900, color:T.goldText }}>רגע לפני</p>
        <div style={{ display:"flex", gap:"8px" }}>
          <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
        </div>
        <p role="status" aria-live="polite" style={{ color:T.muted, fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300 }}>
          טוענים את הגלריה...
        </p>
      </div>
    );
  }

  // ──── Error ────
  if (screen === "error") {
    return (
      <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", padding:"24px", textAlign:"center" }}>
        <div style={{ width:"56px", height:"2px", background:T.gold, margin:"0 auto 16px" }}/>
        <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"20px", fontWeight:700, color:T.dark }}>לא הצלחנו לטעון את הגלריה</p>
        <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:300, color:T.muted }}>בדקו חיבור לאינטרנט ונסו שוב</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop:"16px", padding:"12px 28px", borderRadius:"12px", background:T.gold, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", border:"none", cursor:"pointer" }}
        >
          נסו שוב
        </button>
      </div>
    );
  }

  // ──── Empty ────
  if (screen === "empty") {
    return (
      <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
        <style>{DOTS_STYLE}</style>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, fontSize:18, color:T.goldText }}>רגע לפני</span>
          <span style={{ fontSize:20 }}>🤍</span>
        </div>
        {/* Content */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", padding:"48px 24px", textAlign:"center", animation:"fadeUp .4s ease both" }}>
          <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"26px", fontWeight:700, color:T.dark, margin:0 }}>
            גלריית התמונות
          </h1>
          {album?.event_name && (
            <p style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"16px", fontWeight:700, color:T.goldText, margin:0 }}>
              {album.event_name}
            </p>
          )}
          <p style={{ fontSize:"13px", color:T.muted, margin:0, fontWeight:300 }}>0 תמונות</p>

          {/* Camera card */}
          <div style={{ marginTop:16, background:"#fff", borderRadius:20, padding:"32px", border:`1px solid ${T.border}`, boxShadow:T.shadowCard, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <Camera size={40} style={{ color:T.border }} />
            <span style={{ fontSize:20 }}>🤍</span>
          </div>

          <p style={{ fontSize:"15px", color:T.muted, fontWeight:300, lineHeight:1.6, maxWidth:280 }}>
            הגלריה עדיין ריקה...<br />היי הראשונים מהחתונה לשתף את הרגעים המרגשים ❤️
          </p>
          <a
            href={`/memory/${token}`}
            style={{ marginTop:8, padding:"16px 32px", borderRadius:"14px", background:T.gold, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:700, fontSize:"16px", textDecoration:"none", boxShadow:`0 4px 12px rgba(197,164,109,0.35)`, display:"inline-block" }}
          >
            העלאת תמונות הראשונות
          </a>
        </div>
      </div>
    );
  }

  // ──── Grid ────
  const currentPhoto = lightbox !== null ? photos[lightbox] : null;

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{DOTS_STYLE}</style>

      {/* Top App Bar — sticky, "רגע לפני" branding */}
      <div style={{ position:"sticky", top:0, zIndex:40, background:"rgba(253,250,245,0.96)", backdropFilter:"blur(8px)", borderBottom:`1px solid rgba(197,164,109,0.15)`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:56 }}>
        <span style={{ fontSize:22 }}>🤍</span>
        <span style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, fontSize:17, color:T.goldText }}>רגע לפני</span>
        <div style={{ width:28 }} />
      </div>

      {/* Heading + upload button */}
      <div style={{ padding:"16px 16px 8px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, margin:"0 0 4px", lineHeight:1.3 }}>
            {album?.event_name ? `גלריה — ${album.event_name}` : "גלריה"}
          </h1>
          <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:13, color:T.muted, fontWeight:300, margin:0 }}>
            שתפו רגעים שצילמתם
          </p>
        </div>
        <a
          href={`/memory/${token}`}
          style={{ flexShrink:0, padding:"8px 14px", borderRadius:20, background:T.gold, color:"#fff", fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:5, boxShadow:"0 2px 8px rgba(197,164,109,0.35)" }}
        >
          <span style={{ fontSize:14 }}>+</span> הוספת תמונה
        </a>
      </div>

      {/* Masonry grid — CSS column-count (zero deps, native, RTL-safe) */}
      <div style={{ padding:"0 4px", columnCount:2, columnGap:"4px" }}>
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="gallery-column"
            style={{ marginBottom:"4px", cursor:"pointer", borderRadius:"8px", overflow:"hidden", display:"block" }}
            onClick={() => setLightbox(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.public_url!}
              alt={`תמונה מהאירוע${photo.uploader_name ? ` מאת ${photo.uploader_name}` : ""}`}
              loading="lazy"
              style={{
                width:"100%",
                display:"block",
                borderRadius:"8px",
                filter:"sepia(0.12) saturate(1.08) brightness(1.02)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Safe-area padding */}
      <div style={{ height:"100px" }}/>

      {/* FAB */}
      <a
        href={`/memory/${token}`}
        aria-label="העלאת תמונה"
        style={{
          position:"fixed",
          bottom:`calc(24px + env(safe-area-inset-bottom))`,
          right:"20px",
          width:"56px",
          height:"56px",
          borderRadius:"50%",
          background:`linear-gradient(135deg,${T.gold},#B8935A)`,
          boxShadow:"0 4px 16px rgba(197,164,109,0.5)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          textDecoration:"none",
        }}
      >
        <Camera size={22} color="#fff"/>
      </a>

      {/* Lightbox */}
      {lightbox !== null && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="תצוגת תמונה"
          style={{
            position:"fixed", inset:0, zIndex:50,
            background:"rgba(28,16,8,0.92)",
            display:"flex", flexDirection:"column",
          }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx > 50)  prev();
            if (dx < -50) next();
            touchStartX.current = null;
          }}
        >
          {/* Top bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", flexShrink:0 }}>
            <button
              onClick={closeLightbox}
              aria-label="סגור"
              style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", padding:"8px", borderRadius:"8px", display:"flex" }}
            >
              <X size={24}/>
            </button>
            <span style={{ color:"rgba(255,255,255,0.6)", fontFamily:"'Heebo',sans-serif", fontSize:"13px" }}>
              {lightbox + 1} / {photos.length}
            </span>
            <button
              onClick={() => handleDownload(currentPhoto)}
              aria-label="הורד תמונה"
              style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", padding:"8px", borderRadius:"8px", display:"flex" }}
            >
              <Download size={22}/>
            </button>
          </div>

          {/* Image */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:"0 48px" }}>
            {lightbox > 0 && (
              <button
                onClick={prev}
                aria-label="תמונה קודמת"
                style={{ position:"absolute", right:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}
              >
                <ChevronRight size={20}/>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.public_url!}
              alt={`תמונה מהאירוע${currentPhoto.uploader_name ? ` מאת ${currentPhoto.uploader_name}` : ""}`}
              style={{ maxWidth:"100%", maxHeight:"70dvh", objectFit:"contain", borderRadius:"8px" }}
            />
            {lightbox < photos.length - 1 && (
              <button
                onClick={next}
                aria-label="תמונה הבאה"
                style={{ position:"absolute", left:"8px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}
              >
                <ChevronLeft size={20}/>
              </button>
            )}
          </div>

          {/* Uploader name */}
          {currentPhoto.uploader_name && (
            <div style={{ textAlign:"center", padding:"16px", color:"rgba(255,255,255,0.5)", fontFamily:"'Heebo',sans-serif", fontSize:"13px" }}>
              📷 {currentPhoto.uploader_name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
