"use client";

import { use, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Camera, X, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { hebrewNumber, hebrewFrom } from "@/lib/hebrew-numbers";

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
  /** When the shutter fired. Null for videos and anything with stripped EXIF. */
  taken_at?: string | null;
}

interface EventInfo { name: string; date: string }

const CSS = `
  @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
  .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @media(prefers-reduced-motion:reduce){*{animation:none!important}}
`;

/** The evening replays in the hour it happened, in the timezone it happened in. */
const EVENT_TZ = "Asia/Jerusalem";

function hourLabel(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: EVENT_TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

/** Groups the evening into hours — the unit a night is actually remembered in. */
function hourKey(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  }).format(d);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

/** "החתונה של תהל ואביב" → "תהל ואביב". The greeting says a name, not a title. */
function coupleName(eventName?: string): string {
  if (!eventName) return "";
  return eventName.replace(/^\s*(החתונה|חתונת|האירוע)\s+(של\s+)?/, "").trim();
}

type Moment = {
  media: MemoryItem;
  /** The blessing written by the same person, when there is one. */
  blessing?: MemoryItem;
};

export default function MemoryWall({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [items,    setItems]    = useState<MemoryItem[]>([]);
  const [event,    setEvent]    = useState<EventInfo | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [denied,   setDenied]   = useState(false);
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
      setDenied(false);
    } else {
      /* A guest reached this with an upload link. Say so plainly — an empty
         grid would read as "the album is broken" or "nobody uploaded
         anything", and both are worse than the truth. */
      setDenied(true);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadItems();
    const id = setInterval(loadItems, 30_000);
    return () => clearInterval(id);
  }, [loadItems]);

  /* ── The evening, assembled ──
     Photographs that know when they were taken build the timeline. Each one
     carries the name of whoever sent it, and — where the same person also
     wrote — their blessing sits beside their photograph. That pairing is the
     thing no photographer can hand over, so it is composed first and
     everything else arranges around it. */
  const { timeline, tail, lonelyBlessings, photographers } = useMemo(() => {
    const media = items.filter(i => (i.type === "photo" || i.type === "video") && i.public_url);
    const blessings = items.filter(i => i.type === "blessing" && i.blessing_text);

    const unusedByGuest = new Map<string, MemoryItem[]>();
    for (const b of blessings) {
      const list = unusedByGuest.get(b.guest_name) ?? [];
      list.push(b);
      unusedByGuest.set(b.guest_name, list);
    }

    const toMoment = (m: MemoryItem): Moment => {
      const pool = unusedByGuest.get(m.guest_name);
      const blessing = pool?.shift();
      if (pool && pool.length === 0) unusedByGuest.delete(m.guest_name);
      return { media: m, blessing };
    };

    const placed = media.filter(m => m.taken_at);
    const groups = new Map<string, { label: string; moments: Moment[] }>();
    for (const m of placed) {
      const k = hourKey(m.taken_at!);
      if (!groups.has(k)) groups.set(k, { label: hourLabel(m.taken_at!), moments: [] });
      groups.get(k)!.moments.push(toMoment(m));
    }

    /* Anything with no capture time cannot be placed in the evening honestly,
       so it follows at the end rather than being guessed into the chuppah. */
    const tail = media.filter(m => !m.taken_at).map(toMoment);

    return {
      timeline: [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v),
      tail,
      lonelyBlessings: [...unusedByGuest.values()].flat(),
      photographers: new Set(items.map(i => i.guest_name)).size,
    };
  }, [items]);

  /** Lightbox order must match what the eye just scrolled past. */
  const mediaItems = useMemo(
    () => [...timeline.flatMap(g => g.moments), ...tail].map(m => m.media).filter(m => m.type === "photo"),
    [timeline, tail],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevPhoto = useCallback(() => setLightbox(i => i !== null ? Math.max(0, i - 1) : null), []);
  const nextPhoto = useCallback(() => setLightbox(i => i !== null ? Math.min(mediaItems.length - 1, i + 1) : null), [mediaItems.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      /* RTL: onward through the evening is leftward. */
      if (e.key === "ArrowLeft")  nextPhoto();
      if (e.key === "ArrowRight") prevPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, nextPhoto, prevPhoto]);

  const currentPhoto = lightbox !== null ? mediaItems[lightbox] : null;
  const names = coupleName(event?.name);
  const momentCount = timeline.reduce((n, g) => n + g.moments.length, 0) + tail.length;

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

  /* ──── Private ────
     The upload link and the viewing link are not the same link. Guests are
     asked to contribute; the album itself belongs to the couple, and it holds
     other people's photos and blessings written for the couple by name. */
  if (denied) return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px", padding:"32px", textAlign:"center" }}>
      <style>{CSS}</style>
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <rect x="16" y="36" width="48" height="34" rx="8" fill={T.gold} fillOpacity=".15" stroke={T.gold} strokeWidth="2"/>
        <path d="M27 36 V26 C27 18.3 52.8 18.3 52.8 26 V36" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="53" r="5" fill={T.gold}/>
      </svg>
      <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"24px", fontWeight:700, color:T.dark, margin:0 }}>
        האלבום פרטי
      </h1>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"15px", fontWeight:300, lineHeight:1.6, color:T.muted, maxWidth:"320px", margin:0 }}>
        הזיכרונות שנאספו כאן שמורים לזוג בלבד. הקישור שלכם נועד להוסיף אליהם.
      </p>
      <a
        href={`/memory/${token}`}
        style={{ marginTop:"8px", minHeight:"44px", display:"inline-flex", alignItems:"center", padding:"0 32px", borderRadius:"14px", background:T.gold, color:"#1C1008", fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", textDecoration:"none", boxShadow:T.shadowCta }}
      >
        להוספת זיכרון
      </a>
    </div>
  );

  /* ──── Empty ────
     The couple will open this the morning after, before anyone has uploaded.
     It promises rather than apologises: nothing is missing yet. */
  if (items.length === 0) return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px", padding:"32px", textAlign:"center" }}>
      <style>{CSS}</style>
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <path d="M40 56 C40 56 40 28 40 8" stroke={T.olive} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 40 C30 35 18 36 12 30" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M40 30 C50 25 62 26 68 20" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="30" r="2" fill={T.olive}/><circle cx="68" cy="20" r="2" fill={T.olive}/>
        <circle cx="40" cy="8" r="2.5" fill={T.gold}/>
      </svg>
      <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"28px", fontWeight:900, color:T.dark, margin:0, lineHeight:1.25 }}>
        {greeting()}{names ? ` ${names}` : ""}
      </h1>
      <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"16px", fontWeight:300, lineHeight:1.7, color:T.muted, maxWidth:"340px", margin:0 }}>
        כאן יחכו לכם כל הרגעים שהאורחים שלכם תפסו. ברגע שהתמונות הראשונות יגיעו,
        הן יופיעו כאן לפי סדר הערב.
      </p>
      <button
        onClick={() => { setLoading(true); loadItems(); }}
        style={{ marginTop:"8px", minHeight:"44px", display:"inline-flex", alignItems:"center", gap:"8px", padding:"0 28px", borderRadius:"14px", border:`1.5px solid ${T.border}`, background:"transparent", color:T.goldText, fontFamily:"'Heebo',sans-serif", fontWeight:600, fontSize:"15px", cursor:"pointer" }}
      >
        <RefreshCw size={16} aria-hidden="true"/> רענון
      </button>
    </div>
  );

  /* ──── E2-S10 — the evening, in order (Stitch Direction B, approved 2026-08-12) ──── */
  const credit = (m: MemoryItem) => (
    <p style={{ marginTop:"10px", fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:400, color:T.muted }}>
      צולם על ידי: <span style={{ color:T.dark, fontWeight:500 }}>{m.guest_name}</span>
    </p>
  );

  const photoBlock = (mo: Moment, idx: number) => {
    const i = mediaItems.findIndex(x => x.id === mo.media.id);
    const isVideo = mo.media.type === "video";
    return (
      <div key={mo.media.id} style={{ marginBottom:"40px", animation:`fadeUp .5s ease ${Math.min(idx * 0.05, 0.4).toFixed(2)}s both` }}>
        {isVideo ? (
          <video
            src={mo.media.public_url!}
            controls
            playsInline
            preload="metadata"
            style={{ width:"100%", display:"block", borderRadius:"10px", background:T.cream }}
          />
        ) : (
          <button
            onClick={() => setLightbox(i)}
            aria-label={`הגדלת התמונה של ${mo.media.guest_name}`}
            style={{ display:"block", width:"100%", padding:0, border:"none", background:"none", cursor:"pointer", borderRadius:"10px", overflow:"hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mo.media.public_url!}
              alt={`רגע מהערב, צולם על ידי ${mo.media.guest_name}`}
              loading="lazy"
              style={{ width:"100%", display:"block", borderRadius:"10px", background:T.cream }}
            />
          </button>
        )}
        {credit(mo.media)}

        {/* The pairing: what they saw, beside what they wrote. */}
        {mo.blessing?.blessing_text && (
          <figure style={{ margin:"16px 0 0", background:"#fff", border:`1px solid ${T.border}`, borderRight:`3px solid ${T.gold}`, borderRadius:"10px", padding:"20px" }}>
            <blockquote style={{ margin:0, fontFamily:"'Frank Ruhl Libre',serif", fontSize:"18px", fontWeight:400, lineHeight:1.65, color:T.dark }}>
              {mo.blessing.blessing_text}
            </blockquote>
            <figcaption style={{ marginTop:"12px", fontFamily:"'Heebo',sans-serif", fontSize:"13px", fontWeight:600, color:T.goldText }}>
              {mo.blessing.guest_name}
            </figcaption>
          </figure>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:T.ivory, fontFamily:"'Heebo',sans-serif" }}>
      <style>{CSS}</style>

      {/* Opening */}
      <header style={{ padding:"56px 24px 40px", textAlign:"center", borderBottom:`1px solid ${T.border}` }}>
        <h1 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"32px", fontWeight:900, lineHeight:1.2, color:T.dark, margin:"0 0 12px" }}>
          {greeting()}{names ? ` ${names}` : ""}
        </h1>
        <p style={{ fontFamily:"'Heebo',sans-serif", fontSize:"18px", fontWeight:300, lineHeight:1.6, color:T.muted, margin:0 }}>
          {hebrewNumber(momentCount)} {momentCount === 1 ? "רגע" : "רגעים"}, {hebrewFrom(photographers)}{" "}
          {photographers === 1 ? "אדם" : "אנשים"}
        </p>
      </header>

      <main style={{ padding:"32px 20px 120px", maxWidth:"720px", margin:"0 auto" }}>
        {timeline.map(group => (
          <section key={group.label} style={{ marginBottom:"16px" }}>
            <h2 style={{ display:"inline-block", margin:"0 0 20px", padding:"6px 16px", borderRadius:"999px", background:T.cream, fontFamily:"'Heebo',sans-serif", fontSize:"14px", fontWeight:600, letterSpacing:".02em", color:T.dark }}>
              {group.label}
            </h2>
            {group.moments.map(photoBlock)}
          </section>
        ))}

        {/* Letters from people who did not send a photograph. Not a lesser card. */}
        {lonelyBlessings.length > 0 && (
          <section style={{ marginTop:"24px" }}>
            <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, margin:"0 0 8px" }}>
              ומה שכתבו לכם
            </h2>
            <p style={{ fontSize:"14px", fontWeight:300, color:T.muted, margin:"0 0 20px" }}>
              {hebrewNumber(lonelyBlessings.length)} {lonelyBlessings.length === 1 ? "ברכה" : "ברכות"} שהגיעו בלי תמונה
            </p>
            {lonelyBlessings.map(b => (
              <figure key={b.id} style={{ margin:"0 0 16px", background:"#fff", border:`1px solid ${T.border}`, borderRight:`3px solid ${T.gold}`, borderRadius:"10px", padding:"20px" }}>
                <blockquote style={{ margin:0, fontFamily:"'Frank Ruhl Libre',serif", fontSize:"18px", fontWeight:400, lineHeight:1.65, color:T.dark }}>
                  {b.blessing_text}
                </blockquote>
                <figcaption style={{ marginTop:"12px", fontFamily:"'Heebo',sans-serif", fontSize:"13px", fontWeight:600, color:T.goldText }}>
                  {b.guest_name}
                </figcaption>
              </figure>
            ))}
          </section>
        )}

        {/* Everything the clock could not place. Named honestly. */}
        {tail.length > 0 && (
          <section style={{ marginTop:"40px", paddingTop:"32px", borderTop:`1px solid ${T.border}` }}>
            <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontSize:"22px", fontWeight:700, color:T.dark, margin:"0 0 8px" }}>
              עוד רגעים שנאספו
            </h2>
            <p style={{ fontSize:"14px", fontWeight:300, lineHeight:1.6, color:T.muted, margin:"0 0 24px" }}>
              אלה הגיעו בלי שעת צילום, אז הם לא יכלו להיכנס לסדר של הערב.
            </p>
            {tail.map(photoBlock)}
          </section>
        )}

        {/* The evening ends. Say so. */}
        <p style={{ marginTop:"48px", textAlign:"center", fontFamily:"'Frank Ruhl Libre',serif", fontSize:"18px", fontWeight:400, color:T.muted }}>
          סוף הערב.
        </p>
      </main>

      {/* Add your own */}
      <a
        href={`/memory/${token}`}
        aria-label="הוספת זיכרון"
        style={{ position:"fixed", bottom:`calc(24px + env(safe-area-inset-bottom))`, right:"20px", width:"56px", height:"56px", borderRadius:"50%", background:T.gold, boxShadow:"0 4px 16px rgba(197,164,109,0.5)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}
      >
        <Camera size={22} color="#1C1008"/>
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
            <button onClick={closeLightbox} aria-label="סגירה" style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", minWidth:"44px", minHeight:"44px", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
              aria-label="הורדת התמונה"
              style={{ cursor:"pointer", color:"#fff", minWidth:"44px", minHeight:"44px", display:"flex", alignItems:"center", justifyContent:"center" }}
            >
              <Download size={22}/>
            </a>
          </div>

          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:"0 56px" }}>
            {lightbox > 0 && (
              <button onClick={prevPhoto} aria-label="התמונה הקודמת" style={{ position:"absolute", right:"6px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"44px", height:"44px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                <ChevronRight size={20}/>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.public_url}
              alt={`רגע מהערב, צולם על ידי ${currentPhoto.guest_name}`}
              style={{ maxWidth:"100%", maxHeight:"72dvh", objectFit:"contain", borderRadius:"8px" }}
            />
            {lightbox < mediaItems.length - 1 && (
              <button onClick={nextPhoto} aria-label="התמונה הבאה" style={{ position:"absolute", left:"6px", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:"44px", height:"44px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                <ChevronLeft size={20}/>
              </button>
            )}
          </div>

          {/* The credit follows the photograph in here too. */}
          <div style={{ textAlign:"center", padding:"16px 20px calc(16px + env(safe-area-inset-bottom))", color:"rgba(255,255,255,0.6)", fontFamily:"'Heebo',sans-serif", fontSize:"14px" }}>
            צולם על ידי: <span style={{ color:"#fff" }}>{currentPhoto.guest_name}</span>
            {currentPhoto.taken_at && (
              <span style={{ color:"rgba(255,255,255,0.4)" }}> · {hourLabel(currentPhoto.taken_at)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
