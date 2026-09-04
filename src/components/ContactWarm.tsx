"use client";

/** ContactWarm — editorial contact: WhatsApp lead form + contact cards.
 * Based on approved Stitch "צור קשר - הפקה עורכית" (screen bcd6eee6).
 * Form submits straight to WhatsApp (no backend dependency). */

import { useState } from "react";
import { MessageCircle, Phone, Mail, Send } from "lucide-react";
import { WA_PHONE } from "@/lib/constants";

const EVENT_TYPES = ["חתונה", "חינה", "בר מצווה", "בת מצווה", "ברית", "ברית בנות", "יום הולדת", "אחר"];

export default function ContactWarm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = `שלום דביר, הגעתי מהאתר רגע לפני.\n\nשם: ${name}\nטלפון: ${phone}\nסוג אירוע: ${type}\nתאריך: ${date}\nהערות: ${notes}`;

    /* Record before handing off to WhatsApp.
     *
     * This form asks for a name, a phone, an event type and a date, and until
     * now it threw all four away: submitting only opened wa.me with the fields
     * pasted into a message. If the person then closed WhatsApp without
     * pressing send — or the message simply scrolled away among a hundred other
     * chats — the enquiry left no trace anywhere. Two arrived on 30/08 and
     * existed only in Dvir's phone.
     *
     * Not awaited, and deliberately: window.open must run in the same tick as
     * the click or the browser treats it as an unrequested popup and blocks it.
     * keepalive lets the request outlive the tab losing focus. A lead that
     * fails to record must still reach WhatsApp, so the catch stays silent. */
    const refCode = refCodeOf();
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: name.trim() || "(ללא שם)",
        phone: phone.trim(),
        event_type: type || null,
        wedding_date: date || null,
        /* lead_source is a closed enum — referral | instagram | facebook |
           google | organic | unknown — with no member for "came from the
           site". organic is the honest fit, and the exact CTA goes in
           ref_code, which is free text. Sending "site:contact-form" here
           returns a 22P02 the silent catch would have swallowed. */
        /* Where they actually came from, when we know.
         *
         * This sent "organic" and "site:contact-form" on every submission,
         * hard-coded — so a lead from שחר's wedding, a lead from Google and a
         * lead from a referral link were all recorded identically, and there
         * was no way to tell which wedding was worth asking for a
         * recommendation. The referral counters could never agree with the
         * lead counters because one side was never written.
         *
         * lead_source is a closed enum — referral | instagram | facebook |
         * google | organic | unknown — and anything else returns 22P02, which
         * the silent catch below would swallow along with the whole lead. So
         * the enum is chosen here and the free-text code carries the detail. */
        source: refCode ? "referral" : "organic",
        ref_code: refCode || "site:contact-form",
        notes: notes.trim() || null,
      }),
    }).catch(() => {});

    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(raw)}`, "_blank", "noopener,noreferrer");
  };

  /* Cookie first, then ?ref= — a browser that refused the cookie still carries
     it in the URL, and /ref/[code] sets both for exactly that reason. */
  const refCodeOf = (): string => {
    if (typeof document === "undefined") return "";
    const c = document.cookie.match(/(?:^|;\s*)ref_code=([^;]+)/);
    if (c) return decodeURIComponent(c[1]).slice(0, 40);
    const q = new URLSearchParams(window.location.search).get("ref");
    return q ? q.slice(0, 40) : "";
  };

  const field = "w-full rounded-field bg-cream px-4 py-3 font-body text-[15px] text-ink placeholder-ink/40 outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <section dir="rtl" className="relative w-full bg-cream py-16 lg:py-20 px-6 lg:px-12">
      <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-2 lg:items-start">
        {/* form */}
        <form onSubmit={submit} className="rounded-card bg-surface-raised p-7 lg:p-9 shadow-card">
          <h3 className="text-center font-display text-2xl font-bold text-ink">שלחו לדביר פרטים</h3>
          <p className="mb-6 text-center font-body text-sm text-ink/50">ואחזור אליכם תוך 24 שעות</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className={field} placeholder="השם שלכם" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className={field} placeholder="053-331-8177" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <select className={field} value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="">בחרו סוג אירוע</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <textarea className={`${field} mt-4 min-h-28`} placeholder="ספרו לדביר על הסגנון, צבעים, מה חשוב לכם…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-pill bg-gold py-4 font-body text-[15px] font-semibold text-ink shadow-raised">
            <Send className="w-4 h-4" /> שלחו לוואטסאפ
          </button>
          <p className="mt-3 text-center font-body text-[12px] text-ink/45">הטופס ישלח אתכם ישירות לוואטסאפ של דביר</p>
        </form>

        {/* contact info */}
        <div className="lg:pt-4">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">בואו נדבר</p>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-black text-ink">צרו קשר</h2>
          <p className="mt-4 font-body text-[15px] font-light leading-relaxed text-ink/60">
            מלאו את הטופס ואחזור אליכם בהקדם. לחלופין, דברו איתי ישירות בוואטסאפ, בטלפון או במייל.
          </p>

          <div className="mt-7 space-y-3">
            {[
              { Icon: MessageCircle, label: "וואטסאפ", val: "053-331-8177", sub: "זמין 07:00–22:00", href: `https://wa.me/${WA_PHONE}`, tone: "bg-olive text-white" },
              { Icon: Phone, label: "טלפון", val: "053-331-8177", sub: "שיחה או SMS", href: "tel:0533318177", tone: "bg-gold text-white" },
              { Icon: Mail, label: "אימייל", val: "dvir874@gmail.com", sub: "מענה תוך 24 שעות", href: "mailto:dvir874@gmail.com", tone: "bg-olive text-white" },
            ].map(({ Icon, label, val, sub, href, tone }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-card bg-surface-raised p-4 shadow-card">
                <div className="text-right">
                  <div className="font-body font-bold text-ink" dir="ltr">{val}</div>
                  <div className="font-body text-[13px] text-ink/50">{label} · {sub}</div>
                </div>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["מענה תוך 24 שעות", "ללא התחייבות", "שירות בוואטסאפ", "הצעה אישית לכל אירוע"].map((p) => (
              <span key={p} className="rounded-pill border border-olive/30 bg-ivory px-4 py-2 font-body text-[13px] text-ink/60">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
