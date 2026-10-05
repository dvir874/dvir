"use client";

/** HeaderWarm — the floating capsule nav.
 * Stitch project 18431120483630512231, screen 3dc4929b ("סרגל צף וכרטיסי כאב"),
 * approved 05/10/2026 (taken from goappie.co.il, which Dvir liked): a white pill
 * floating 12px under the top edge instead of a full-width bar. Links are the
 * design's four, each an anchor on this page. No pricing link. */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "איך זה עובד", href: "/#journey" },
  { label: "מה כלול", href: "/#package" },
  { label: "שאלות", href: "/#faq" },
  { label: "צור קשר", href: "/#contact" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
      <Image
        src="/brand/logo-mark.webp"
        alt="רגע לפני — טבעות ועלה זית"
        width={364}
        height={473}
        priority
        className="h-10 w-auto"
      />
      <span className="flex flex-col items-start leading-none">
        <span className="font-display text-xl font-black text-ink">רגע לפני</span>
        <span className="font-body text-[11px] text-ink/60">ניהול אורחים לחתונה</span>
      </span>
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
    <header dir="rtl" className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`relative mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border border-[#E8E1D5] bg-white/95 px-4 backdrop-blur-md transition-shadow duration-300 sm:px-6 ${
          scrolled ? "shadow-[0_8px_30px_rgba(28,16,8,0.10)]" : "shadow-[0_8px_30px_rgba(28,16,8,0.06)]"
        }`}
      >
        {/* right: logo */}
        <Wordmark />

        {/* center: nav (desktop) */}
        <nav className="hidden md:flex items-center gap-7">
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
          className="hidden md:inline-flex items-center rounded-pill bg-gold px-6 py-2.5 font-body text-[14px] font-semibold text-ink shadow-sm transition-colors hover:bg-primary-soft"
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
