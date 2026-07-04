"use client";

/** CTAWarm — final olive call-to-action block.
 * Based on approved Stitch "CTA סופי - רגע לפני" (screen 4781372f). */

import { MessageCircle, LayoutDashboard } from "lucide-react";
import { WA_URL } from "@/lib/constants";
import Link from "next/link";

export default function CTAWarm() {
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-olive px-6 py-24 lg:py-28 text-center">
      {/* olive leaf accents */}
      <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden>
        <div className="absolute top-10 right-16 h-40 w-40 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 left-16 h-40 w-40 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl">
        <h2 className="font-display text-4xl lg:text-6xl font-black text-white">מוכנים להתחיל?</h2>
        <p className="mx-auto mt-5 max-w-xl font-body text-lg font-light text-white/80">
          הצטרפו לעשרות זוגות שהחליטו לעזוב את האקסלים מאחור. ספרו לנו על האירוע — ונחזור תוך 24 שעות עם הצעה מותאמת.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WA_URL}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-gold px-8 py-4 font-body text-[15px] font-semibold text-ink shadow-raised"
          >
            <MessageCircle className="w-5 h-5" /> שלחו הודעה בוואטסאפ
          </a>
          <Link
            href="/event/demo"
            className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/60 px-8 py-4 font-body text-[15px] font-semibold text-white hover:bg-white/10"
          >
            <LayoutDashboard className="w-5 h-5" /> ראו את הדשבורד קודם
          </Link>
        </div>
        <p className="mt-6 font-body text-sm text-white/60">
          מענה אישי · ללא התחייבות · הצעה מותאמת לאירוע שלכם
        </p>
      </div>
    </section>
  );
}
