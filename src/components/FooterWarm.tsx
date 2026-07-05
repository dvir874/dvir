"use client";

/** FooterWarm — dark editorial footer (built in code per plan; Stitch footer kept failing).
 * Language matches the approved dark footer of the live site. No pricing link. */

import { Mail, Phone, MessageCircle } from "lucide-react";
import { WA_URL_FOOTER } from "@/lib/constants";
import Link from "next/link";

const NAV = [
  { label: "פיצ'רים", href: "#features" },
  { label: "איך זה עובד", href: "#how" },
  { label: "מחשבון מחיר", href: "/pricing" },
  { label: "✨ דמו חי", href: "/try" },
  { label: "צור קשר", href: "#contact" },
];

const EVENTS = [
  { label: "חתונות", href: "/" },
  { label: "חתונה דתית", href: "/religious" },
  { label: "בר/בת מצווה", href: "/bar-mitzvah" },
  { label: "החתונות שלנו", href: "/weddings" },
];

const RESOURCES = [
  { label: "כמה עולים אישורי הגעה?", href: "/guides/rsvp-cost" },
  { label: "מדריך סידורי הושבה", href: "/guides/seating-guide" },
  { label: "תוכנית שותפים לספקים", href: "/partners" },
  { label: "לאולמות ומפיקים", href: "/venues" },
  { label: "תנאי שירות", href: "/terms" },
];

export default function FooterWarm() {
  return (
    <footer dir="rtl" className="w-full bg-ink px-6 lg:px-12 py-16 text-white">
      <div className="mx-auto grid max-w-[1150px] gap-12 md:grid-cols-4">
        {/* brand */}
        <div className="md:col-span-1">
          <h3 className="font-display text-2xl font-black text-primary-soft">רגע לפני</h3>
          <p className="font-body text-sm text-white/50">ניהול חתונה</p>
          <p className="mt-4 font-body text-[14px] font-light leading-relaxed text-white/60">
            כל החתונה שלכם במקום אחד — עם ליווי אישי מהרגע הראשון.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="mailto:dvir874@gmail.com" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><Mail className="w-4 h-4" /></a>
            <a href="tel:0533318177" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink"><Phone className="w-4 h-4" /></a>
            <a href={WA_URL_FOOTER} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-olive"><MessageCircle className="w-4 h-4" /></a>
          </div>
        </div>

        {/* nav */}
        <div>
          <h4 className="mb-4 font-display text-lg font-bold text-white">ניווט</h4>
          <ul className="space-y-2">
            {NAV.map((n) => (
              <li key={n.label}><a href={n.href} className="font-body text-[14px] text-white/60 hover:text-primary-soft">{n.label}</a></li>
            ))}
          </ul>
        </div>

        {/* events */}
        <div>
          <h4 className="mb-4 font-display text-lg font-bold text-white">אירועים</h4>
          <ul className="space-y-2">
            {EVENTS.map((e) => (
              <li key={e.label}><Link href={e.href} className="font-body text-[14px] text-white/60 hover:text-primary-soft">{e.label}</Link></li>
            ))}
          </ul>
          <h4 className="mb-4 mt-8 font-display text-lg font-bold text-white">מדריכים ושותפים</h4>
          <ul className="space-y-2">
            {RESOURCES.map((e) => (
              <li key={e.label}><Link href={e.href} className="font-body text-[14px] text-white/60 hover:text-primary-soft">{e.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h4 className="mb-4 font-display text-lg font-bold text-white">יצירת קשר</h4>
          <ul className="space-y-2 font-body text-[14px] text-white/60">
            <li dir="ltr" className="text-right">053-3318177</li>
            <li>dvir874@gmail.com</li>
            <li><a href={WA_URL_FOOTER} className="hover:text-primary-soft">וואטסאפ</a></li>
          </ul>
          <p className="mt-4 font-body text-[13px] text-white/40">הצעת מחיר אישית · מותאמת לאירוע ולכמות המוזמנים</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1150px] border-t border-white/10 pt-6 text-center font-body text-[13px] text-white/40">
        © 2026 רגע לפני · ניהול חתונה יוקרתי
      </div>
    </footer>
  );
}
