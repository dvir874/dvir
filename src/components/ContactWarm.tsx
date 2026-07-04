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
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(raw)}`, "_blank", "noopener,noreferrer");
  };

  const field = "w-full rounded-field bg-cream px-4 py-3 font-body text-[15px] text-ink placeholder-ink/40 outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <section dir="rtl" className="relative w-full bg-cream py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-2 lg:items-start">
        {/* form */}
        <form onSubmit={submit} className="rounded-card bg-surface-raised p-7 lg:p-9 shadow-card">
          <h3 className="text-center font-display text-2xl font-bold text-ink">שלחו לדביר פרטים</h3>
          <p className="mb-6 text-center font-body text-sm text-ink/50">ואחזור אליכם תוך 24 שעות</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className={field} placeholder="השם שלכם" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className={field} placeholder="053-3318177" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
              { Icon: MessageCircle, label: "וואטסאפ", val: "053-3318177", sub: "זמין 07:00–22:00", href: `https://wa.me/${WA_PHONE}`, tone: "bg-olive text-white" },
              { Icon: Phone, label: "טלפון", val: "053-3318177", sub: "שיחה או SMS", href: "tel:0533318177", tone: "bg-gold text-white" },
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
