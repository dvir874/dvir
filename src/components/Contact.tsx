"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Phone, MessageCircle, Mail, CheckCircle } from "lucide-react";
import { WA_URL_FOOTER as WA_URL, WA_PHONE, PHONE_DISPLAY, PHONE_HREF, EMAIL } from "@/lib/constants";

const EVENT_TYPES = [
  "חתונה", "אירוסין", "חינה", "בר מצווה", "בת מצווה",
  "ברית מילה", "בריתה", "יום הולדת", "אירוע משפחתי", "אחר",
];

interface FormState {
  name: string;
  phone: string;
  eventType: string;
  eventDate: string;
  notes: string;
}

export default function Contact() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", eventType: "", eventDate: "", notes: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "נא למלא שם";
    const clean = form.phone.replace(/[-\s]/g, "");
    if (!clean || !/^0\d{8,9}$/.test(clean)) e.phone = "מספר לא תקין";
    if (!form.eventType) e.eventType = "נא לבחור סוג אירוע";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Detect referral code from cookie or URL param
    const refCode = document.cookie.match(/ref_code=([^;]+)/)?.[1]
      ?? new URLSearchParams(window.location.search).get("ref")
      ?? null;

    // Detect source from URL params or referrer
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const source = refCode ? "referral"
      : utmSource ? utmSource
      : document.referrer.includes("facebook") ? "facebook"
      : document.referrer.includes("instagram") ? "instagram"
      : document.referrer.includes("google") ? "google"
      : "organic";

    // Save lead to CRM (fire-and-forget — don't block WhatsApp open)
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        event_type: form.eventType,
        wedding_date: form.eventDate || null,
        notes: form.notes || null,
        source,
        ref_code: refCode,
      }),
    }).catch(() => {}); // silent — don't block UX on API failure

    const text = encodeURIComponent(
      `שלום דביר, הגעתי דרך אתר רגע לפני ואני מעוניין לקבל פרטים על הזמנה דיגיטלית.\n\n` +
      `*שם:* ${form.name}\n` +
      `*טלפון:* ${form.phone}\n` +
      `*סוג אירוע:* ${form.eventType}\n` +
      `*תאריך:* ${form.eventDate || "לא צוין"}\n` +
      `*הערות:* ${form.notes || "אין"}`
    );

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.open(`https://wa.me/${WA_PHONE}?text=${text}`, "_blank");
    }, 900);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormState]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/28 to-transparent" />
      <div className="absolute inset-0 pattern-overlay opacity-28" />

      <div className="container-max mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* ── Left info ── */}
          <div className={`lg:col-span-2 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <p className="text-gold text-xs tracking-[0.22em] mb-3 uppercase" style={{ fontFamily: "Heebo, sans-serif" }}>
              בואו נדבר
            </p>
            <h2 className="section-title text-right mb-0">צרו קשר</h2>
            <div className="w-14 h-0.5 bg-gold my-6" />
            <p className="text-dark/60 leading-relaxed mb-9 text-sm" style={{ fontFamily: "Heebo, sans-serif" }}>
              מלאו את הטופס ואחזור אליכם בהקדם.
              <br />
              לחלופין, דברו איתי ישירות בוואטסאפ, בטלפון או במייל.
            </p>

            {/* Contact methods */}
            <div className="space-y-3">
              <ContactRow
                href={WA_URL}
                external
                iconBg="#22c55e"
                icon={<MessageCircle size={19} color="white" />}
                label="וואטסאפ"
                value={PHONE_DISPLAY}
                sub="דביר · זמין 07:00–22:00"
              />
              <ContactRow
                href={PHONE_HREF}
                iconBg="linear-gradient(135deg,#C5A46D,#D4BC8A)"
                icon={<Phone size={19} color="white" />}
                label="טלפון"
                value={PHONE_DISPLAY}
                sub="שיחה או SMS"
              />
              <ContactRow
                href={`mailto:${EMAIL}`}
                iconBg="linear-gradient(135deg,#6B7B5A,#4A5E3A)"
                icon={<Mail size={19} color="white" />}
                label="מייל"
                value={EMAIL}
                sub="מענה תוך 24 שעות"
              />
            </div>

            {/* Micro trust */}
            <div className="mt-9 grid grid-cols-2 gap-3">
              {[
                { e: "⚡", t: "מענה מהיר" },
                { e: "🔄", t: "תיקונים עד אישור" },
                { e: "💬", t: "שירות בוואטסאפ" },
                { e: "✨", t: "עיצוב 100% אישי" },
              ].map((b) => (
                <div key={b.t} className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "rgba(107,123,90,0.08)", border: "1px solid rgba(107,123,90,0.13)", fontFamily: "Heebo, sans-serif" }}>
                  <span className="text-sm">{b.e}</span>
                  <span className="text-dark/60 text-xs">{b.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <div className={`lg:col-span-3 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div
              className="rounded-3xl p-8 md:p-10 shadow-xl"
              style={{ background: "rgba(255,255,255,0.93)", border: "1px solid rgba(197,164,109,0.18)", backdropFilter: "blur(20px)" }}
            >
              {submitted ? (
                <SuccessState onReset={() => { setSubmitted(false); setForm({ name:"",phone:"",eventType:"",eventDate:"",notes:"" }); setErrors({}); }} />
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-dark" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
                      שלחו לדביר פרטים
                    </h3>
                    <p className="text-dark/40 text-sm mt-1" style={{ fontFamily: "Heebo, sans-serif" }}>
                      ואחזור אליכם בהקדם האפשרי
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="שם מלא" name="name" type="text" placeholder="השם שלכם" value={form.name} error={errors.name} onChange={handleChange} required />
                    <Field label="טלפון" name="phone" type="tel" placeholder={PHONE_DISPLAY} value={form.phone} error={errors.phone} onChange={handleChange} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-dark/72" style={{ fontFamily: "Heebo, sans-serif" }}>
                        סוג אירוע <span className="text-gold">*</span>
                      </label>
                      <select
                        name="eventType" value={form.eventType} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border text-dark text-sm bg-cream transition-all duration-200 ${errors.eventType ? "border-red-400" : "border-cream-dark focus:border-gold"}`}
                        style={{ fontFamily: "Heebo, sans-serif" }}
                      >
                        <option value="">בחרו סוג אירוע</option>
                        {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.eventType && <p className="text-red-400 text-xs" style={{ fontFamily: "Heebo, sans-serif" }}>{errors.eventType}</p>}
                    </div>
                    <Field label="תאריך אירוע" name="eventDate" type="date" placeholder="" value={form.eventDate} onChange={handleChange} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-dark/72" style={{ fontFamily: "Heebo, sans-serif" }}>
                      הערות ובקשות
                    </label>
                    <textarea
                      name="notes" value={form.notes} onChange={handleChange} rows={4}
                      placeholder="ספרו לדביר על הסגנון, צבעים, מה חשוב לכם..."
                      className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream text-dark text-sm resize-none transition-all duration-200 focus:border-gold"
                      style={{ fontFamily: "Heebo, sans-serif" }}
                    />
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="btn-primary w-full justify-center gap-3 py-4 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />שולחים...</>
                    ) : (
                      <><Send size={17} />שלחו לוואטסאפ</>
                    )}
                  </button>

                  <p className="text-center text-dark/35 text-xs" style={{ fontFamily: "Heebo, sans-serif" }}>
                    הטופס ישלח אתכם ישירות לוואטסאפ של דביר
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ href, external, iconBg, icon, label, value, sub }: {
  href: string; external?: boolean; iconBg: string;
  icon: React.ReactNode; label: string; value: string; sub: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-2xl group transition-all duration-280 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(197,164,109,0.16)" }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-dark text-sm" style={{ fontFamily: "Heebo, sans-serif" }}>{value}</p>
        <p className="text-dark/42 text-xs mt-0.5" style={{ fontFamily: "Heebo, sans-serif" }}>{label} · {sub}</p>
      </div>
    </a>
  );
}

function Field({ label, name, type, placeholder, value, error, onChange, required }: {
  label: string; name: string; type: string; placeholder: string; value: string;
  error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-dark/72" style={{ fontFamily: "Heebo, sans-serif" }}>
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border bg-cream text-dark text-sm transition-all duration-200 ${error ? "border-red-400" : "border-cream-dark focus:border-gold"}`}
        style={{ fontFamily: "Heebo, sans-serif" }}
      />
      {error && <p className="text-red-400 text-xs" style={{ fontFamily: "Heebo, sans-serif" }}>{error}</p>}
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,rgba(107,123,90,0.15),rgba(197,164,109,0.15))" }}>
        <CheckCircle size={40} className="text-olive" />
      </div>
      <h3 className="text-2xl font-bold text-dark mb-3" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
        דביר כבר בדרך אליכם! 🎉
      </h3>
      <p className="text-dark/55 text-sm leading-relaxed mb-8" style={{ fontFamily: "Heebo, sans-serif" }}>
        הפרטים נשלחו בוואטסאפ.<br />
        דביר יחזור אליכם בהקדם 😊
      </p>
      <button onClick={onReset} className="btn-outline text-sm py-2.5 px-6">שלחו פנייה נוספת</button>
    </div>
  );
}
