"use client";

/** GalleryWarm — luxury invitation portfolio (masonry) with filters.
 * Based on approved Stitch "גלריה - הפקה עורכית (מעודכן)" (screen e3476d6c). */

import Image from "next/image";
import Link from "next/link";

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
            דוגמאות לסגנונות הזמנה שאפשר לבחור
          </p>
        </div>

        {/* masonry */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {ITEMS.map(({ src, title, sub, tall }) => (
            <div key={title} className="mb-5 break-inside-avoid overflow-hidden rounded-card bg-ivory shadow-card">
              <div className={`relative w-full ${tall ? "h-[420px]" : "h-64"}`}>
                <Image src={src} alt={title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                <p className="font-body text-[13px] text-ink/55">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/invitations" className="inline-flex min-h-[44px] items-center font-body font-semibold text-gold underline underline-offset-4">
            לכל העיצובים ←
          </Link>
        </div>
      </div>
    </section>
  );
}
