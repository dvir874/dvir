"use client";

/**
 * FeatureTabs — "כל מה שהחתונה צריכה, במקום אחד."
 *
 * Stitch project 18431120483630512231, screen b3a0ee4f ("סקשן טאבים (Feature
 * Tabs Showcase)"), approved 05/10/2026, after goappie.co.il's tab row. One
 * panel, six subjects, so the page says six things in the height of one —
 * replaces HowItWorksWarm and ProcessWarm (stock invitation photos).
 *
 * The design drew the "הושבה" panel in full and two others as preview cards;
 * the other four panels reuse that same shape. Two lines from the design were
 * dropped because nothing in the product does them: "ליד עמדת הבר המרכזית"
 * and a "נווט לשולחן" button on the entrance screen.
 */

import { useState } from "react";
import { Check, CalendarCheck, Armchair, FileText, Clock, Image as ImageIcon, Lock, Search } from "lucide-react";
import { WA_URL } from "@/lib/constants";

type Tab = {
  id: string; label: string; Icon: typeof Check; tag: string;
  title: string; promise: string; bullets: string[]; Vignette: () => React.ReactElement;
};

const frame = "rounded-2xl border border-[#E9E1D2] bg-white shadow-sm";

function Rsvp() {
  const rows = [["משפחת לוי", "אישרו · 4", true], ["יעל כהן", "לא מגיעה", false], ["יוסי ומיכל אברהם", "אישרו · 2", true], ["אבי פרץ", "ממתין", null]] as const;
  return (
    <div className={`${frame} p-4`}>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        {[["אישרו", "241", "text-olive"], ["ממתינים", "48", "text-gold-text"], ["לא מגיעים", "23", "text-ink/60"]].map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-cream py-2"><div className="text-[11px] text-ink/60">{l}</div><div className={`font-display text-xl font-black ${c}`}>{v}</div></div>
        ))}
      </div>
      {rows.map(([n, s, ok]) => (
        <div key={n} className="flex items-center justify-between border-t border-[#F2ECE2] py-2 text-sm">
          <span className="font-semibold text-ink">{n}</span>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${ok === true ? "bg-olive/15 text-olive" : ok === false ? "bg-ink/5 text-ink/60" : "bg-gold/15 text-gold-text"}`}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Seating() {
  return (
    <div className={`${frame} p-4`}>
      <div className="mb-3 flex justify-between text-[11px] text-ink/60"><span>מפת האולם · 24 שולחנות</span><span>טרם שובצו: 8</span></div>
      <div className="grid grid-cols-2 gap-3">
        {[["10", "10/10 מלא"], ["11", "6/10 מקומות"]].map(([n, c]) => (
          <div key={n} className="rounded-xl border border-[#EFE7DA] p-3 text-center">
            <div className="text-xs font-bold text-ink">שולחן {n}</div>
            <div className="mx-auto my-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-olive/50 font-display font-black text-ink">{n}</div>
            <div className="text-[11px] text-ink/60">{c}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border-2 border-gold/70 bg-[#FBF6EC] p-3">
        <div className="flex items-center justify-between text-sm"><span className="font-bold text-ink">שולחן 12 · משפחה מורחבת</span><span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gold-text">8/10</span></div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          {["דוד משה ורחל (2)", "בת דודה נועם", "משפחת שפירא (3)"].map(g => <span key={g} className="rounded-md border border-[#E9E1D2] bg-white px-2 py-0.5 text-ink/80">{g}</span>)}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-ivory">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-ink">2</span>
        <span className="text-sm font-semibold">סבא אליהו + סבתא שרה</span><span className="mr-auto text-[11px] text-ivory/70">← שולחן 12</span>
      </div>
    </div>
  );
}

function Meals() {
  return (
    <div className={`${frame} p-4`}>
      <div className="border-b border-dashed border-[#E9E1D2] pb-2 text-sm font-bold text-ink">סיכום מנות סופי לאירוע</div>
      {[["מנות בשרי", "186"], ["צמחוני", "22"], ["טבעוני", "9"], ["מנות ילדים", "24"]].map(([k, v]) => (
        <div key={k} className="flex justify-between py-1.5 text-sm"><span className="text-ink/70">{k}</span><span className="font-bold text-ink">{v}</span></div>
      ))}
      <div className="flex justify-between border-t border-dashed border-[#E9E1D2] pt-2"><span className="font-bold text-ink">סה״כ</span><span className="font-display text-xl font-black text-ink">241</span></div>
      <div className="mt-3 rounded-xl bg-olive/10 py-2 text-center text-sm font-bold text-olive">✓ נשלח לאולם בוואטסאפ</div>
    </div>
  );
}

function Day() {
  return (
    <div className={`${frame} p-4`}>
      <div className="mb-2 text-[12px] text-ink/60">הקלידו שם אורח לאיתור מיידי:</div>
      <div className="flex items-center gap-2 rounded-xl border border-[#E9E1D2] bg-ivory px-3 py-2.5 text-sm text-ink"><Search className="h-4 w-4 text-ink/50" />ירון לוי</div>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-olive/30 bg-olive/10 p-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-ivory">✓</span>
        <div><div className="font-bold text-ink">שולחן 12</div><div className="text-[11px] text-ink/60">משפחת לוי · 4 מקומות</div></div>
      </div>
      <div className="mt-3 text-center text-[11px] text-ink/50">מסך טלפון או טאבלט בכניסה לאולם</div>
    </div>
  );
}

function Album() {
  return (
    <div className={`${frame} p-4`}>
      <div className="mb-3 flex justify-between text-sm"><span className="font-bold text-ink">האלבום של שירה ועומרי</span><span className="text-[11px] text-ink/60">142 תמונות מהאורחים</span></div>
      <div className="grid grid-cols-3 gap-2">
        {["#E9DFCF", "#D9E0CC", "#EADFD4", "#F0E6CF", "#E3E8DA", "#EFE3D3"].map((c, i) => (
          <div key={i} className="flex aspect-square items-center justify-center rounded-lg" style={{ background: c }}><ImageIcon className="h-5 w-5 text-ink/30" /></div>
        ))}
      </div>
      <div className="mt-3 text-center text-[11px] text-ink/60">האורחים מעלים מהטלפון, הכול מגיע למקום אחד</div>
    </div>
  );
}

function Capsule() {
  return (
    <div className={`${frame} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E9E1D2] text-gold-text">✉</span>
          <div><div className="text-sm font-bold text-ink">מעטפת הברכות של שירה ועומרי</div><div className="text-[11px] text-ink/60">142 ברכות נאספו</div></div></div>
        <span className="flex items-center gap-1 rounded-full border border-gold/40 px-2 py-0.5 text-[11px] font-semibold text-gold-text"><Lock className="h-3 w-3" />נעול</span>
      </div>
      <div className="mt-3 rounded-xl bg-cream p-3 text-sm text-ink/50 blur-[2.5px] select-none" aria-hidden>
        אאאאא אאאא אאאאאאא אאא אאאאא אאאא אאאאאא אאא אאאאא
      </div>
      <div className="mt-3 text-center text-[11px] font-semibold text-gold-text">תיפתח לזוג ביום השנה הראשון</div>
    </div>
  );
}

