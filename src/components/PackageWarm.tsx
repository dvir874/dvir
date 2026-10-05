/**
 * PackageWarm — "מה מקבלים. המחיר מותאם אליכם."
 *
 * Stitch project 18431120483630512231, screen 4789d397 ("סקשן החבילות"),
 * approved 30/09/2026 with two changes Dvir asked for: one package only (the
 * "מלאה" card and its "הכי נבחרת" ribbon are gone), and no price anywhere —
 * the price depends on the list, so the button asks for it instead of a
 * number standing in for it. The card is the design's "אוטומטית" card,
 * centred; the add-on strip and the reassurance line are as designed.
 * "תשלום רק אחרי שהכול מוכן" was confirmed by Dvir as how he actually bills.
 */

import { Check, Car, MessageCircle } from "lucide-react";
import { WA_URL } from "@/lib/constants";

const INCLUDED = [
  "עזרה ביצירת ההזמנה הדיגיטלית שלכם",
  "הזמנה אישית בוואטסאפ לכל אורח",
  "אישור הגעה בלחיצה בתוך הוואטסאפ, והחתונה נכנסת ליומן של האורח",
  "עד 3 תזכורות אוטומטיות למי שלא ענה",
  "סידור הושבה + מספר שולחן לכל אורח ערב לפני",
  "דף אירוע: ניווט, לו״ז, קוד לבוש",
  "דוח מנות לאולם, ילדים בנפרד",
  "גלריה וקיר ברכות אחרי החתונה",
  "ליווי אישי של דביר בוואטסאפ, מההזמנה ועד היום שאחרי",
];

export default function PackageWarm() {
  return (
    <section id="package" dir="rtl" className="relative w-full bg-ivory px-4 py-16 sm:px-6 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E9DFCF] bg-cream px-3.5 py-1.5 text-sm font-medium text-gold-text">
            שקיפות מלאה · מותאם לאירוע שלכם
          </div>
          <h2 className="mb-4 font-display text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
            מה מקבלים. המחיר מותאם אליכם.
          </h2>
          <p className="font-body text-lg leading-relaxed text-ink/70">
            המחיר נקבע לפי כמות האורחים — ומשפחה שלמה על מספר טלפון אחד נספרת פעם אחת. בלי הפתעות.
          </p>
        </div>

        <div className="rl-lift mx-auto max-w-xl rounded-[24px] border-2 border-gold bg-cream p-7 shadow-raised sm:p-9">
          <span className="inline-block rounded-full border border-[#E9DFCF] bg-ivory px-3 py-1 text-xs font-semibold text-gold-text">
            הכול כלול
          </span>
          <h3 className="mt-4 font-display text-3xl font-black text-ink">רגע לפני</h3>
          <p className="mt-2 font-body text-[15px] leading-relaxed text-ink/70">
            אישורי הגעה, הושבה ותזכורות — מערכת שעובדת ברקע, ואדם אחד שעונה לכם.
          </p>
          <ul className="mt-6 space-y-3.5 border-t border-[#E9DFCF] pt-6">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 font-body text-[16px] text-ink">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive/15 text-olive">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href={WA_URL}
            className="mt-8 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-pill bg-gold font-body text-[16px] font-bold text-ink shadow-md transition-colors hover:bg-primary-deep"
          >
            <MessageCircle className="h-5 w-5" />
            לבדוק מחיר לאירוע שלנו
          </a>
        </div>

        <div className="mx-auto mt-6 flex max-w-xl items-center gap-4 rounded-[20px] border border-[#E9DFCF] bg-cream/70 p-5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E9DFCF] bg-ivory text-gold-text">
            <Car className="h-5 w-5" />
          </span>
          <div>
            <div className="font-body text-[15px] font-bold text-ink">תוספת: לוח טרמפים</div>
            <div className="font-body text-[13px] text-ink/70">
              קבוצת וואטסאפ שמחברת בין אורחים שצריכים הסעה לאורחים עם מקום באוטו.
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-body text-sm font-medium text-ink/75">
          <span>ללא התחייבות</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          <span>תשובה מדביר תוך 24 שעות</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          <span>תשלום רק אחרי שהכול מוכן</span>
        </div>
      </div>
    </section>
  );
}
