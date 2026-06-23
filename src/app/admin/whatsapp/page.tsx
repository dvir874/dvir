"use client";

import { useEffect, useState } from "react";

const C = {
  cream:  "#F2EDE3",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.45)",
  border: "rgba(197,164,109,0.18)",
  card:   "rgba(255,255,255,0.82)",
  shadow: "0 2px 16px rgba(28,16,8,0.07)",
};

interface Event { id: string; name: string; couple_token?: string; rsvp_token?: string }
interface Guest { id: string; name: string; phone: string; guest_count: number; status: string }

type Filter = "all" | "pending" | "confirmed";

const STATUS_EMOJI: Record<string, string> = {
  confirmed: "✅",
  pending:   "⏳",
  declined:  "❌",
};

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "972");
}

export default function WhatsAppCampaignPage() {
  const [events,         setEvents]         = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [guests,         setGuests]         = useState<Guest[]>([]);
  const [filter,         setFilter]         = useState<Filter>("all");
  const [message,        setMessage]        = useState("שלום {שם}! 💛\nמחכים לראותך ביום המיוחד שלנו.\nלאישור הגעה: {קישור}");
  const [linkType,       setLinkType]       = useState<"rsvp" | "site">("rsvp");
  const [sent,           setSent]           = useState<Set<string>>(new Set());
  const [loadingGuests,  setLoadingGuests]  = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) { setEvents(d); if (d.length) setSelectedEventId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    setLoadingGuests(true);
    fetch(`/api/guests?event_id=${selectedEventId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGuests(d); })
      .finally(() => setLoadingGuests(false));
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  function getLink(guest: Guest): string {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    if (linkType === "rsvp" && selectedEvent?.rsvp_token) {
      return `${base}/rsvp/${selectedEvent.rsvp_token}`;
    }
    if (selectedEvent?.couple_token) {
      return `${base}/couple/${selectedEvent.couple_token}`;
    }
    return base;
  }

  function personalizeMessage(guest: Guest): string {
    return message
      .replace(/{שם}/g, guest.name)
      .replace(/{קישור}/g, getLink(guest));
  }

  const filtered = guests.filter(g => {
    if (filter === "pending")   return g.status === "pending";
    if (filter === "confirmed") return g.status === "confirmed";
    return true;
  });

  const sentCount = sent.size;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.cream, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #C5954A 0%, #9B6E2C 50%, #7A5020 100%)",
        padding: "1.5rem 1.5rem 1.25rem",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <a href="/admin" style={{ fontSize: 12, color: "rgba(255,235,180,0.75)", textDecoration: "none", display: "inline-block", marginBottom: "0.5rem" }}>
            ← חזרה לניהול
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.8rem", fontWeight: 700, color: "#FFF8EC", margin: 0 }}>
            📲 קמפיין וואטסאפ
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>

        {/* Event selector */}
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>בחר אירוע</p>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 14, background: "white", color: C.dark, outline: "none" }}
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        {/* Message composer */}
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>הודעה</p>

          {/* Link type radio */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {([["rsvp", "קישור RSVP"], ["site", "לינק לאתר"]] as const).map(([val, label]) => (
              <label key={val} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="linkType" value={val} checked={linkType === val} onChange={() => setLinkType(val)} />
                {label}
              </label>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginBottom: "0.5rem" }}>
            {"{שם}"} = שם האורח &nbsp;·&nbsp; {"{קישור}"} = הקישור שנבחר
          </p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: "0.65rem 0.75rem", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, background: "white", color: C.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        {/* Guest list */}
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              אורחים
            </p>
            <span style={{ fontSize: 12, color: C.olive, fontWeight: 600 }}>
              נשלח {sentCount} מתוך {filtered.length}
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
            {([["all", "כולם"], ["pending", "לא ענו"], ["confirmed", "מגיעים"]] as [Filter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: "0.35rem 0.9rem", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "Heebo, sans-serif", border: "none", cursor: "pointer",
                  background: filter === val ? C.gold : "rgba(197,164,109,0.10)",
                  color: filter === val ? "white" : C.muted,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {loadingGuests ? (
            <p style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "1rem" }}>טוען...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "1rem" }}>אין אורחים</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map(guest => {
                const isSent = sent.has(guest.id);
                const phone = formatPhone(guest.phone);
                const msg = personalizeMessage(guest);
                const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

                return (
                  <div
                    key={guest.id}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.65rem 0.75rem", borderRadius: 10,
                      background: isSent ? "rgba(107,123,90,0.06)" : "transparent",
                      border: `1px solid ${isSent ? "rgba(107,123,90,0.15)" : C.border}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSent}
                      onChange={e => {
                        setSent(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(guest.id); else next.delete(guest.id);
                          return next;
                        });
                      }}
                      style={{ flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 14 }}>{STATUS_EMOJI[guest.status] ?? "❓"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, margin: 0 }}>{guest.name}</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{guest.phone}</p>
                    </div>
                    {guest.phone ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSent(prev => new Set(prev).add(guest.id))}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "0.4rem 0.75rem", borderRadius: 8,
                          background: "#25D366", color: "white",
                          fontSize: 12, fontWeight: 600, fontFamily: "Heebo, sans-serif",
                          textDecoration: "none", flexShrink: 0,
                        }}
                      >
                        💬 שלח
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>אין טלפון</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
