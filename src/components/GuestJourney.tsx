"use client";

/**
 * GuestJourney — "ככה זה נראה אצל האורחים שלכם".
 *
 * Stitch project 18431120483630512231, screen 2ce3b8fb ("סקשן המסע של אורח"),
 * approved 30/09/2026. Replaces ShowcaseBand, whose headline said "זה לא
 * מוקאפ" above a mockup.
 *
 * The section promises "אלה ההודעות שהאורחים באמת מקבלים", so the phone shows
 * the approved Meta templates, not the copy Stitch wrote for them: the
 * reminder is wedding_reminder_buttons_generic word for word, and step 2 is
 * the personal RSVP page (/try) rather than an in-chat form that does not
 * exist. Two things from the design were dropped on purpose — the stats strip
 * (94%, "3 שניות", "100% שקט נפשי" were invented) and the Waze button (the
 * day-before message carries an address line, not a button). Names are
 * fictional and say so.
 */

import { useEffect, useRef, useState } from "react";
import { MessageCircle, PlayCircle } from "lucide-react";
import { WA_URL } from "@/lib/constants";

type Step = {
  title: string;
  when: string;
  body: string;
  bullets: [string, string];
  date: string;
};

const STEPS: Step[] = [
  {
    title: "ההזמנה",
    when: "4–6 שבועות לפני",
    body: "הודעת וואטסאפ אישית עם ההזמנה שלכם. בלי אפליקציה להוריד ובלי אתר להירשם אליו.",
    bullets: ["ההזמנה המעוצבת שלכם", "נשלח מהמספר העסקי המאומת"],
    date: "12 באוגוסט",
  },
  {
    title: "אישור בלחיצה",
    when: "חצי דקה",
    body: "האורח נכנס לקישור האישי שלו, בוחר כמה מגיעים ואיזו מנה. זה נקלט אצלכם מיד, בלי להקליד כלום.",
    bullets: ["מנות ילדים בנפרד", "אפשר לשנות תשובה"],
    date: "12 באוגוסט",
  },
  {
    title: "תזכורת עדינה",
    when: "אתם לא רודפים אחרי אף אחד",
    body: "רק מי שעוד לא ענה מקבל תזכורת. מי שכבר אישר לא שומע מאיתנו שוב.",
    bullets: ["עד 3 תזכורות", "מי שלא מקבל וואטסאפ מזוהה בשמו"],
    date: "26 באוגוסט",
  },
  {
    title: "ערב לפני: מחר זה קורה",
    when: "אין תור בכניסה",
    body: "כל אורח מקבל את מספר השולחן שלו, שעת קבלת הפנים והכתובת. מגיעים ויושבים.",
    bullets: ["מספר שולחן אישי", "שעות וכתובת האולם"],
    date: "ערב לפני",
  },
];

const COUPLE = "שירה ועומרי";

