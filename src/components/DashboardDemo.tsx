"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ExternalLink, ArrowRight, CheckCircle, Clock, XCircle, MapPin, Timer } from "lucide-react";
import { WA_URL } from "@/lib/constants";

/* ════════════════════════════════════════════════
   Design tokens — ivory / gold / olive palette
════════════════════════════════════════════════ */
const G = {
  cream:      "#F6F1E8",
  creamDeep:  "#EDE6D6",
  white:      "#FFFFFF",
  ivory:      "#FDFAF5",
  gold:       "#C5A46D",
  goldLight:  "#D4BC8A",
  goldMuted:  "rgba(197,164,109,0.65)",
  olive:      "#6B7B5A",
  oliveMuted: "rgba(107,123,90,0.65)",
  dark:       "#333333",
  darkMuted:  "rgba(51,51,51,0.55)",
  border:     "rgba(197,164,109,0.18)",
  borderSoft: "rgba(197,164,109,0.10)",
};

/* ════════════════════════════════════════════════
   Shared layout pieces
════════════════════════════════════════════════ */
function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
        {eyebrow}
      </p>
      <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
        {title}
      </h2>
      <div className="w-14 h-px mx-auto mb-4" style={{ background: `linear-gradient(90deg,transparent,${G.gold},transparent)` }} />
      {sub && <p className="text-sm max-w-md mx-auto" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif", lineHeight: 1.8 }}>{sub}</p>}
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg,transparent,${G.borderSoft})` }} />
      <span style={{ color: G.goldMuted }}>✦</span>
      <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${G.borderSoft},transparent)` }} />
    </div>
  );
}

