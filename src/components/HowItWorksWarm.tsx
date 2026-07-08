"use client";

/** HowItWorksWarm — editorial 3-step journey with oversized serif numbers + feature pills.
 * Based on approved Stitch "איך זה עובד - הפקה עורכית" (screen b0173444). */

import { UserPlus, Send, LayoutDashboard } from "lucide-react";

const STEPS = [
  {
    n: "01",
    Icon: UserPlus,
    title: "הזמנות ואישורי הגעה",
    body: "הזמנה אישית לכל אורח. אישורי הגעה, תזכורות ומעקב מגיעים ישירות ללוח הבקרה שלכם. ללא מרדפים.",
  },
  {
    n: "02",
    Icon: Send,
    title: "ניהול מלא של האירוע",
    body: "הושבה לפי שולחנות, מעקב תקציב, רישום מתנות, רשימת משימות. הכל במסך אחד, זמין מכל מכשיר.",
  },
  {
    n: "03",
    Icon: LayoutDashboard,
    title: "לוח בקרה זוגי בזמן אמת",
    body: "שניכם רואים את אותה תמונה עדכנית: מי מגיע, כמה תקציב נשאר, מה עדיין פתוח. עד יום האירוע.",
  },
];

const PILLS = [
  "אישורי הגעה", "תזכורות בוואטסאפ", "תכנון הושבה", "מעקב תקציב",
  "רישום מתנות", "משימות תכנון", "לוח בקרה זוגי", "גלריית תמונות",
];

export default function HowItWorksWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-cream py-16 lg:py-20 px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-10">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">איך זה עובד</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black text-ink">פשוט, אישי, מלא</h2>
          <p className="mt-4 font-body text-lg font-light text-ink/55">
            מההזמנה הראשונה ועד יום החתונה. אנחנו לצדכם בכל שלב
          </p>
        </div>

        {/* Steps journey */}
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          {STEPS.map(({ n, Icon, title, body }) => (
            <div key={n} className="relative">
              <div className="mb-4 flex items-center gap-4">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-white shadow-raised">
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className="font-display text-5xl font-black leading-none text-gold/30 select-none"
                  aria-hidden
                >
                  {n}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-2">{title}</h3>
              <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {PILLS.map((p) => (
            <span
              key={p}
              className="rounded-pill border border-gold/40 bg-ivory px-5 py-2 font-body text-sm text-ink/70"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