/* Everything inside the phone. Kept to what the real templates say. */
function Screen({ step }: { step: number }) {
  const bubble = "max-w-[92%] self-start rounded-2xl rounded-tr-sm bg-white p-2.5 shadow-sm border border-black/5";
  const reply = "w-full rounded-xl border border-gray-200 bg-white py-2 text-center text-[12px] font-bold text-[#00A884] shadow-sm";

  if (step === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className={bubble}>
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-[#E9DFCF] bg-gradient-to-br from-cream to-[#EAE0D0] text-center">
            <div className="font-display text-base font-black text-ink">שירה & עומרי</div>
            <div className="mt-0.5 text-[10px] font-medium text-gold-text">18.11.2026 · קבלת פנים 19:00</div>
          </div>
          <p className="p-1 pt-2 text-[12px] leading-relaxed text-ink">
            💍 <strong>משפחה וחברים יקרים!</strong>
            <br />
            בעזרת ה׳ {COUPLE} מתחתנים, ונשמח לראותכם.
            <br />
            📅 יום רביעי, 18.11.2026
            <br />
            📍 אולמי הגן, רחוב האלון 4
            <br />
            🥂 קבלת פנים 19:00 | חופה 20:00
          </p>
          <div className="px-1 text-left text-[9px] text-gray-400">14:20</div>
        </div>
        <div className="flex w-[92%] self-start">
          <span className={reply}>🔗 לאישור ההגעה שלכם</span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-2">
        <div className="self-center rounded-md bg-white/80 px-2 py-0.5 text-[10px] text-gray-500">הקישור האישי נפתח</div>
        <div className="rounded-2xl border border-[#E9DFCF] bg-ivory p-3 shadow-sm">
          <div className="text-center font-display text-sm font-black text-ink">{COUPLE} מתחתנים</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[11px] font-bold">
            <span className="rounded-lg bg-gold py-1.5 text-ink">✓ מגיעים</span>
            <span className="rounded-lg border border-gray-200 bg-white py-1.5 text-gray-500">לא מגיעים</span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between rounded-lg bg-white px-2 py-1.5">
              <span className="text-ink/70">כמה מגיעים</span>
              <span className="font-bold text-ink">2</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-2 py-1.5">
              <span className="text-ink/70">מנה</span>
              <span className="font-bold text-olive">בשרי ×2</span>
            </div>
          </div>
          <div className="mt-2.5 rounded-lg bg-olive/15 py-1.5 text-center text-[11px] font-bold text-olive">
            תודה! נתראה בחתונה 🤍
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-2">
        <div className={bubble}>
          <p className="p-1 text-[12px] leading-relaxed text-ink">
            💍 <strong>משפחה וחברים יקרים!</strong>
            <br />
            <br />
            דנה, טרם קיבלנו את אישור ההגעה שלכם לחתונה של {COUPLE} ב-18.11.
            <br />
            <br />
            נשמח לדעת אם תגיעו, כדי להשלים את רשימת המקומות באולם.
          </p>
          <div className="px-1 text-left text-[9px] text-gray-400">10:15</div>
        </div>
        <div className="flex w-[92%] flex-col gap-1.5 self-start">
          <span className={reply}>מגיעים</span>
          <span className={`${reply} !text-rose-600`}>לא מגיעים</span>
        </div>
        <div className="self-center rounded-full border border-[#E9DFCF] bg-cream px-3 py-1 text-[10px] font-medium text-gold-text">
          נשלח רק למי שעוד לא ענה
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={bubble}>
        <p className="p-1 text-[12px] leading-relaxed text-ink">
          💍 <strong>משפחה וחברים יקרים!</strong>
          <br />
          מחר מתחתנים <strong>{COUPLE}</strong> 🤍
        </p>
        <div className="mx-1 my-2 rounded-xl border-2 border-gold/60 bg-cream py-2 text-center">
          <div className="text-[10px] font-bold text-gold-text">השולחן שלכם</div>
          <div className="font-display text-3xl font-black text-ink">12</div>
        </div>
        <p className="space-y-0.5 p-1 text-[11px] leading-relaxed text-ink">
          🥂 קבלת פנים 19:00
          <br />
          💐 חופה וקידושין 20:00
          <br />
          📍 אולמי הגן, רחוב האלון 4
        </p>
        <div className="px-1 text-left text-[9px] text-gray-400">19:45</div>
      </div>
    </div>
  );
}

export default function GuestJourney() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!auto) return;
    timer.current = setInterval(() => setActive((s) => (s + 1) % STEPS.length), 3500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [auto]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section id="journey" dir="rtl" className="relative w-full overflow-hidden border-y border-[#E9DFCF]/60 bg-ivory px-4 py-16 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
      <svg className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 -rotate-45 text-olive opacity-40" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden>
        <path d="M20,180 Q80,140 160,30" />
        <path d="M70,145 Q85,125 105,135 Q90,155 70,145 Z" fill="#6B7B5A" fillOpacity="0.1" />
        <path d="M95,120 Q120,110 125,130 Q105,140 95,120 Z" fill="#6B7B5A" fillOpacity="0.1" />
        <path d="M120,85 Q135,65 155,75 Q140,95 120,85 Z" fill="#6B7B5A" fillOpacity="0.1" />
        <path d="M135,55 Q160,45 168,62 Q150,75 135,55 Z" fill="#6B7B5A" fillOpacity="0.1" />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E9DFCF] bg-cream px-3.5 py-1.5 text-sm font-medium text-gold-text shadow-sm">
            <span className="h-2 w-2 rounded-full bg-olive" />
            המסע של אורח
          </div>
          <h2 className="mb-4 font-display text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
            ככה זה נראה אצל האורחים שלכם
          </h2>
          <p className="font-body text-lg font-light leading-relaxed text-ink/70 sm:text-xl">
            אלה ההודעות שהאורחים מקבלים, בנוסח שנשלח בפועל.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* steps */}
          <div className="order-2 flex flex-col gap-5 lg:order-1 lg:col-span-7">
            {STEPS.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  className={`group rounded-[24px] border-2 p-6 text-right transition-all ${
                    on ? "border-gold bg-white shadow-raised" : "border-transparent bg-cream/60 hover:border-[#E9DFCF] hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-black ${
                        on ? "bg-gold text-ink" : "border border-[#E9DFCF] bg-cream text-ink/60"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-xl font-black text-ink">{s.title}</h3>
                        <span className="rounded-full border border-[#E9DFCF] bg-cream px-2.5 py-0.5 text-xs font-medium text-ink/70">
                          {s.when}
                        </span>
                      </div>
                      <p className="mb-3 font-body text-sm leading-relaxed text-ink/70 sm:text-base">{s.body}</p>
                      <div className="grid grid-cols-2 gap-2 border-t border-[#E9DFCF]/60 pt-3 text-xs font-medium text-ink">
                        {s.bullets.map((b) => (
                          <span key={b} className="flex items-center gap-1.5">
                            <span className="font-bold text-olive">✓</span>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#E9DFCF]/70 pt-6 sm:flex-row">
              <a
                href={WA_URL}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-pill bg-gold px-8 py-3.5 font-body text-base font-bold text-ink shadow-md transition-colors hover:bg-primary-deep sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                קבלו הצעה בוואטסאפ
              </a>
              <a
                href="/try"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-pill border-2 border-primary-deep px-7 py-3.5 font-body text-base font-semibold text-gold-text transition-colors hover:bg-primary-deep/10 sm:w-auto"
              >
                <PlayCircle className="h-4 w-4" />
                נסו בעצמכם — הדגמה חיה
              </a>
            </div>
          </div>

          {/* phone */}
          <div className="order-1 flex flex-col items-center lg:sticky lg:top-24 lg:order-2 lg:col-span-5">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
              <div className="pointer-events-none absolute -inset-4 rounded-[54px] bg-gradient-to-b from-gold/20 to-transparent opacity-70 blur-xl" />
              <div className="relative overflow-hidden rounded-[48px] border-4 border-[#2E2E32] bg-[#1A1A1C] p-3 shadow-modal">
                <div className="absolute left-1/2 top-4 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
                <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[38px] bg-[#EFE7DC] text-right sm:h-[600px]" dir="rtl">
                  <div className="flex items-center justify-between bg-[#075E54] px-6 pb-1 pt-2 text-xs font-medium text-white">
                    <span>9:41</span>
                  </div>
                  <div className="z-10 flex items-center gap-2.5 bg-[#075E54] px-3 py-2.5 text-white shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-cream font-display text-sm font-black text-ink">
                      ש&ע
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold leading-tight">רגע לפני</span>
                      <span className="text-[10px] text-white/80">חשבון עסקי</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden p-3.5">
                    <div className="self-center rounded-md bg-white/70 px-3 py-0.5 text-[10px] font-medium text-gray-500">
                      {STEPS[active].date}
                    </div>
                    <div key={active} className="animate-[fadeIn_.3s_ease]">
                      <Screen step={active} />
                    </div>
                  </div>
                  <div className="flex justify-center bg-cream/80 pb-1.5 pt-2">
                    <div className="h-1 w-32 rounded-full bg-black/40" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-gold/40 bg-ink px-4 py-1.5 text-xs font-medium text-ivory shadow-md">
                <span className="h-2 w-2 rounded-full bg-gold" />
                שלב {active + 1}: {STEPS[active].title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className="mt-10 min-h-[44px] font-body text-sm font-semibold text-gold-text underline underline-offset-4"
            >
              {auto ? "עצרו" : "הפעילו את כל המסע ▶"}
            </button>
            <p className="mt-1 font-body text-xs text-ink/60">השמות והתאריכים בדוגמה בדויים</p>
          </div>
        </div>
      </div>
    </section>
  );
}
