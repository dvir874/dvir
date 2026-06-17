"use client";

import { use, useEffect, useState, useCallback } from "react";
import { Camera, MessageSquareHeart, Video, Heart, Loader2 } from "lucide-react";

const C = {
  cream: "#F6F1E8", ivory: "#FDFAF5", gold: "#C5A46D",
  olive: "#6B7B5A", dark: "#333333", muted: "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

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

export default function MemoryWall({ params }: { params: Promise<{ token: string }> }) {
  const { token }  = use(params);
  const [items,    setItems]    = useState<MemoryItem[]>([]);
  const [event,    setEvent]    = useState<EventInfo | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<MemoryItem | null>(null);

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
    // Auto-refresh every 30 seconds
    const id = setInterval(loadItems, 30_000);
    return () => clearInterval(id);
  }, [loadItems]);

  const photos   = items.filter((i) => i.type === "photo");
  const videos   = items.filter((i) => i.type === "video");
  const blessings = items.filter((i) => i.type === "blessing");

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)`, fontFamily: "Heebo, sans-serif" }}>

      {/* Header */}
      <div className="text-center py-10 px-4">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(197,164,109,0.6)" }}>
          ארכיון זכרונות
        </p>
        {event && (
          <>
            <h1 className="text-3xl font-bold mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
              {event.name}
            </h1>
            <p className="text-sm" style={{ color: C.muted }}>
              {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </>
        )}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { icon: Camera, count: photos.length, label: "תמונות" },
            { icon: Video, count: videos.length, label: "סרטונים" },
            { icon: MessageSquareHeart, count: blessings.length, label: "ברכות" },
          ].map(({ icon: Icon, count, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon size={14} style={{ color: C.gold }} />
                <span className="text-xl font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{count}</span>
              </div>
              <p className="text-xs" style={{ color: C.muted }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin" style={{ color: C.gold }} />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 px-4">
          <Heart size={48} className="mx-auto mb-4" style={{ color: "rgba(197,164,109,0.3)" }} />
          <p className="text-lg font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            הזכרונות בדרך...
          </p>
          <p className="text-sm mt-2" style={{ color: C.muted }}>
            הדף מתעדכן אוטומטית כשאורחים משתפים תכנים
          </p>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <section className="px-4 mb-10 max-w-4xl mx-auto">
          <SectionHeader icon={<Camera size={15} style={{ color: C.gold }} />} label="תמונות" count={photos.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="relative rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ aspectRatio: "1", background: "rgba(197,164,109,0.08)" }}
              >
                {item.public_url && (
                  <img
                    src={item.public_url}
                    alt={item.guest_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 py-1 px-2"
                  style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.45),transparent)" }}>
                  <p className="text-white text-[10px] truncate">{item.guest_name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Video grid */}
      {videos.length > 0 && (
        <section className="px-4 mb-10 max-w-4xl mx-auto">
          <SectionHeader icon={<Video size={15} style={{ color: C.gold }} />} label="סרטונים" count={videos.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                {item.public_url && (
                  <video src={item.public_url} controls className="w-full" style={{ maxHeight: 280 }} />
                )}
                <div className="px-4 py-2.5">
                  <p className="text-sm font-medium" style={{ color: C.dark }}>{item.guest_name}</p>
                  <p className="text-xs" style={{ color: C.muted }}>
                    {new Date(item.uploaded_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blessings */}
      {blessings.length > 0 && (
        <section className="px-4 mb-10 max-w-2xl mx-auto">
          <SectionHeader icon={<MessageSquareHeart size={15} style={{ color: C.gold }} />} label="ספר ברכות" count={blessings.length} />
          <div className="flex flex-col gap-4">
            {blessings.map((item) => (
              <div key={item.id} className="rounded-2xl p-5" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                <p className="text-base leading-relaxed mb-4" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                  &ldquo;{item.blessing_text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(197,164,109,0.15)", color: C.gold }}>
                    {item.guest_name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.dark }}>{item.guest_name}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {new Date(item.uploaded_at).toLocaleString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upload CTA */}
      <div className="text-center pb-12 px-4">
        <a
          href={`/memory/${token}`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
          style={{ background: `linear-gradient(135deg,${C.gold},${C.olive})`, fontFamily: "Heebo, sans-serif" }}
        >
          <Camera size={18} />
          שתפו גם אתם רגע
        </a>
        <p className="text-xs mt-3" style={{ color: C.muted }}>הדף מתעדכן אוטומטית כל 30 שניות</p>
      </div>

      {/* Lightbox */}
      {selected && selected.type === "photo" && selected.public_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelected(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selected.public_url} alt="" className="w-full rounded-2xl" />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{selected.guest_name}</p>
              <button onClick={() => setSelected(null)} className="text-white/60 text-sm mt-1">סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="font-semibold" style={{ color: "#333", fontFamily: "Frank Ruhl Libre, serif" }}>{label}</h2>
      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(197,164,109,0.15)", color: "#C5A46D" }}>
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(197,164,109,0.2)" }} />
    </div>
  );
}
