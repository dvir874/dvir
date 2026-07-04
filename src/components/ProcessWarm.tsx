"use client";

/** ProcessWarm — 5-step editorial journey "invitation → event day".
 * Based on approved Stitch "מההזמנה ועד האירוע - הפקה עורכית" (screen 4e53a406).
 * Mockups built in CSS; invitation images pulled from Stitch. */

import Image from "next/image";
import { MessageCircle, MapPin, CalendarCheck, Check, Clock, X, Sparkles } from "lucide-react";
import { WA_URL } from "@/lib/constants";

function StepHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="relative mb-6">
      <span className="pointer-events-none absolute -top-8 -right-2 font-display text-[96px] font-black leading-none text-gold/12 select-none" aria-hidden>{n}</span>
      <p className="relative font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-gold">שלב {n}</p>
      <h3 className="relative mt-1 font-display text-2xl lg:text-3xl font-bold text-ink">{title}</h3>
    </div>
  );
}

export default function ProcessWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        <div className="text-center mb-16">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">כך השירות שלנו עובד</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black leading-tight text-ink">
            מההזמנה הראשונה<span className="block text-gold">ועד ליום האירוע</span>
          </h2>
          <p className="mt-4 font-body text-lg font-light text-ink/55">
            הצצה לפלטפורמה. ניהול אורחים, הושבה, תקציב, משימות ואישורי הגעה
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1 */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-72 overflow-hidden rounded-card shadow-card"><Image src="/redesign/invitation-3.webp" alt="הזמנת חתונה" fill className="object-cover" sizes="50vw" /></div>
              <div className="relative h-72 overflow-hidden rounded-card shadow-card mt-8"><Image src="/redesign/invitation-1.webp" alt="הזמנת חתונה" fill className="object-cover" sizes="50vw" /></div>
            </div>
            <div>
              <StepHead n="01" title="כך נראית ההזמנה" />
              <p className="font-body text-[15px] font-light leading-relaxed text-ink/65">
                כל הזמנה מעוצבת מאפס. בסגנון, בצבעים ובאווירה שמדברים עליכם. מקבלים קובץ מוכן לשיתוף בוואטסאפ.
              </p>
              <div className="mt-5 rounded-card bg-cream p-6">
                <p className="font-display text-lg font-bold text-ink">לא מצאתם בדיוק את הסגנון שלכם?</p>
                <p className="mt-2 font-body text-[14px] font-light text-ink/60">שלחו לנו בוואטסאפ תמונה או השראה — ואנחנו נעצב עבורכם הזמנה אישית בהתאמה מלאה.</p>
                <ul className="mt-4 space-y-1.5 font-body text-[14px] text-ink/70">
                  <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> עיצוב אישי</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> התאמה מלאה לצבעים ולסגנון שלכם</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> ליווי אישי עד לתוצאה</li>
                </ul>
                <a href={WA_URL} className="mt-5 inline-flex items-center gap-2 rounded-pill bg-[#25D366] px-6 py-3 font-body text-[14px] font-semibold text-white">
                  <MessageCircle className="w-4 h-4" /> שלחו לנו השראה בוואטסאפ
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <StepHead n="02" title="דף האירוע שלכם" />
              <p className="font-body text-[15px] font-light leading-relaxed text-ink/65">
                האורחים פותחים קישור ורואים את כל פרטי האירוע: ספירת לאחור, ניווט, ואישור הגעה.
              </p>
              <a href="/event/demo" className="mt-4 inline-block font-body font-semibold text-gold underline underline-offset-4">צפו בדף אירוע אמיתי לדוגמה ←</a>
            </div>
            <div className="mx-auto w-[280px] rounded-[32px] border-8 border-ink/90 bg-white p-4 shadow-modal">
              <div className="h-28 rounded-2xl bg-gradient-to-t from-ink/70 to-gold/40" />
              <p className="mt-3 text-center font-display text-lg font-bold text-ink">נועה ואורי</p>
              <p className="text-center font-body text-[12px] text-ink/50">16 באוקטובר 2026 · אולם המלכות</p>
              <div className="my-3 flex justify-center gap-3 font-display text-xl font-black text-gold">
                <span>08</span>:<span>14</span>
              </div>
              <button className="w-full rounded-pill bg-gold py-2.5 font-body text-[13px] font-semibold text-ink flex items-center justify-center gap-1"><CalendarCheck className="w-4 h-4" /> אישור הגעה</button>
              <button className="mt-2 w-full rounded-pill border border-cream py-2.5 font-body text-[13px] text-ink/70 flex items-center justify-center gap-1"><MapPin className="w-4 h-4" /> ניווט Waze</button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="rounded-card bg-surface-raised p-6 shadow-card">
              <p className="mb-4 text-center font-body text-[12px] text-ink/40">דוגמה להמחשת שירות אישורי ההגעה</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["13", "אישרו", "text-olive"], ["2", "ממתינים", "text-gold"], ["3", "לא מגיעים", "text-danger"]].map(([n, l, c]) => (
                  <div key={l} className="rounded-xl bg-cream/60 py-4"><div className={`font-display text-2xl font-black ${c}`}>{n}</div><div className="font-body text-[11px] text-ink/50">{l}</div></div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { name: "משפחת כהן", st: "אישרו (4)", cls: "bg-olive/10 text-olive", I: Check },
                  { name: "יובל ודנה", st: "ממתינים", cls: "bg-gold/10 text-gold", I: Clock },
                  { name: "רון לוי", st: "לא מגיע", cls: "bg-danger/10 text-danger", I: X },
                ].map(({ name, st, cls, I }) => (
                  <div key={name} className="flex items-center justify-between border-b border-cream/70 py-2 font-body text-[14px]">
                    <span className="text-ink/75">{name}</span>
                    <span className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-[12px] ${cls}`}><I className="w-3 h-3" />{st}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-body text-[11px] text-ink/40">* נתונים לדוגמה בלבד</p>
            </div>
            <div>
              <StepHead n="03" title="כך אנחנו מרכזים את אישורי ההגעה" />
              <p className="font-body text-[15px] font-light leading-relaxed text-ink/65">
                מערכת חכמה שעוקבת אחרי כל אישור בזמן אמת, מציגה תמונת מצב ברורה ומאפשרת ניהול קל של הרשימות.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <StepHead n="04" title="תזכורות למוזמנים" />
              <p className="font-body text-[15px] font-light leading-relaxed text-ink/65">
                לכל מי שעוד לא אישר הגעה, שולחים תזכורת אישית ומכובדת בוואטסאפ. בדרך כלל 2–3 תזכורות לאורך התקופה.
              </p>
              <div className="mt-5 space-y-3">
                {[["1", "תזכורת ראשונה", "4 שבועות לפני"], ["2", "תזכורת שנייה", "2 שבועות לפני"], ["3", "תזכורת אחרונה", "שבוע לפני"]].map(([n, t, s]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold">{n}</span>
                    <span className="font-body text-[14px] font-semibold text-ink">{t}</span>
                    <span className="font-body text-[13px] text-ink/45">· {s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-card bg-cream p-5">
              <div className="rounded-2xl bg-[#e5f4e0] p-4">
                <p className="font-body text-[13px] text-ink/80 leading-relaxed">
                  שלום 😊 הגעתם להזמנה לחתונת נועה ואורי, ואנחנו שמחים! עדיין לא אישרתם הגעה? לחצו על הקישור ואשרו בקלות.
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-pill bg-olive px-3 py-1 font-body text-[12px] text-white">מגיעים בשמחה</span>
                  <span className="rounded-pill border border-ink/15 px-3 py-1 font-body text-[12px] text-ink/60">לצערנו לא</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="rounded-card bg-surface-raised p-6 shadow-card">
              <p className="text-center font-body text-[12px] uppercase tracking-wide text-gold">סיכום שירות אישורי הגעה</p>
              <p className="mb-4 text-center font-display text-lg font-bold text-ink">חתונת נועה ואורי · 16 אוקטובר 2026</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                {[["287", "סך מוזמנים"], ["214", "אישרו הגעה"], ["32", "לא מגיעים"], ["41", "ממתינים"]].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-cream/60 py-3"><div className="font-display text-xl font-black text-ink">{n}</div><div className="font-body text-[11px] text-ink/50">{l}</div></div>
                ))}
              </div>
              <p className="mt-3 font-body text-[11px] text-ink/40">* דוגמה להמחשה בלבד</p>
            </div>
            <div>
              <StepHead n="05" title="תמונת מצב לפני האירוע" />
              <p className="font-body text-[15px] font-light leading-relaxed text-ink/65">
                לקראת האירוע, מסכמים עבורכם את כל האישורים ומוסרים רשימה מסודרת ומוכנה להדפסה למארחות.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