/* ════════════════════════════════════════════════
   Section 1 — Invitation preview
════════════════════════════════════════════════ */
function InvitationSection() {
  return (
    <section className="py-16 px-4">
      <div className="container-max mx-auto">
        <SectionHeader
          eyebrow="שלב 1 — ההזמנה"
          title="כך נראית ההזמנה"
          sub="כל הזמנה מעוצבת מאפס — בסגנון, בצבעים ובאווירה שמדברים עליכם. מקבלים קובץ מוכן לשיתוף בוואטסאפ."
        />

        {/* Two real invitation designs — light + dark */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Light invitation — Noa & Eitan (cream/olive/botanical) */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 12px 48px rgba(197,164,109,0.18)",
              border:    "1px solid rgba(197,164,109,0.20)",
            }}
          >
            <Image
              src="/gallery/wedding/wedding3.png"
              alt="הזמנת חתונה — עיצוב בהיר אלגנטי"
              width={941}
              height={1672}
              className="w-full h-auto"
              style={{ display: "block" }}
              priority
            />
            <div
              className="absolute bottom-0 inset-x-0 px-4 py-3 text-center"
              style={{
                background: "linear-gradient(to top, rgba(253,250,245,0.96) 0%, transparent 100%)",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "rgba(107,123,90,0.8)" }}>עיצוב בהיר · בוטני ואלגנטי</p>
            </div>
          </div>

          {/* Dark invitation — Noam & Adi (black/gold luxury) */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
              border:    "1px solid rgba(197,164,109,0.18)",
            }}
          >
            <Image
              src="/gallery/wedding/wedding4.png"
              alt="הזמנת חתונה — עיצוב כהה יוקרתי"
              width={1024}
              height={1536}
              className="w-full h-auto"
              style={{ display: "block" }}
              priority
            />
            <div
              className="absolute bottom-0 inset-x-0 px-4 py-3 text-center"
              style={{
                background: "linear-gradient(to top, rgba(15,15,15,0.92) 0%, transparent 100%)",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "rgba(197,164,109,0.85)" }}>עיצוב כהה · זהב ויוקרה</p>
            </div>
          </div>
        </div>{/* end grid */}

        {/* Inspiration CTA block */}
        <div
          className="max-w-2xl mx-auto mt-10 rounded-2xl px-6 py-8 text-center"
          style={{
            background: "linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)",
            border: "1px solid rgba(197,164,109,0.25)",
            boxShadow: "0 4px 24px rgba(197,164,109,0.10)",
          }}
        >
          <p
            className="text-lg font-bold mb-2"
            style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}
          >
            לא מצאתם בדיוק את הסגנון שלכם?
          </p>
          <p
            className="text-sm mb-4"
            style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif", lineHeight: 1.8 }}
          >
            אלו רק חלק קטן מהעיצובים שלנו.
          </p>
          <p
            className="text-sm mb-5"
            style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif", lineHeight: 1.85 }}
          >
            באתר תמצאו מגוון רחב של הזמנות לחתונה, חינה, בר/בת מצווה, ברית, ימי הולדת ואירועים נוספים.
            <br />
            לא מצאתם עיצוב שהתאהבתם בו?
            <br />
            שלחו לנו ב-WhatsApp תמונה, סקיצה או השראה שאהבתם — ואנחנו נעצב עבורכם הזמנה אישית באותו הקו העיצובי, בהתאמה מלאה לאירוע שלכם.
          </p>

          <div className="flex flex-col items-center gap-2 mb-6 text-sm" style={{ fontFamily: "Heebo, sans-serif" }}>
            {["עיצוב אישי", "התאמה מלאה לצבעים ולסגנון שלכם", "ליווי אישי עד לתוצאה המושלמת"].map((item) => (
              <p key={item} style={{ color: G.olive }}>
                <span style={{ color: G.gold }}>✨</span> {item}
              </p>
            ))}
          </div>

          <p
            className="text-sm font-semibold mb-5"
            style={{ color: G.dark, fontFamily: "Heebo, sans-serif" }}
          >
            שלחו לנו השראה — ואנחנו נהפוך אותה להזמנה שלכם.
          </p>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
              fontFamily: "Heebo, sans-serif",
              boxShadow: "0 6px 20px rgba(34,197,94,0.28)",
            }}
          >
            <MessageCircle size={16} strokeWidth={2} />
            שלחו לנו השראה בוואטסאפ
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   Section 2 — Event page preview
════════════════════════════════════════════════ */
function EventPageSection() {
  return (
    <section className="py-16 px-4" style={{ background: G.white }}>
      <div className="container-max mx-auto">
        <SectionHeader
          eyebrow="שלב 2 — דף האירוע"
          title="דף האירוע שלכם"
          sub="האורחים פותחים קישור ורואים את כל פרטי האירוע: ספירת לאחור, ניווט, ואישור הגעה."
        />

        {/* Browser-frame mockup */}
        <div className="max-w-lg mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${G.border}`, boxShadow: "0 16px 56px rgba(197,164,109,0.12)" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: G.ivory, borderBottom: `1px solid ${G.borderSoft}` }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(197,164,109,0.30)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(197,164,109,0.20)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(197,164,109,0.12)" }} />
              </div>
              <div
                className="flex-1 mx-3 rounded-md px-3 py-1 text-[10px] text-center"
                style={{ background: G.white, border: `1px solid ${G.borderSoft}`, color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}
              >
                raga-lifnei.co.il/noaanduri2026
              </div>
            </div>

            {/* Page content */}
            <div className="p-6" style={{ background: `linear-gradient(160deg,${G.cream},${G.creamDeep})` }}>
              {/* Countdown bar */}
              <div className="text-center mb-6">
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>עד האירוע</p>
                <div className="flex items-center justify-center gap-3" dir="ltr">
                  {[{ n: "123", l: "ימים" }, { n: "08", l: "שעות" }, { n: "42", l: "דקות" }, { n: "17", l: "שניות" }].map((c) => (
                    <div key={c.l} className="text-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mb-1"
                        style={{ background: G.white, color: G.dark, fontFamily: "Frank Ruhl Libre, serif", boxShadow: "0 2px 8px rgba(197,164,109,0.10)" }}
                      >
                        {c.n}
                      </div>
                      <p className="text-[9px]" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>{c.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event title */}
              <div className="text-center mb-5">
                <p className="text-xl font-bold" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>חתונת נועה ואורי</p>
                <p className="text-xs mt-1" style={{ color: G.olive, fontFamily: "Heebo, sans-serif" }}>16 אוקטובר 2026 · 19:00 · אולם המלכות, תל אביב</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: `linear-gradient(135deg,${G.gold},${G.goldLight})`, color: G.white, fontFamily: "Heebo, sans-serif" }}
                >
                  <CheckCircle size={13} />
                  אישור הגעה
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: G.white, color: G.olive, border: `1px solid rgba(107,123,90,0.25)`, fontFamily: "Heebo, sans-serif" }}
                >
                  <MapPin size={13} />
                  ניווט Waze
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link
              href="/event/demo"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-75"
              style={{ color: G.gold, fontFamily: "Heebo, sans-serif" }}
            >
              <ExternalLink size={14} />
              צפו בדף אירוע אמיתי לדוגמה
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   Section 3 — RSVP tracking example
════════════════════════════════════════════════ */
const RSVP_GUESTS = [
  { name: "משפחת כהן",      guests: 4, status: "confirmed" as const },
  { name: "דן ורחל לוי",    guests: 2, status: "pending"   as const },
  { name: "יוסי גולדברג",   guests: 1, status: "confirmed" as const },
  { name: "מרים אברהם",     guests: 3, status: "declined"  as const },
  { name: "משפחת ברק",      guests: 5, status: "confirmed" as const },
  { name: "תמר ושלמה נחום", guests: 2, status: "pending"   as const },
  { name: "נועה כהן",       guests: 1, status: "confirmed" as const },
  { name: "ליאור בן דוד",   guests: 2, status: "confirmed" as const },
];

