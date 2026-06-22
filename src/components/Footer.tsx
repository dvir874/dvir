"use client";

import Logo from "./Logo";
import Link from "next/link";
import { Heart, Phone, Mail, MessageCircle } from "lucide-react";
import { WA_URL, PHONE_DISPLAY, PHONE_HREF, EMAIL } from "@/lib/constants";

const navLinks = [
  { label: "פיצ'רים",     href: "/features"     },
  { label: "איך זה עובד",  href: "/how-it-works" },
  { label: "מחירים",       href: "/pricing"       },
  { label: "שאלות נפוצות", href: "/faq"           },
  { label: "צור קשר",     href: "/#contact"      },
];

const eventTypes = [
  { label: "חתונות",      href: "/event-type/wedding"    },
  { label: "אירוסין",     href: "/event-type/wedding"    },
  { label: "חינה",        href: "/event-type/hina"       },
  { label: "בר מצווה",   href: "/event-type/barmitzva"  },
  { label: "בת מצווה",   href: "/event-type/batmitzva"  },
  { label: "ברית ובריתה", href: "/event-type/brit"       },
  { label: "ימי הולדת",  href: "/event-type/birthday"   },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#2A2A2A 0%,#1A1A1A 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px,rgba(197,164,109,0.4) 1px,transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container-max mx-auto px-4 md:px-8 py-16 relative z-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-5">
              <Logo size="sm" inverted />
            </div>
            <p
              className="text-white/40 text-xs leading-relaxed mb-6 max-w-[200px]"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              כל החתונה שלכם במקום אחד — עם ליווי אישי מהרגע הראשון.
            </p>
            {/* Social / contact icons */}
            <div className="flex gap-3">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "#25D366" }}
                aria-label="וואטסאפ"
              >
                <MessageCircle size={16} color="white" />
              </a>
              <a
                href={PHONE_HREF}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(197,164,109,0.25)" }}
                aria-label="טלפון"
              >
                <Phone size={16} color="#C5A46D" />
              </a>
              <a
                href="mailto:dvir874@gmail.com"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "rgba(107,123,90,0.25)" }}
                aria-label="מייל"
              >
                <Mail size={16} color="#8FAB7A" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              className="text-white/70 font-semibold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              ניווט
            </h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/35 hover:text-gold text-sm transition-colors duration-200"
                    style={{ fontFamily: "Heebo, sans-serif" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event types */}
          <div>
            <h4
              className="text-white/70 font-semibold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              אירועים
            </h4>
            <ul className="space-y-3">
              {eventTypes.map((t) => (
                <li key={t.label}>
                  <Link
                    href={t.href}
                    className="text-white/35 hover:text-gold text-sm transition-colors duration-200"
                    style={{ fontFamily: "Heebo, sans-serif" }}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white/70 font-semibold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              יצירת קשר
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={PHONE_HREF}
                  className="flex items-center gap-2 text-white/35 hover:text-gold transition-colors duration-200 text-sm"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  <Phone size={13} />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2 text-white/35 hover:text-gold transition-colors duration-200 text-sm"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  <Mail size={13} />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/35 hover:text-gold transition-colors duration-200 text-sm"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  <MessageCircle size={13} />
                  וואטסאפ
                </a>
              </li>
            </ul>

            {/* Promise note */}
            <div
              className="mt-6 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(197,164,109,0.08)",
                border: "1px solid rgba(197,164,109,0.18)",
              }}
            >
              <p
                className="text-gold text-sm font-semibold"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                הצעת מחיר אישית
              </p>
              <p
                className="text-white/35 text-xs mt-0.5"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                מותאמת לאירוע ולכמות המוזמנים
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/8 mb-7" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-white/25 text-xs"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            © {year} רגע לפני. כל הזכויות שמורות.
          </p>
          <div
            className="flex items-center gap-2 text-white/25 text-xs"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            <span>עוצב ופותח</span>
            <Heart size={11} fill="#C5A46D" className="text-gold" />
            <span>בישראל</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
