"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Copy, Check, ExternalLink, Camera, Video, MessageSquareHeart, QrCode, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";

const GOLD  = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK  = "#333333";
const CARD  = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: "1.25rem" } as const;

interface Event { id: string; name: string; date: string }
interface MemoryItem { id: string; guest_name: string; type: string; public_url?: string; blessing_text?: string; uploaded_at: string }
interface VaultInfo { token: string | null; uploadUrl: string; wallUrl: string; items: MemoryItem[] }

function VaultCard({ event }: { event: Event }) {
  const [vault,    setVault]    = useState<VaultInfo | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied,   setCopied]   = useState<"upload" | "wall" | null>(null);
  const [qrUrl,    setQrUrl]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/memory/vault-token?event_id=${event.id}`);
    const data = await res.json();
    if (data.token) {
      const token     = data.token;
      const uploadUrl = `${origin}/memory/${token}`;
      const wallUrl   = `${origin}/memory/${token}/wall`;
      const itemsRes  = await fetch(`/api/memory/${token}/items`);
      const items     = itemsRes.ok ? await itemsRes.json() : [];
      setVault({ token, uploadUrl, wallUrl, items: Array.isArray(items) ? items : [] });
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uploadUrl)}`);
    } else {
      setVault({ token: null, uploadUrl: "", wallUrl: "", items: [] });
    }
    setLoading(false);
  }, [event.id, origin]);

  useEffect(() => { load(); }, [load]);

  async function createVault() {
    setCreating(true);
    await fetch("/api/memory/vault-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: event.id }),
    });
    await load();
    setCreating(false);
  }

  async function copy(text: string, kind: "upload" | "wall") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  const photos   = vault?.items.filter((i) => i.type === "photo")    ?? [];
  const videos   = vault?.items.filter((i) => i.type === "video")    ?? [];
  const blessings = vault?.items.filter((i) => i.type === "blessing") ?? [];

  return (
    <div style={{ ...CARD, padding: "1.25rem", marginBottom: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: DARK, fontFamily: "Frank Ruhl Libre, serif" }}>{event.name}</p>
          <p style={{ fontSize: 12, color: "rgba(51,51,51,0.45)", marginTop: 1 }}>
            {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {vault?.token && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { icon: Camera,              count: photos.length,    label: "תמונות",  color: GOLD },
                { icon: Video,               count: videos.length,    label: "סרטונים", color: OLIVE },
                { icon: MessageSquareHeart,  count: blessings.length, label: "ברכות",   color: "#7c3aed" },
              ].map(({ icon: Icon, count, label, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Icon size={12} style={{ color }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: DARK, fontFamily: "Frank Ruhl Libre, serif" }}>{count}</span>
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(51,51,51,0.45)" }}>{label}</p>
                </div>
              ))}
            </div>
            <button onClick={load} title="רענן" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.35)", padding: 4 }}>
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
          <Loader2 size={20} style={{ color: GOLD, animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {!loading && !vault?.token && (
        <button
          onClick={createVault}
          disabled={creating}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.6rem 1.25rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#A07840)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif", opacity: creating ? 0.6 : 1 }}
        >
          {creating ? <Loader2 size={13} /> : <QrCode size={13} />}
          צור ארכיון זכרונות
        </button>
      )}

      {!loading && vault?.token && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: qrUrl ? "220px 1fr" : "1fr", gap: "1.25rem", alignItems: "start" }}>
            {/* QR Code */}
            {qrUrl && (
              <div style={{ textAlign: "center" }}>
                <div style={{ padding: 8, borderRadius: 12, border: "1px solid rgba(197,164,109,0.2)", background: "white", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Code" width={200} height={200} style={{ display: "block", borderRadius: 6 }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(51,51,51,0.5)", marginTop: 6 }}>סרקו להעלאת זכרונות</p>
              </div>
            )}

            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <LinkRow
                label="🔗 לינק להעלאה לאורחים"
                url={vault.uploadUrl}
                copied={copied === "upload"}
                onCopy={() => copy(vault.uploadUrl, "upload")}
              />
              <LinkRow
                label="🖼️ לינק לקיר הזכרונות"
                url={vault.wallUrl}
                copied={copied === "wall"}
                onCopy={() => copy(vault.wallUrl, "wall")}
              />
              <a
                href={vault.wallUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: OLIVE, textDecoration: "none", marginTop: 4 }}
              >
                <ExternalLink size={12} />פתחו את קיר הזכרונות
              </a>
            </div>
          </div>

          {/* Recent items preview */}
          {vault.items.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{vault.items.length} פריטים נשמרו</p>
                <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: GOLD, fontFamily: "Heebo, sans-serif" }}>
                  {expanded ? "הסתר" : "הצג הכל"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 4 }}>
                {(expanded ? vault.items : vault.items.slice(0, 8)).map((item) => (
                  <div key={item.id} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "rgba(197,164,109,0.08)", border: "1px solid rgba(197,164,109,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.type === "photo" && item.public_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.public_url} alt={item.guest_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : item.type === "video" ? (
                      <Video size={18} style={{ color: GOLD }} />
                    ) : (
                      <MessageSquareHeart size={18} style={{ color: "#7c3aed" }} />
                    )}
                  </div>
                ))}
              </div>
              {expanded && blessings.length > 0 && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {blessings.map((b) => (
                    <div key={b.id} style={{ padding: "0.65rem 0.85rem", borderRadius: 10, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
                      <p style={{ fontSize: 12, color: DARK, marginBottom: 2 }}>&ldquo;{b.blessing_text}&rdquo;</p>
                      <p style={{ fontSize: 10, color: "rgba(51,51,51,0.45)" }}>— {b.guest_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LinkRow({ label, url, copied, onCopy }: { label: string; url: string; copied: boolean; onCopy: () => void }) {
  return (
    <div style={{ background: "rgba(197,164,109,0.06)", borderRadius: 10, padding: "0.5rem 0.75rem", border: "1px solid rgba(197,164,109,0.15)" }}>
      <p style={{ fontSize: 10, color: "rgba(51,51,51,0.5)", marginBottom: 2 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <p style={{ fontSize: 11, color: DARK, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>{url}</p>
        <button
          onClick={onCopy}
          title="העתק"
          style={{ background: "none", border: "none", cursor: "pointer", color: copied ? OLIVE : GOLD, padding: 2, flexShrink: 0 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function AdminMemoryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setEvents(d);
        setLoading(false);
      });
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>
      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <ArrowRight size={16} />חזרה לניהול
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>
            ארכיון זכרונות
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
        {/* Explainer */}
        <div style={{ ...CARD, padding: "1.25rem", marginBottom: "1.5rem", display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {[
            { emoji: "📲", title: "QR קוד לאורחים", body: "הדפיסו ושלחו — האורחים סורקים ומעלים תמונות, סרטונים וברכות" },
            { emoji: "🖼️", title: "קיר זכרונות חי", body: "גלריה שמתעדכנת בזמן אמת עם כל מה שהאורחים משתפים" },
            { emoji: "💌", title: "ספר ברכות דיגיטלי", body: "כל הברכות שנכתבו נשמרות ומוצגות בספר מיוחד" },
          ].map((f) => (
            <div key={f.title} style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</p>
              <p style={{ fontWeight: 600, fontSize: 13, color: DARK, marginBottom: 2 }}>{f.title}</p>
              <p style={{ fontSize: 12, color: "rgba(51,51,51,0.55)", lineHeight: 1.4 }}>{f.body}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Loader2 size={28} style={{ color: GOLD, animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {!loading && events.length === 0 && (
          <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", padding: "3rem" }}>לא נמצאו אירועים</p>
        )}

        {events.map((event) => (
          <VaultCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