const TABS: Tab[] = [
  { id: "rsvp", label: "אישורי הגעה", Icon: CalendarCheck, tag: "אישורי הגעה בוואטסאפ", Vignette: Rsvp,
    title: "כל אורח מאשר בלחיצה, ואתם רואים הכול", promise: "הזמנה אישית בוואטסאפ, תזכורות רק למי שלא ענה, ותמונת מצב שמתעדכנת לבד.",
    bullets: ["הזמנה אישית בוואטסאפ לכל אורח", "אישור בלחיצה, בלי אפליקציה", "תזכורות רק למי שעוד לא ענה", "מי שלא מקבל וואטסאפ מזוהה בשמו", "מנות ילדים בנפרד"] },
  { id: "seating", label: "הושבה", Icon: Armchair, tag: "סידור הושבה חכם", Vignette: Seating,
    title: "הושבה בגרירה, ומספר שולחן לכל אורח", promise: "בלי פתקים, בלי אקסלים מסובכים — גוררים, מושיבים, ויודעים שהכול מסודר.",
    bullets: ["פריסת האולם כמו במציאות", "גוררים אורח לשולחן", "רואים מי עוד לא שובץ", "ערב לפני: כל אורח מקבל את מספר השולחן שלו", "בלי תור בכניסה"] },
  { id: "meals", label: "דוח מנות לאולם", Icon: FileText, tag: "דוח לאולם", Vignette: Meals,
    title: "מספר סופי מדויק, ישר לאולם", promise: "האולם מקבל דוח מנות מסודר, ואתם לא צריכים לתווך ביניכם לבין הקייטרינג.",
    bullets: ["מנות לפי סוג", "ילדים נספרים בנפרד", "נשלח לאולם בוואטסאפ", "מתעדכן עד הרגע האחרון"] },
  { id: "day", label: "יום החתונה", Icon: Clock, tag: "בזמן אמת ביום האירוע", Vignette: Day,
    title: "כל אורח מוצא את השולחן שלו בשנייה", promise: "מסך חיפוש בכניסה לאולם — שם, ושולחן. בלי רשימות על הקיר ובלי התקהלות.",
    bullets: ["חיפוש לפי שם", "עובד מכל טלפון או טאבלט", "כל אורח כבר קיבל את מספר השולחן ערב לפני"] },
  { id: "album", label: "אלבום מהאורחים", Icon: ImageIcon, tag: "אחרי החתונה", Vignette: Album,
    title: "כל התמונות שהאורחים צילמו, באלבום אחד", promise: "למחרת החתונה האורחים מקבלים קישור, מעלים מהטלפון, והכול מגיע אליכם.",
    bullets: ["העלאה מהטלפון בלי הרשמה", "גלריה אחת לזוג", "קיר ברכות לצד התמונות"] },
  { id: "capsule", label: "קפסולת זמן", Icon: Lock, tag: "תכונה משלימה", Vignette: Capsule,
    title: "ברכות שנפתחות ביום השנה הראשון", promise: "האורחים כותבים לכם ברכה, והיא נשמרת נעולה עד יום השנה.",
    bullets: ["כל אורח יכול לכתוב", "נעול עד התאריך — גם אתם לא רואים לפני", "נפתח לכם ביום השנה הראשון"] },
];

