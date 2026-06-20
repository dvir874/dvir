"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { label: "למה אנחנו",   href: "#why-us"        },
  { label: "איך זה עובד", href: "#how-it-works"  },
  { label: "מחירים",      href: "#pricing"        },
  { label: "אודות",       href: "#about"          },
  { label: "צור קשר",    href: "#contact"        },
];

const SECTION_IDS = navLinks.map((l) => l.href.slice(1));

export default function Header() {
  const [scrolled,       setScrolled]       = useState(false);
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [activeSection,  setActiveSection]  = useState("");

  /* scroll shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* active-section tracking via IntersectionObserver */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/96 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-gold/15"
            : "bg-transparent"
        }`}
      >
        <div className="container-max mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-18" style={{ height: "4.5rem" }}>
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="focus:outline-none"
            >
              <Logo size="sm" />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeSection === id;
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="relative text-sm font-medium transition-colors duration-200 py-1 group"
                    style={{
                      fontFamily: "Heebo, sans-serif",
                      color: isActive ? "#6B7B5A" : "rgba(51,51,51,0.72)",
                    }}
                  >
                    {link.label}
                    {/* underline — grows from right in RTL */}
                    <span
                      className="absolute -bottom-0.5 right-0 h-px transition-all duration-300"
                      style={{
                        width: isActive ? "100%" : "0%",
                        background: "linear-gradient(90deg,transparent,#C5A46D,transparent)",
                      }}
                    />
                    {/* hover underline (non-active) */}
                    {!isActive && (
                      <span className="absolute -bottom-0.5 right-0 w-0 h-px bg-gold/50 transition-all duration-300 group-hover:w-full" />
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => handleNavClick("#contact")}
                className="btn-primary text-sm py-2.5 px-6"
              >
                דברו איתי
              </button>
            </nav>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-dark hover:bg-gold/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="תפריט"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-72 shadow-2xl transition-transform duration-350 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ background: "#F9F4EB" }}
        >
          <div className="p-6 pt-20 flex flex-col gap-5">
            <Logo size="md" />
            <div className="w-14 h-px bg-gradient-to-r from-gold to-transparent" />
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeSection === id;
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-right py-3 px-3 rounded-xl font-medium text-base transition-all duration-200"
                    style={{
                      fontFamily: "Heebo, sans-serif",
                      color: isActive ? "#6B7B5A" : "rgba(51,51,51,0.72)",
                      background: isActive ? "rgba(107,123,90,0.08)" : "transparent",
                      borderRight: isActive ? "3px solid #C5A46D" : "3px solid transparent",
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-primary w-full justify-center mt-2"
            >
              דברו איתי
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
