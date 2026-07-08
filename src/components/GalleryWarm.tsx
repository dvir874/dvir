"use client";

/** GalleryWarm — luxury invitation portfolio (masonry) with filters.
 * Based on approved Stitch "גלריה - הפקה עורכית (מעודכן)" (screen e3476d6c). */

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

const FILTERS = ["עיצובים נבחרים", "חתונה", "יום הולדת", "בר מצווה", "בת מצווה", "חינה", "ברית", "ברית בנות"];

const ITEMS = [
  { src: "/redesign/invitation-2.webp", title: "קולקציית עלי זהב", sub: "עיצוב קלאסי עם הטבעת פויל מוזהב", tall: true },
  { src: "/redesign/invitation-1.webp", title: "בוטניקה מודרנית", sub: "נגיעות צבע עדינות" },
  { src: "/redesign/invitation-3.webp", title: "חותמות שעווה", sub: "פרטים קטנים וחשובים" },
];

export default function GalleryWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-surface-raised py-16 lg:py-20 px-6 lg:px-12">
      <div className="mx-auto max-w-[1150px]">
        <div className="text-center mb-10">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">עיצובים נבחרים</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black text-ink">הגלריה שלנו</h2>
          <p className="mt-4 font-body text-lg font-light text-ink/55">
            חמשת העיצובים הנבחרים שאנחנו הכי גאים בהם. לחצו לתצוגה מלאה
          </p>
        </div>

        {/* filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {FILTERS.map((f, i) => (
            <span
              key={f}
              className={`rounded-pill px-5 py-2 font-body text-sm ${
                i === 0 ? "bg-gold text-white" : "border border-gold/40 bg-ivory text-ink/70"
              }`}
            >
              {f}
            </span>
          ))}
        </div>

        {/* masonry */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {ITEMS.map(({ src, title, sub, tall }) => (
            <div key={title} className="mb-5 break-inside-avoid overflow-hidden rounded-card bg-ivory shadow-card">
              <div className={`relative w-full ${tall ? "h-[420px]" : "h-64"}`}>
                <Image src={src} alt={title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 33vw" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-pill bg-gold/95 px-3 py-1 font-body text-[12px] font-semibold text-white">
                  <BadgeCheck className="w-3.5 h-3.5" /> אמיתי
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                <p className="font-body text-[13px] text-ink/55">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/invitations" className="font-body font-semibold text-gold underline underline-offset-4">
            לכל העיצובים ←
          </Link>
        </div>
      </div>
    </section>
  );
}
