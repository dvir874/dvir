"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Download, X, Loader2, Lock, Unlock, Image as ImageIcon, Video, ChevronLeft, ChevronRight, Link2, Check } from "lucide-react";
import Link from "next/link";

const G = {
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  dark:   "#333333",
  border: "rgba(197,164,109,0.18)",
};
const HEEBO = { fontFamily: "Heebo, sans-serif" } as const;
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" } as const;

interface Photo {
  id: string;
  public_url: string | null;
  storage_path: string;
  uploader_name: string;
  is_video: boolean;
  file_size: number;
  created_at: string;
}

interface Album {
  id: string;
  title: string;
  event_name: string;
  status: string;
  photo_count: number;
  public_token: string;
}

export default function AdminGalleryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [album,        setAlbum]        = useState<Album | null>(null);
  const [photos,       setPhotos]       = useState<Photo[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [lightbox,     setLightbox]     = useState<number | null>(null);
  const [toggling,     setToggling]     = useState(false);
  const [copied,       setCopied]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/gallery/${eventId}`);
    const data = await res.json() as { album: Album; photos: Photo[] };
    setAlbum(data.album ?? null);
    setPhotos(data.photos ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async () => {
    if (!album) return;
    setToggling(true);
    await fetch(`/api/admin/gallery/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_status" }),
    });
    await load();
    setToggling(false);
  };

  const copyLink = () => {
    if (!album) return;
    const url = `${window.location.origin}/gallery/${album.public_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Navigate lightbox
  const goLightbox = useCallback((dir: 1 | -1) => {
    setLightbox((prev) => {
      if (prev === null) return prev;
      const next = prev + dir;
      if (next >= 0 && next < photos.length) return next;
      return prev;
    });
  }, [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape")     setLightbox(null);
      if (e.key === "ArrowLeft")  goLightbox(-1);
      if (e.key === "ArrowRight") goLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, goLightbox]);

  if (loading) return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: G.ivory }}>
      <Loader2 size={32} className="animate-spin" style={{ color: G.gold }} />
    </div>
  );

  const shareUrl = album ? `${typeof window !== "undefined" ? window.location.origin : "https://regalifnei.vercel.app"}/gallery/${album.public_token}` : "";

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: G.ivory }}>

      {/* Header */}
      <div className="sticky top-0 z-30" style={{ background: "rgba(253,250,245,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${G.border}` }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm" style={{ color: G.olive, ...HEEBO }}>← אדמין</Link>
            <span style={{ color: G.border }}>|</span>
            <h1 className="text-lg font-bold" style={{ color: G.dark, ...FRANK }}>
              גלריה — {album?.event_name ?? ""}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy link */}
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: G.cream, border: `1px solid ${G.border}`, color: G.dark, ...HEEBO }}
            >
              {copied ? <Check size={14} style={{ color: "#3D8B5C" }} /> : <Link2 size={14} style={{ color: G.gold }} />}
              {copied ? "הועתק!" : "העתק קישור"}
            </button>

            {/* Toggle open/closed */}
            <button
              onClick={toggleStatus}
              disabled={toggling}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: album?.status === "open" ? G.olive : G.gold, ...HEEBO }}
            >
              {toggling ? <Loader2 size={14} className="animate-spin" /> : album?.status === "open" ? <Lock size={14} /> : <Unlock size={14} />}
              {album?.status === "open" ? "סגור העלאות" : "פתח העלאות"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "תמונות וסרטונים", value: photos.length },
            { label: "מעלים שונים", value: new Set(photos.map((p) => p.uploader_name)).size },
            { label: "סטטוס", value: album?.status === "open" ? "פתוח" : "סגור" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "white", border: `1px solid ${G.border}` }}>
              <p className="text-2xl font-bold" style={{ color: G.gold, ...FRANK }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Share link */}
        <div className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3" style={{ background: "rgba(197,164,109,0.06)", border: `1px solid ${G.border}` }}>
          <Link2 size={14} style={{ color: G.gold }} />
          <p className="text-xs flex-1 truncate" style={{ color: "rgba(51,51,51,0.55)", ...HEEBO, direction: "ltr" }}>{shareUrl}</p>
          <button onClick={copyLink} className="text-xs font-semibold" style={{ color: G.gold, ...HEEBO }}>
            {copied ? "✓ הועתק" : "העתק"}
          </button>
        </div>

        {/* Empty state */}
        {photos.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: "white", border: `1px solid ${G.border}` }}>
            <div className="text-5xl mb-4">📷</div>
            <p className="font-semibold mb-1" style={{ color: G.dark, ...FRANK }}>אין תמונות עדיין</p>
            <p className="text-sm" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
              שתף את הקישור עם האורחים כדי שיתחילו להעלות
            </p>
          </div>
        ) : (
          /* Photo grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(i)}
                className="relative rounded-xl overflow-hidden aspect-square group"
                style={{ background: G.cream }}
              >
                {photo.is_video ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Video size={28} style={{ color: G.olive }} />
                    <span className="text-xs" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>סרטון</span>
                  </div>
                ) : photo.public_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.public_url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} style={{ color: G.gold }} />
                  </div>
                )}
                {/* Uploader overlay */}
                <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.55))" }}>
                  <p className="text-xs text-white truncate" style={{ ...HEEBO }}>{photo.uploader_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}><X size={28} /></button>

          {lightbox > 0 && (
            <button className="absolute left-4 text-white p-2" onClick={(e) => { e.stopPropagation(); goLightbox(-1); }}>
              <ChevronLeft size={32} />
            </button>
          )}
          {lightbox < photos.length - 1 && (
            <button className="absolute right-4 text-white p-2" onClick={(e) => { e.stopPropagation(); goLightbox(1); }}>
              <ChevronRight size={32} />
            </button>
          )}

          <div className="max-w-3xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            {photos[lightbox].is_video ? (
              <div className="flex items-center justify-center h-64" style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16 }}>
                <div className="text-center">
                  <Video size={48} className="mx-auto mb-3 text-white opacity-50" />
                  <p className="text-white text-sm opacity-60" style={HEEBO}>תצוגה מקדימה לסרטונים אינה זמינה</p>
                  {photos[lightbox].public_url && (
                    <a href={photos[lightbox].public_url!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-white underline" style={HEEBO}>
                      פתח סרטון
                    </a>
                  )}
                </div>
              </div>
            ) : photos[lightbox].public_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[lightbox].public_url!} alt="" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            ) : null}

            <div className="mt-3 text-center">
              <p className="text-white text-sm" style={HEEBO}>{photos[lightbox].uploader_name}</p>
              <p className="text-white/40 text-xs mt-0.5" style={HEEBO}>
                {new Date(photos[lightbox].created_at).toLocaleDateString("he-IL")}
                {" · "}
                {(photos[lightbox].file_size / 1024 / 1024).toFixed(1)} MB
              </p>
              {photos[lightbox].public_url && (
                <a
                  href={photos[lightbox].public_url!}
                  download
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.12)", ...HEEBO }}
                >
                  <Download size={14} />
                  הורד
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
