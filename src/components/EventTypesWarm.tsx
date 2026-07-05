"use client";

/** EventTypesWarm — asymmetric bento of event types.
 * Based on approved Stitch "סוגי אירועים - הפקה עורכית" (screen b6df325d). */

import { Heart, Star, Cake, Sparkles, Flower2, Baby, Moon, ArrowLeft } from "lucide-react";

const TYPES = [
  { Icon: Heart, title: "חתונה", body: "ניהול מלא. אורחים, הושבה, תקציב ומתנות", span: "md:col-span-6", feature: true },
  { Icon: Star, title: "בר מצווה", body: "ניהול בר מצווה עם לוח בקרה זוגי", span: "md:col-span-3" },
  { Icon: Sparkles, title: "בת מצווה", body: "ניהול בת מצווה מהמוזמן הראשון ועד יום האירוע", span: "md:col-span-3" },
  { Icon: Cake, title: "יום הולדת", body: "ניהול מוזמנים ואישורי הגעה ליום הולדת", span: "md:col-span-4" },
  { Icon: Flower2, title: "חינה", body: "ניהול חינה. אישורי הגעה ותזכורות אוטומטיות", span: "md:col-span-4" },
  { Icon: Baby, title: "ברית", body: "ניהול ברית מילה עם מעקב מוזמנים", span: "md:col-span-4" },
  { Icon: Moon, title: "ברית בנות", body: "ניהול ברית בנות. הכל מסודר, הכל ידוע", span: "md:col-span-6" },
];

export default function EventTypesWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-14">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">לכל אירוע</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black text-ink">לכל אירוע. ניהול מלא</h2>
          <p className="mt-4 mx-auto max-w-2xl font-body text-lg font-light text-ink/55">
            חתונה, חינה, בר מצווה, בת מצווה, ברית ועוד. כל אירוע מקבל לוח בקרה, אישורי הגעה ותזכורות אוטומטיות.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {TYPES.map(({ Icon, title, body, span, feature }) => (
            <article
              key={title}
              className={`col-span-1 ${span} rounded-card bg-surface-raised p-7 shadow-card ${
                feature ? "md:row-span-2 flex flex-col justify-center" : ""
              }`}
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={`font-display font-bold text-ink mb-2 ${feature ? "text-3xl" : "text-xl"}`}>{title}</h3>
              <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">{body}</p>
            </article>
          ))}

          {/* "אחר" olive block */}
          <article className="col-span-1 md:col-span-6 rounded-card bg-olive p-7 text-white shadow-raised flex items-center justify-between">
            <div>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">אירוע אחר?</h3>
              <p className="font-body text-[15px] font-light text-white/85 leading-relaxed max-w-sm">
                כל אירוע משפחתי. נשמח להתאים ניהול מדויק
              </p>
            </div>
            <ArrowLeft className="w-6 h-6 shrink-0 text-white/80" />
          </article>
        </div>
      </div>
    </section>
  );
}
