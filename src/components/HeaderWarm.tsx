"use client";

/** HeaderWarm — Warm Romantic sticky nav (landing redesign).
 * Based on approved Stitch "Header - דסקטופ/מובייל (Warm Romantic)" (screens 9123df19 / a2a1828d).
 * Transparent over the hero, solid ivory + gold hairline on scroll. Links preserved from the
 * legacy Header. No pricing link. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "✨ נסו בעצמכם", href: "/try" },
  { label: "פיצ'רים", href: "/features" },
  { label: "מחשבון מחיר", href: "/pricing" },
  { label: "הזמנות", href: "/invitations" },
  { label: "שאלות", href: "/faq" },
  { label: "צור קשר", href: "/#contact" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex flex-col items-end leading-none focus:outline-none">
      <span className="text-gold text-sm leading-none" aria-hidden>❦</span>
      <span className="font-display text-2xl font-black text-ink">רגע לפני</span>
      <span className="font-body text-[11px] tracking-wide text-ink/50">ניהול חתונה</span>
    </Link>
  );
}

export default function HeaderWarm() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href !== "/#contact" && (pathname === href || (pathname.startsWith(href) && href !== "/"));

  return (
    <header
      dir="rtl"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ivory/95 backdrop-blur-md shadow-[0_2px_20px_rgba(28,16,8,0.06)] border-b border-gold/20" : "bg-ivory/90 backdrop-blur-sm"
      }`}
    >
      {/* subtle scrim for legibility over the bright hero photo on mobile (top state only) */}
      {!scrolled && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ivory/70 to-transparent md:hidden" aria-hidden />
      )}
      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between px-5 lg:px-10 h-20">
        {/* right: logo */}
        <Wordmark />

        {/* center: nav (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="relative font-body text-[15px] font-medium text-ink/75 transition-colors hover:text-ink"
              >
                {n.label}
                {active && <span className="absolute -bottom-2 right-1/2 h-1.5 w-1.5 translate-x-1/2 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>

        {/* left: CTA (desktop) */}
        <Link
          href="/#contact"
          className="hidden md:inline-flex items-center rounded-pill bg-gold px-6 py-2.5 font-body text-[14px] font-semibold text-ink shadow-raised transition-colors hover:bg-primary-soft"
        >
          קבלו הצעת מחיר
        </Link>

        {/* mobile: hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full text-ink"
          aria-label="פתיחת תפריט"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-0 rounded-b-[28px] bg-ivory p-6 shadow-modal">
            <div className="mb-6 flex items-center justify-between">
              <Wordmark />
              <button onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink" aria-label="סגירה">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 font-body text-[16px] text-ink/80 hover:bg-cream"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center rounded-pill bg-gold py-3.5 font-body text-[15px] font-semibold text-ink shadow-raised"
            >
              קבלו הצעת מחיר
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