function RsvpSection() {
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "declined">("all");
  const filtered = filter === "all" ? RSVP_GUESTS : RSVP_GUESTS.filter((g) => g.status === filter);

  const confirmed = RSVP_GUESTS.filter((g) => g.status === "confirmed").reduce((s, g) => s + g.guests, 0);
  const pending   = RSVP_GUESTS.filter((g) => g.status === "pending").length;
  const declined  = RSVP_GUESTS.filter((g) => g.status === "declined").reduce((s, g) => s + g.guests, 0);

  const statusCfg = {
    confirmed: { bg: "rgba(107,123,90,0.11)", color: G.olive,    label: "אישר הגעה"  },
    pending:   { bg: "rgba(197,164,109,0.12)", color: G.gold,    label: "ממתין"       },
    declined:  { bg: "rgba(51,51,51,0.07)",    color: G.darkMuted, label: "לא מגיע" },
  };

  return (
    <section className="py-16 px-4" style={{ background: `linear-gradient(160deg,${G.ivory} 0%,${G.cream} 100%)` }}>
      <div className="container-max mx-auto">
        <SectionHeader
          eyebrow="שלב 3 — אישורי הגעה"
          title="כך אנחנו מרכזים את אישורי ההגעה"
        />

        <div className="max-w-2xl mx-auto">
          {/* Label */}
          <div
            className="flex items-center justify-center gap-2 mb-8 px-5 py-2.5 rounded-full mx-auto w-fit"
            style={{ background: "rgba(197,164,109,0.10)", border: `1px solid ${G.border}` }}
          >
            <span style={{ color: G.goldMuted }}>✦</span>
            <p className="text-xs font-semibold" style={{ color: G.dark, fontFamily: "Heebo, sans-serif" }}>
              דוגמה להמחשת שירות אישורי ההגעה
            </p>
            <span style={{ color: G.goldMuted }}>✦</span>
          </div>

          {/* Status summary row */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { label: "אישרו הגעה",  value: confirmed, icon: <CheckCircle size={14} />, color: G.olive,    bg: "rgba(107,123,90,0.09)"  },
              { label: "ממתינים",     value: pending,   icon: <Clock       size={14} />, color: G.gold,     bg: "rgba(197,164,109,0.09)" },
              { label: "לא מגיעים",  value: declined,  icon: <XCircle     size={14} />, color: G.darkMuted, bg: "rgba(51,51,51,0.05)"   },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-4 px-3 rounded-2xl text-center"
                style={{ background: s.bg, border: `1px solid ${s.bg.replace("0.09","0.20").replace("0.05","0.10")}` }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <p className="text-xl font-bold mt-1.5" style={{ color: s.color, fontFamily: "Frank Ruhl Libre, serif" }}>{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(["all","confirmed","pending","declined"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  fontFamily: "Heebo, sans-serif",
                  background: filter === f ? `linear-gradient(135deg,${G.gold},${G.goldLight})` : "rgba(197,164,109,0.10)",
                  color:      filter === f ? G.white : G.dark,
                }}
              >
                {{ all: "הכל", confirmed: "אישרו", pending: "ממתינים", declined: "לא מגיעים" }[f]}
              </button>
            ))}
          </div>

          {/* Guest rows */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${G.border}`, boxShadow: "0 4px 20px rgba(197,164,109,0.08)" }}
          >
            <div
              className="grid grid-cols-3 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "rgba(197,164,109,0.06)", color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}
            >
              <span>שם / משפחה</span>
              <span className="text-center">כמות</span>
              <span className="text-left">סטטוס</span>
            </div>
            {filtered.map((g, i) => {
              const sc = statusCfg[g.status];
              return (
                <div
                  key={g.name}
                  className="grid grid-cols-3 px-5 py-3.5 items-center"
                  style={{ borderTop: `1px solid ${G.borderSoft}`, background: G.white }}
                >
                  <span className="text-sm font-medium" style={{ color: G.dark, fontFamily: "Heebo, sans-serif" }}>{g.name}</span>
                  <span className="text-sm text-center" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{g.guests}</span>
                  <span>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: sc.bg, color: sc.color, fontFamily: "Heebo, sans-serif" }}
                    >
                      {sc.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "rgba(51,51,51,0.38)", fontFamily: "Heebo, sans-serif" }}>
            * נתונים לדוגמה בלבד — כך נארגן את האישורים עבורכם
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   Section 4 — WhatsApp reminder examples
════════════════════════════════════════════════ */
const REMINDERS = [
  {
    timing: "4 שבועות לפני האירוע",
    label:  "תזכורת ראשונה",
    sent:   "כל המוזמנים שלא אישרו",
    msg:    "שלום 😊\nהגעתם להזמנה לחתונת נועה ואורי — ואנחנו שמחים!\nעדיין לא אישרתם הגעה?\nלחצו על הקישור ואשרו בקלות:\nraga-lifnei.co.il/noaanduri2026\nנשמח לראותכם! 🤍",
  },
  {
    timing: "2 שבועות לפני האירוע",
    label:  "תזכורת שנייה",
    sent:   "שעדיין לא הגיבו",
    msg:    "היי! 👋\nאנחנו ב-14 ימים בלבד מחתונת נועה ואורי 🥂\nאם עוד לא אישרתם הגעה — נשמח מאוד לדעת!\nraga-lifnei.co.il/noaanduri2026\nתודה רבה! 💛",
  },
  {
    timing: "שבוע לפני האירוע",
    label:  "תזכורת אחרונה",
    sent:   "ממתינים אחרונים",
    msg:    "האירוע כבר ממש בפתח! 🎉\nחתונת נועה ואורי — 16 אוקטובר, אולם המלכות.\nזו ההזדמנות האחרונה לאשר הגעה:\nraga-lifnei.co.il/noaanduri2026\nמחכים לראותכם! 🤍",
  },
];

function RemindersSection() {
  const [active, setActive] = useState(0);
  const r = REMINDERS[active];

  return (
    <section className="py-16 px-4" style={{ background: G.white }}>
      <div className="container-max mx-auto">
        <SectionHeader
          eyebrow="שלב 4 — תזכורות"
          title="תזכורות למוזמנים"
          sub="לכל מי שעוד לא אישר הגעה — שולחים תזכורת אישית ומכובדת בוואטסאפ. בדרך כלל 2–3 תזכורות לאורך התקופה."
        />

        <div className="max-w-xl mx-auto">
          {/* Timeline selector */}
          <div className="relative mb-8">
            {/* Connecting line */}
            <div className="absolute top-4 right-4 left-4 h-px hidden sm:block" style={{ background: `linear-gradient(90deg,transparent,${G.border},transparent)` }} />
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {REMINDERS.map((rem, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
                    style={{
                      background: active === i ? `linear-gradient(135deg,${G.gold},${G.goldLight})` : "rgba(197,164,109,0.12)",
                      color:      active === i ? G.white : G.goldMuted,
                      boxShadow:  active === i ? "0 4px 14px rgba(197,164,109,0.30)" : "none",
                      fontFamily: "Frank Ruhl Libre, serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold" style={{ color: active === i ? G.dark : G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
                      {rem.label}
                    </p>
                    <p className="text-[10px]" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
                      {rem.timing}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone mockup with WhatsApp bubble */}
          <div
            className="relative mx-auto rounded-3xl overflow-hidden p-5"
            style={{
              maxWidth:   340,
              background: `linear-gradient(160deg,${G.cream},${G.creamDeep})`,
              border:     `1px solid ${G.border}`,
              boxShadow:  "0 16px 48px rgba(197,164,109,0.12)",
            }}
          >
            {/* WhatsApp header bar */}
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: `1px solid ${G.borderSoft}` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#25D366" }}>
                <MessageCircle size={16} color="white" />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: G.dark, fontFamily: "Heebo, sans-serif" }}>רגע לפני — הזמנות</p>
                <p className="text-[10px]" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>מקוון</p>
              </div>
              <span
                className="mr-auto text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(197,164,109,0.12)", color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}
              >
                {r.label}
              </span>
            </div>

            {/* Message bubble */}
            <div className="flex justify-end">
              <div
                className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3"
                style={{ background: "#DCF8C6" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#1A1A1A", fontFamily: "Heebo, sans-serif" }}>
                  {r.msg}
                </p>
                <p className="text-[10px] text-left mt-2" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "Heebo, sans-serif" }}>
                  12:34 ✓✓
                </p>
              </div>
            </div>

            <p className="text-center text-[10px] mt-4" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
              נשלח ל: {r.sent}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   Section 5 — Final event summary
════════════════════════════════════════════════ */
function SummarySection() {
  return (
    <section className="py-16 px-4" style={{ background: `linear-gradient(160deg,${G.ivory} 0%,${G.cream} 100%)` }}>
      <div className="container-max mx-auto">
        <SectionHeader
          eyebrow="שלב 5 — סיכום"
          title="תמונת מצב לפני האירוע"
          sub="לקראת האירוע, מסכמים עבורכם את כל האישורים ומוסרים את הרשימה המסודרת."
        />

        {/* Summary card */}
        <div
          className="max-w-lg mx-auto rounded-3xl overflow-hidden"
          style={{ border: `1px solid rgba(197,164,109,0.28)`, boxShadow: "0 16px 56px rgba(197,164,109,0.10)" }}
        >
          {/* Gold header */}
          <div
            className="px-8 py-6 text-center"
            style={{ background: `linear-gradient(135deg,${G.gold},${G.goldLight})` }}
          >
            <p className="text-xs tracking-[0.22em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Heebo, sans-serif" }}>
              סיכום שירות אישורי הגעה
            </p>
            <p className="text-2xl font-bold" style={{ color: G.white, fontFamily: "Frank Ruhl Libre, serif" }}>
              חתונת נועה ואורי
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Heebo, sans-serif" }}>
              16 אוקטובר 2026 · אולם המלכות, תל אביב
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-7" style={{ background: G.white }}>
            <div className="space-y-4 mb-7">
              {[
                { label: "סך מוזמנים",              value: "287 אנשים"   },
                { label: "אישרו הגעה",               value: "214 אנשים"  },
                { label: "לא מגיעים",               value: "32 אנשים"   },
                { label: "ממתינים לתשובה",          value: "41 אנשים"   },
                { label: "תזכורות שנשלחו",          value: "3 תזכורות"  },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${G.borderSoft}` }}>
                  <span className="text-sm" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{row.label}</span>
                  <span className="text-sm font-semibold" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Confirmed guests preview */}
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
              מוזמנים מאושרים (לדוגמה)
            </p>
            <div className="space-y-2">
              {RSVP_GUESTS.filter((g) => g.status === "confirmed").map((g) => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.olive }} />
                    <span className="text-sm" style={{ color: G.dark, fontFamily: "Heebo, sans-serif" }}>{g.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>{g.guests} אנשים</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 text-center"
            style={{ background: "rgba(197,164,109,0.05)", borderTop: `1px solid ${G.borderSoft}` }}
          >
            <p className="text-xs" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
              * דוגמה להמחשה בלבד — הנתונים הם פיקטיביים
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   Page wrapper
════════════════════════════════════════════════ */
export default function DashboardDemo() {
  return (
    <div className="min-h-screen" style={{ background: G.cream }}>

      {/* Top bar */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(253,250,245,0.94)", borderColor: "rgba(197,164,109,0.15)", backdropFilter: "blur(12px)" }}
      >
        <div className="container-max mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowRight size={16} style={{ color: G.gold }} />
            <span className="text-sm font-medium" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>חזרה לאתר</span>
          </Link>
          <p className="text-sm font-bold" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            כך השירות שלנו עובד
          </p>
          <span
            className="text-[10px] font-semibold px-3 py-1 rounded-full"
            style={{ background: "rgba(197,164,109,0.12)", color: G.gold, fontFamily: "Heebo, sans-serif" }}
          >
            הדגמה
          </span>
        </div>
      </header>

      {/* Page hero */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: `linear-gradient(160deg,${G.cream} 0%,${G.creamDeep} 100%)` }}
      >
        <div className="absolute inset-0 pattern-overlay opacity-40 pointer-events-none" />
        <div className="relative z-10 container-max mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-14 h-px" style={{ background: `linear-gradient(90deg,transparent,${G.gold})` }} />
            <span style={{ color: G.goldMuted }}>✦</span>
            <span className="w-14 h-px" style={{ background: `linear-gradient(90deg,${G.gold},transparent)` }} />
          </div>
          <h1
            className="text-3xl md:text-4xl xl:text-5xl font-bold mb-4 leading-tight"
            style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}
          >
            מההזמנה הראשונה
            <br />
            <span className="shimmer-text">ועד ליום האירוע</span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif", fontWeight: 300, lineHeight: 1.85 }}>
            הצצה לשירות המלא — הזמנה דיגיטלית, דף אירוע, אישורי הגעה ותזכורות
          </p>
        </div>
      </div>

      {/* Section dividers */}
      <InvitationSection />
      <div className="px-4 py-2 container-max mx-auto"><GoldDivider /></div>
      <EventPageSection />
      <div className="px-4 py-2 container-max mx-auto"><GoldDivider /></div>
      <RsvpSection />
      <div className="px-4 py-2 container-max mx-auto"><GoldDivider /></div>
      <RemindersSection />
      <div className="px-4 py-2 container-max mx-auto"><GoldDivider /></div>
      <SummarySection />

      {/* CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: "linear-gradient(135deg,#3E5435 0%,#6B7B5A 100%)" }}
      >
        <div className="container-max mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-14 h-px" style={{ background: "rgba(197,164,109,0.40)" }} />
            <span style={{ color: "rgba(197,164,109,0.70)" }}>✦</span>
            <span className="w-14 h-px" style={{ background: "rgba(197,164,109,0.40)" }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
            רוצים שנעשה את זה עבורכם?
          </h2>
          <p className="text-white/60 text-base mb-9 max-w-sm mx-auto" style={{ fontFamily: "Heebo, sans-serif" }}>
            שלחו הודעה ונחזור אליכם תוך שעות עם הצעת מחיר אישית
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg,${G.gold},${G.goldLight})`,
              color:      G.dark,
              fontFamily: "Heebo, sans-serif",
              boxShadow:  "0 8px 28px rgba(197,164,109,0.35)",
            }}
          >
            <MessageCircle size={20} />
            שלחו הודעה בוואטסאפ
          </a>
          <p className="mt-5 text-white/30 text-xs" style={{ fontFamily: "Heebo, sans-serif" }}>
            מחיר החל מ-₪70 · ללא התחייבות
          </p>
        </div>
      </section>
    </div>
  );
}
