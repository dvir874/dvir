"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Clock, AlertTriangle, CheckCircle, Loader2, Phone } from "lucide-react";

const C = {
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

interface Event {
  id: string; name: string; date: string; client_name?: string | null;
}
interface PendingGuest {
  id: string; name: string; phone: string; guest_count: number; opened_at: string | null;
}
interface EventReminders {
  event: Event;
  daysLeft: number;
  pending: PendingGuest[];
}

function waLink(phone: string, eventName: string, eventDate: string) {
  const formatted = phone.replace(/^0/, "972").replace(/[^0-9]/g, "");
  const dateHe = new Date(eventDate).toLocaleDateString("he-IL", { day: "numeric", month: "long" });
  const text = encodeURIComponent(
    `שלום 😊\nרצינו לבדוק האם תוכלו להגיע ל${eventName} בתאריך ${dateHe}?\nנשמח לדעת 🙏`
  );
  return `https://wa.me/${formatted}?text=${text}`;
}

function callLink(phone: string) {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
}

function urgencyLabel(days: number): { label: string; color: string; bg: string; icon: React.ReactNode } {
  if (days <= 7)  return { label: "דחוף מאוד", color: "rgb(200,50,50)",  bg: "rgba(200,50,50,0.08)",   icon: <AlertTriangle size={13} /> };
  if (days <= 14) return { label: "דחוף",      color: "#B05000",         bg: "rgba(180,80,0,0.08)",    icon: <Clock size={13} /> };
  if (days <= 30) return { label: "השבוע",     color: "#A07840",         bg: "rgba(197,164,109,0.12)", icon: <Clock size={13} /> };
  return              { label: "בקרוב",         color: C.olive,           bg: "rgba(107,123,90,0.08)",  icon: <CheckCircle size={13} /> };
}

export default function RemindersPage() {
  const [data,    setData]    = useState<EventReminders[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId,  setOpenId]  = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
    ]).then(async ([eventsRaw]) => {
      const events: Event[] = Array.isArray(eventsRaw) ? eventsRaw : [];
      const now = Date.now();
      const future = events.filter((e) => new Date(e.date).getTime() > now);

      const results: EventReminders[] = [];
      await Promise.all(future.map(async (event) => {
        const res = await fetch(`/api/guests?event_id=${event.id}`);
        if (!res.ok) return;
        const guests = await res.json();
        if (!Array.isArray(guests)) return;
        const pending: PendingGuest[] = guests
          .filter((g: { status: string }) => g.status === "pending")
          .map((g: { id: string; name: string; phone: string; guest_count: number; opened_at: string | null }) => ({
            id: g.id, name: g.name, phone: g.phone,
            guest_count: g.guest_count, opened_at: g.opened_at,
          }));
        if (pending.length === 0) return;
        const daysLeft = Math.ceil((new Date(event.date).getTime() - now) / 86_400_000);
        results.push({ event, daysLeft, pending });
      }));

      results.sort((a, b) => a.daysLeft - b.daysLeft);
      setData(results);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <Loader2 size={32} className="animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  const totalPending = data.reduce((s, d) => s + d.pending.length, 0);

  return (
    <div className="min-h-screen p-6" style={{ background: C.cream, fontFamily: "Heebo, sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: C.gold }}>ניהול תזכורות</p>
          <h1 className="text-3xl font-bold mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            תזכורות RSVP
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            {totalPending > 0
              ? `${totalPending} אורחים ממתינים ב-${data.length} אירועים — לחצו על הוואטסאפ לשליחה`
              : "אין אורחים ממתינים לאירועים עתידיים 🎉"}
          </p>
        </div>

        {/* Event cards */}
        <div className="flex flex-col gap-4">
          {data.map(({ event, daysLeft, pending }) => {
            const urg    = urgencyLabel(daysLeft);
            const isOpen = openId === event.id;
            const opened = pending.filter((g) => g.opened_at).length;

            return (
              <div
                key={event.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.08)" }}
              >
                {/* Card header */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-right"
                  onClick={() => setOpenId(isOpen ? null : event.id)}
                >
                  {/* Urgency badge */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{ background: urg.bg, color: urg.color }}
                  >
                    {urg.icon}{urg.label}
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                      {event.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}עוד {daysLeft} ימים
                    </p>
                  </div>

                  <div className="text-center flex-shrink-0">
                    <p className="text-2xl font-bold" style={{ color: C.gold, fontFamily: "Frank Ruhl Libre, serif" }}>{pending.length}</p>
                    <p className="text-xs" style={{ color: C.muted }}>ממתינים</p>
                  </div>

                  <div className="text-xs px-2" style={{ color: C.muted }}>
                    {isOpen ? "▲" : "▼"}
                  </div>
                </button>

                {/* Summary strip */}
                {!isOpen && (
                  <div
                    className="flex items-center gap-4 px-5 pb-4 text-xs"
                    style={{ color: C.muted }}
                  >
                    <span>📨 {opened} פתחו את הקישור</span>
                    <span>📵 {pending.length - opened} לא פתחו</span>
                    {event.client_name && <span>👰 {event.client_name}</span>}
                  </div>
                )}

                {/* Guest list (expanded) */}
                {isOpen && (
                  <div className="border-t px-5 pb-5" style={{ borderColor: C.border }}>
                    <div className="flex items-center justify-between py-3 mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>
                        {pending.length} אורחים ממתינים
                      </p>
                      <p className="text-xs" style={{ color: C.muted }}>
                        {opened} פתחו · {pending.length - opened} לא פתחו
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {pending.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            background: guest.opened_at ? "rgba(107,123,90,0.05)" : "rgba(197,164,109,0.06)",
                            border: `1px solid ${guest.opened_at ? "rgba(107,123,90,0.12)" : "rgba(197,164,109,0.15)"}`,
                          }}
                        >
                          {/* Opened indicator */}
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: guest.opened_at ? C.olive : "rgba(197,164,109,0.4)" }}
                            title={guest.opened_at ? "פתח את הקישור" : "לא פתח"}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: C.dark }}>{guest.name}</p>
                            <p className="text-xs" style={{ color: C.muted }}>
                              {guest.phone}
                              {guest.guest_count > 1 && ` · ${guest.guest_count} אורחים`}
                              {guest.opened_at ? " · פתח את הקישור" : " · לא פתח"}
                            </p>
                          </div>

                          {/* Quick actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {guest.phone && (
                              <>
                                <a
                                  href={waLink(guest.phone, event.name, event.date)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                  style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}
                                  title="שלח תזכורת בוואטסאפ"
                                >
                                  <MessageCircle size={15} />
                                </a>
                                <a
                                  href={callLink(guest.phone)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                  style={{ background: "rgba(197,164,109,0.12)", color: C.gold }}
                                  title="התקשר"
                                >
                                  <Phone size={15} />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {data.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: C.ivory, border: `1px solid ${C.border}` }}
            >
              <CheckCircle size={40} className="mx-auto mb-4" style={{ color: C.olive }} />
              <p className="font-semibold text-lg mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                אין ממתינים 🎉
              </p>
              <p className="text-sm" style={{ color: C.muted }}>
                כל האורחים לאירועים עתידיים כבר ענו
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