export default function FeatureTabs() {
  const [active, setActive] = useState("seating");
  const tab = TABS.find(t => t.id === active)!;
  const previews = TABS.filter(t => t.id === "capsule" || t.id === "day").filter(t => t.id !== active);

  return (
    <section id="how" dir="rtl" className="w-full bg-ivory px-4 py-16 sm:px-6 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E2DAC8] bg-[#F3EFE3] px-3.5 py-1.5 text-sm text-ink/70">
            <span className="h-2 w-2 rounded-full bg-olive" /> הכול במערכת אחת
          </span>
          <h2 className="mt-5 font-display text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">כל מה שהחתונה צריכה, במקום אחד.</h2>
          <p className="mt-3 font-body text-lg text-ink/70">בחרו נושא ותראו איך זה עובד.</p>
        </div>

        <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-2" role="tablist" aria-label="נושאים">
          <div className="flex w-max gap-3 sm:mx-auto">
            {TABS.map(t => {
              const on = t.id === active;
              return (
                <button key={t.id} role="tab" aria-selected={on} onClick={() => setActive(t.id)}
                  className={`inline-flex min-h-[48px] items-center gap-2 rounded-full border px-5 font-body text-[15px] font-semibold transition-colors ${
                    on ? "border-gold bg-gold text-ink shadow-md" : "border-[#E9E1D2] bg-white text-ink/75 hover:border-gold/60"}`}>
                  <t.Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid items-center gap-8 rounded-[28px] border border-[#E9E1D2] bg-cream p-6 sm:p-10 lg:grid-cols-2" role="tabpanel">
          <div>
            <span className="inline-block rounded-md border border-[#E2DAC8] bg-white px-2.5 py-1 text-xs font-semibold text-ink/70">{tab.tag}</span>
            <h3 className="mt-4 font-display text-3xl font-black leading-tight text-ink">{tab.title}</h3>
            <p className="mt-3 font-body text-lg text-ink/70">{tab.promise}</p>
            <ul className="mt-6 space-y-3">
              {tab.bullets.map(b => (
                <li key={b} className="flex items-center gap-3 font-body text-[16px] text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-olive/40 text-olive"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>{b}
                </li>
              ))}
            </ul>
            <a href={WA_URL} className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-6 font-body text-[15px] font-semibold text-ivory">
              ← לשאלות ולהצעת מחיר בוואטסאפ
            </a>
          </div>
          <div key={tab.id} className="animate-[fadeIn_.35s_ease]"><tab.Vignette /></div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {previews.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} className="rounded-[24px] border border-[#E9E1D2] bg-white p-6 text-right transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink/60">{t.tag}</span>
                <span className="rounded-full border border-[#E9E1D2] px-2.5 py-0.5 text-xs font-semibold text-gold-text">{t.label}</span>
              </div>
              <div className="mt-3 font-display text-xl font-bold text-ink">{t.title}</div>
              <div className="mt-2 text-sm text-ink/70">{t.promise}</div>
              <div className="mt-4 text-sm font-semibold text-gold-text">← גלו עוד</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
