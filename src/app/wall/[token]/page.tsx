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
  const [memoryToken, setMemoryToken] = useState<string | null>(null);
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
        setMemoryToken(d?.memoryToken ?? null);
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

  /* The QR on the venue screen has to carry the vault token, not the album
     token this page is addressed by: /memory/[token] authenticates against
     vault_tokens. The same mix-up on the RSVP page put 88 guests in front of a
     404. No vault yet → no QR, rather than a code a room full of people scans
     into nothing. */
  const memoryUrl = memoryToken && typeof window !== "undefined" ? `${window.location.origin}/memory/${memoryToken}` : "";
  const qrSrc = memoryUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&color=1C1008&bgcolor=FFFFFF&data=${encodeURIComponent(memoryUrl)}`
    : null;

  /* How many photos to lay out at once, from the approved Stitch design.
   *
   * "Wall State 1–4": one photo full bleed, a generous grid at three to eight,
   * a five-column mosaic beyond twenty. The wall has to look composed at every
   * count — a venue screen is glanced at for three seconds from five metres,
   * and a lonely thumbnail in a sea of cream reads as broken.
   *
   * Only the couple sees this. Guests upload; this screen is opened with the
   * album's owner token, on their screen, in their room. */
  const cols = photos.length <= 1 ? 1 : photos.length <= 8 ? 3 : 5;
  const cells = cols === 1 ? 1 : cols === 3 ? 6 : 15;

  /* A window over the photos that advances, so a wall of twenty keeps moving
     rather than freezing on the first fifteen. */
  const shown = photos.length
    ? Array.from({ length: Math.min(cells, photos.length) },
        (_, i) => photos[(idx + i) % photos.length])
    : [];

  const uploaders = new Set(photos.map(p => p.uploader_name).filter(Boolean));
  const fresh = freshId ? photos.find(p => p.id === freshId) : null;

  return (
    <div dir="rtl" style={{
      position: "fixed", inset: 0, background: "#F6F1E8", padding: 32,
      overflow: "hidden", fontFamily: "Heebo, sans-serif",
    }}>
      <style>{`
        @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.09); } }
        @keyframes riseIn   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .wall-cell img { animation: kenburns 18s ease-out both alternate infinite; }
      `}</style>

      {/* No empty state, ever. Before the first photo the invitation fills the
          screen — beautiful from the first second rather than "no photos yet". */}
      {photos.length === 0 ? (
        <div style={{
          height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 26, textAlign: "center",
        }}>
          <h1 style={{
            fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 62, fontWeight: 900,
            color: "#1C1008", margin: 0, letterSpacing: "-0.02em",
          }}>
            {eventName || "החתונה שלנו"}
          </h1>
          <p style={{ fontSize: 24, color: "rgba(28,16,8,0.6)", margin: 0 }}>
            סרקו והעלו את הרגע שלכם
          </p>
          {qrSrc && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qrSrc} alt="" style={{
              width: 210, height: 210, borderRadius: 18, background: "#fff",
              padding: 12, boxShadow: "0 2px 18px rgba(28,16,8,0.10)",
            }} />
          )}
          {error && <p style={{ fontSize: 14, color: "rgba(28,16,8,0.4)" }}>מתחבר…</p>}
        </div>
      ) : (
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 16, height: "100%",
        }}>
          {shown.map((p, i) => (
            <div key={`${p.id}-${i}`} className="wall-cell" style={{
              borderRadius: 14, overflow: "hidden", background: "#FDFAF5",
              border: "1px solid #E8E0D4", boxShadow: "0 2px 10px rgba(28,16,8,0.06)",
              animation: "riseIn .7s ease both",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.public_url} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
            </div>
          ))}
        </div>
      )}

      {/* The couple's names and the Hebrew date, in the invitation face. It
          belongs to their wedding, not to a template. */}
      {photos.length > 0 && (
        <div style={{
          position: "absolute", top: 30, right: 36,
          background: "rgba(253,250,245,0.92)", borderRadius: 999,
          padding: "9px 22px", border: "1px solid #E8E0D4",
        }}>
          <span style={{
            fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 21,
            fontWeight: 800, color: "#1C1008",
          }}>
            {eventName}
          </span>
        </div>
      )}

      {/* A quiet running tally. The number climbing in front of people is what
          invites the next upload. */}
      {photos.length > 0 && (
        <div style={{
          position: "absolute", top: 30, left: 36,
          background: "rgba(253,250,245,0.92)", borderRadius: 999,
          padding: "9px 22px", border: "1px solid #E8E0D4",
          fontSize: 17, color: "rgba(28,16,8,0.6)",
        }}>
          <strong style={{ color: "#C5A46D", fontSize: 20 }}>{photos.length}</strong> תמונות
          {uploaders.size > 0 && <> · <strong style={{ color: "#C5A46D", fontSize: 20 }}>{uploaders.size}</strong> אורחים</>}
        </div>
      )}

      {/* The strongest element in the design: a photo arriving, with the name of
          whoever sent it. This is what makes the next person reach for a phone. */}
      {fresh && (
        <div style={{
          position: "absolute", bottom: 34, right: "50%", transform: "translateX(50%)",
          background: "#1C1008", color: "#FDFAF5", borderRadius: 999,
          padding: "13px 30px", fontSize: 21, fontWeight: 700,
          boxShadow: "0 6px 26px rgba(28,16,8,0.28)",
          animation: "riseIn .5s ease both",
        }}>
          {fresh.uploader_name ? `${fresh.uploader_name} העלתה עכשיו 🤍` : "תמונה חדשה 🤍"}
        </div>
      )}

      {/* Always reachable, never over a face. */}
      {photos.length > 0 && qrSrc && (
        <div style={{
          position: "absolute", bottom: 30, left: 34, textAlign: "center",
          background: "rgba(253,250,245,0.94)", borderRadius: 16,
          padding: "10px 10px 7px", border: "1px solid #E8E0D4",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="" style={{ width: 92, height: 92, display: "block", borderRadius: 8 }} />
          <span style={{ fontSize: 12, color: "rgba(28,16,8,0.6)", display: "block", marginTop: 5 }}>
            סרקו והעלו
          </span>
        </div>
      )}
    </div>
  );
}
