"use client";

/**
 * TrustWarm — qualitative trust section (Polish Wave 1, CEO-approved).
 * No invented statistics — trust is built on the promise and the person, not fake
 * counters. If real numbers/testimonials arrive later, they slot in here.
 */

import { UserRound, MessageCircle, ShieldCheck, Sparkles, Quote } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "@/components/FadeIn";
import { motion } from "framer-motion";
import { WA_URL } from "@/lib/constants";

const PILLARS = [
  {
    Icon: UserRound,
    title: "אדם אחד. לא מוקד.",
    body: "דביר מלווה אתכם אישית מהרגע הראשון. אותו אדם שמכיר את האירוע שלכם — לא נציג מתחלף ולא בוט.",
  },
  {
    Icon: MessageCircle,
    title: "זמינים בוואטסאפ",
    body: "שאלה קטנה או שינוי של הרגע האחרון — שולחים הודעה ומקבלים מענה. בלי טפסים, בלי המתנה בתור.",
  },
  {
    Icon: ShieldCheck,
    title: "כל פרט מטופל",
    body: "אנחנו מגדירים לכם את המערכת, מזינים את האורחים ומוודאים שהכל עובד — אתם רק נהנים מהתוצאה.",
  },
  {
    Icon: Sparkles,
    title: "יחס אישי לכל אירוע",
    body: "כל חתונה מקבלת ירידה לפרטים והתאמה מלאה. לא תבנית גנרית — האירוע שלכם, בדיוק כמו שדמיינתם.",
  },
];

export default function TrustWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-ivory px-6 lg:px-12 py-16 lg:py-24">
      <div className="mx-auto max-w-[1150px]">
        <FadeIn className="text-center mb-14">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            למה זוגות בוחרים בנו
          </p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black leading-tight text-ink">
            אתם לא קונים תוכנה.
            <span className="block text-gold">אתם מקבלים מישהו שדואג.</span>
          </h2>
        </FadeIn>

        {/* pillars */}
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ Icon, title, body }) => (
            <motion.article
              key={title}
              variants={staggerItem}
              className="rounded-card bg-surface-raised p-7 shadow-card transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">{title}</h3>
              <p className="font-body text-[14px] font-light leading-relaxed text-ink/60">{body}</p>
            </motion.article>
          ))}
        </StaggerContainer>

        {/* founder promise */}
        <FadeIn delay={0.1} className="mt-8">
          <div className="relative overflow-hidden rounded-card bg-olive px-8 py-12 lg:px-16 lg:py-14 text-center text-white shadow-raised">
            <Quote className="mx-auto mb-5 h-8 w-8 text-white/40" aria-hidden />
            <blockquote className="mx-auto max-w-2xl font-display text-2xl lg:text-3xl font-bold leading-snug">
              &rdquo;רגע לפני&ldquo; הוא לא רק שם. זו ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל, ואתם פשוט נוכחים ונהנים.
            </blockquote>
            <p className="mt-6 font-body text-sm text-white/70">דביר · מייסד רגע לפני</p>
            <a
              href={WA_URL}
              className="mt-8 inline-flex items-center gap-2 rounded-pill bg-gold px-8 py-3.5 font-body text-[15px] font-semibold text-ink shadow-raised transition-colors hover:bg-primary-soft"
            >
              <MessageCircle className="h-5 w-5" /> דברו איתי אישית
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
