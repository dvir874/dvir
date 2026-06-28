import Link from "next/link";
import LandingStickyCTA from "@/components/LandingStickyCTA";

/* ─── Design tokens — SYS-02 ───────────────────────────────────────── */
const C = {
  ivory:     "#FDFAF5",
  cream:     "#F6F1E8",
  gold:      "#C5A46D",
  goldText:  "#8B6914",
  dark:      "#1C1008",
  muted:     "rgba(28,16,8,0.52)",
  olive:     "#6B7B5A",
  border:    "#E8E0D4",
} as const;

/* ─── Botanical divider ────────────────────────────────────────────── */
function BotanicalDivider() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
      <svg width="80" height="40" viewBox="0 0 80 40" fill="none" aria-hidden="true">
        <path d="M40 36 C40 36 40 20 40 8" stroke={C.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M40 26 C40 26 30 21 24 16" stroke={C.olive} strokeWidth="1" strokeLinecap="round"/>
        <path d="M40 26 C40 26 50 21 56 16" stroke={C.olive} strokeWidth="1" strokeLinecap="round"/>
        <path d="M40 18 C40 18 32 14 27 10" stroke={C.olive} strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M40 18 C40 18 48 14 53 10" stroke={C.olive} strokeWidth="0.8" strokeLinecap="round"/>
        <ellipse cx="23" cy="15" rx="4" ry="2.2" transform="rotate(-30 23 15)" fill={C.olive} opacity="0.45"/>
        <ellipse cx="57" cy="15" rx="4" ry="2.2" transform="rotate(30 57 15)" fill={C.olive} opacity="0.4"/>
        <ellipse cx="26" cy="9.5" rx="3" ry="1.8" transform="rotate(-40 26 9.5)" fill={C.olive} opacity="0.38"/>
        <ellipse cx="54" cy="9.5" rx="3" ry="1.8" transform="rotate(40 54 9.5)" fill={C.olive} opacity="0.35"/>
      </svg>
    </div>
  );
}

/* ─── Gold CTA button ──────────────────────────────────────────────── */
function GoldCTA({ href, children, outline = false }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "16px 32px",
        background: outline ? "transparent" : C.gold,
        color: outline ? C.goldText : "#fff",
        border: outline ? `1.5px solid ${C.gold}` : "none",
        borderRadius: "12px",
        fontSize: "17px",
        fontWeight: 700,
        fontFamily: "'Heebo', sans-serif",
        textDecoration: "none",
        minHeight: "54px",
        boxShadow: outline ? "none" : "0 4px 16px rgba(197,164,109,0.38)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

/* ─── Feature card ─────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: C.cream,
      border: `1px solid ${C.border}`,
      borderRadius: "16px",
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}>
      <span style={{ fontSize: "40px", lineHeight: 1 }}>{icon}</span>
      <h3 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "20px", fontWeight: 700, color: C.dark, margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "14px", fontWeight: 300, color: C.muted, lineHeight: 1.7, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

/* ─── Stars ────────────────────────────────────────────────────────── */
function Stars() {
  return (
    <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: C.gold, fontSize: "16px" }}>★</span>
      ))}
    </div>
  );
}

/* ─── Testimonial card ──────────────────────────────────────────────── */
function TestimonialCard({ quote, name, location }: { quote: string; name: string; location: string }) {
  return (
    <div style={{
      background: C.cream,
      border: `1px solid ${C.border}`,
      borderRadius: "16px",
      padding: "24px",
    }}>
      <Stars />
      <p style={{
        fontFamily: "'Frank Ruhl Libre', serif",
        fontSize: "16px",
        fontWeight: 300,
        fontStyle: "italic",
        color: C.dark,
        lineHeight: 1.7,
        marginBottom: "16px",
      }}>
        "{quote}"
      </p>
      <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "13px", color: C.muted }}>
        {name} · {location}
      </p>
    </div>
  );
}

/* ─── Phone mockup ──────────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Glow blob */}
      <div style={{
        position: "absolute",
        width: "360px",
        height: "360px",
        background: `radial-gradient(ellipse, ${C.cream} 0%, transparent 70%)`,
        borderRadius: "50%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      {/* Phone */}
      <div style={{
        position: "relative",
        width: "240px",
        background: "#fff",
        borderRadius: "36px",
        boxShadow: "0 24px 60px rgba(28,16,8,0.18), 0 8px 20px rgba(28,16,8,0.08)",
        border: "6px solid #1C1008",
        overflow: "hidden",
        transform: "rotate(-3deg)",
      }}>
        {/* Status bar */}
        <div style={{ background: "#1C1008", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "60px", height: "6px", background: "#333", borderRadius: "3px" }} />
        </div>

        {/* Screen content */}
        <div style={{ background: C.ivory, padding: "16px 12px", direction: "rtl" }}>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "9px", color: C.muted, marginBottom: "4px" }}>שלום</p>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "14px", fontWeight: 700, color: C.dark, marginBottom: "12px" }}>
            מירב ודביר 💍
          </p>

          {/* Countdown */}
          <div style={{ background: C.cream, borderRadius: "12px", padding: "10px", textAlign: "center", marginBottom: "10px", border: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "28px", fontWeight: 900, color: C.goldText, margin: 0 }}>57</p>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "9px", color: C.muted }}>ימים לחתונה</p>
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[
              { label: "אורחים", value: "247" },
              { label: "אישרו", value: "189" },
              { label: "משימות", value: "12/18" },
              { label: "מוכנות", value: "72%" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: "8px", padding: "6px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "13px", fontWeight: 700, color: C.goldText, margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "8px", color: C.muted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div style={{
        position: "absolute",
        top: "60px",
        right: "-20px",
        background: "#fff",
        borderRadius: "10px",
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(28,16,8,0.12)",
        border: `1px solid ${C.border}`,
        transform: "rotate(3deg)",
        whiteSpace: "nowrap",
      }}>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "11px", fontWeight: 600, color: C.dark, margin: 0 }}>✅ 12 משימות הושלמו</p>
      </div>

      <div style={{
        position: "absolute",
        bottom: "80px",
        left: "-28px",
        background: "#fff",
        borderRadius: "10px",
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(28,16,8,0.12)",
        border: `1px solid ${C.border}`,
        transform: "rotate(-2deg)",
        whiteSpace: "nowrap",
      }}>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "11px", fontWeight: 600, color: C.dark, margin: 0 }}>👥 247 אורחים</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LANDING PAGE — E1-S1 Desktop | E1 Marketing Experience
   Stitch-approved design: projects/7980168406882022650/screens/6b01f646ace04a76b771bfb046549f59
═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;700;900&family=Heebo:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: ${C.ivory}; }

        .landing-page { background: ${C.ivory}; direction: rtl; font-family: 'Heebo', sans-serif; }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }

        /* Features grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        /* Testimonials grid */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }

        /* Hero layout */
        .hero-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          padding: 80px 0 100px;
        }
        @media (max-width: 768px) {
          .hero-layout {
            grid-template-columns: 1fr;
            min-height: auto;
            padding: 48px 0 80px;
          }
          .hero-phone { display: none !important; }
          /* Mobile: center hero content */
          .hero-layout > div:first-child { text-align: center; }
          .hero-layout > div:first-child p,
          .hero-layout > div:first-child h1 { text-align: center; }
          /* Mobile: full-width CTAs */
          .hero-cta-group { flex-direction: column !important; }
          .hero-cta-group a { max-width: 100% !important; width: 100% !important; }
          /* Mobile: hide secondary CTA (sticky bar handles it) */
          .cta-secondary-mobile { display: none; }
          /* Mobile: single-column features */
          .features-grid { grid-template-columns: 1fr !important; }
          /* Mobile: single-column testimonials */
          .testimonials-grid { grid-template-columns: 1fr !important; }
          /* Mobile container padding */
          .container { padding: 0 20px; }
          /* Mobile: add bottom padding for sticky bar */
          .landing-page { padding-bottom: 80px; }
        }

        /* Skip link */
        .skip-link {
          position: absolute;
          top: -100px;
          left: 16px;
          background: ${C.dark};
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-family: 'Heebo', sans-serif;
          font-size: 14px;
          z-index: 9999;
          transition: top 0.2s;
        }
        .skip-link:focus { top: 16px; }
      `}</style>

      <a href="#main" className="skip-link">דלגו לתוכן</a>

      <div className="landing-page">

        {/* ── Top bar (logo only — conversion-focused, no nav) ──────── */}
        <div style={{ padding: "20px 40px", display: "flex", justifyContent: "flex-start" }}>
          <Link href="/" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "20px", fontWeight: 700, color: C.dark, textDecoration: "none" }}>
            רגע לפני
          </Link>
        </div>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <main id="main" className="container">
          <div className="hero-layout">

            {/* Right: copy + CTA */}
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: C.goldText,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}>
                ברוכים הבאים
              </p>

              <h1 style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 900,
                color: C.dark,
                lineHeight: 1.12,
                marginBottom: "20px",
              }}>
                החתונה שלכם<br />מתחילה כאן
              </h1>

              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: "18px",
                fontWeight: 300,
                color: C.muted,
                lineHeight: 1.75,
                marginBottom: "12px",
                maxWidth: "480px",
              }}>
                ניהול אורחים, הושבה, גלריה ותכנון מלא — במקום אחד
              </p>

              <p style={{
                fontFamily: "'Heebo', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: C.goldText,
                marginBottom: "32px",
              }}>
                💍 800+ זוגות כבר מתכננים
              </p>

              <div id="hero-cta-sentinel" className="hero-cta-group" style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px" }}>
                <GoldCTA href="/auth/register">התחילו עכשיו →</GoldCTA>
                <div className="cta-secondary-mobile">
                  <GoldCTA href="/event/demo" outline>ראו דוגמה</GoldCTA>
                </div>
              </div>
            </div>

            {/* Left: phone mockup */}
            <div className="hero-phone" style={{ display: "flex", justifyContent: "center" }}>
              <PhoneMockup />
            </div>
          </div>
        </main>

        <BotanicalDivider />

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section aria-labelledby="features-heading" style={{ padding: "40px 0 60px" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "12px", color: C.goldText, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "10px" }}>
                מה תקבלו
              </p>
              <h2 id="features-heading" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: C.dark, marginBottom: "12px" }}>
                הכל במקום אחד
              </h2>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "17px", fontWeight: 300, color: C.muted }}>
                כל כלי שצריך לתכנן חתונה מושלמת
              </p>
            </div>

            <div className="features-grid">
              <FeatureCard icon="💌" title="הזמנות דיגיטליות" desc="שלחו הזמנות וקבלו אישורי הגעה בלחיצה אחת" />
              <FeatureCard icon="👥" title="ניהול אורחים" desc="עקבו אחרי כל אורח, הושבה ובקשות מיוחדות" />
              <FeatureCard icon="🪑" title="תרשים הושבה" desc="ערכו תרשים ישיבה חכם עם גרירה ושחרור" />
              <FeatureCard icon="💰" title="מעקב תקציב" desc="נהלו הוצאות וספקים ביד ברזל" />
              <FeatureCard icon="📸" title="גלריית תמונות" desc="אורחים מעלים תמונות ישירות לגלריה שלכם" />
              <FeatureCard icon="💬" title="WhatsApp Pro" desc="שלחו הודעות מותאמות אישית לכל הרשימה בקליק" />
            </div>
          </div>
        </section>

        <BotanicalDivider />

        {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
        <section aria-labelledby="testimonials-heading" style={{ padding: "40px 0 60px" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "12px", color: C.goldText, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "10px" }}>
                מה הזוגות שלנו אומרים
              </p>
              <h2 id="testimonials-heading" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(26px,4vw,36px)", fontWeight: 700, color: C.dark }}>
                מסיפורים אמיתיים
              </h2>
            </div>

            <div className="testimonials-grid">
              <TestimonialCard
                quote="רגע לפני שינה לנו את כל חוויית התכנון. קיבלנו תשובות בזמן אמת ומרגישים שמישהו מחזיק לנו את היד."
                name="ענבל ונדב"
                location="תל אביב"
              />
              <TestimonialCard
                quote="הגלריה הייתה הקסם הכי גדול — האורחים העלו תמונות ביום החתונה ואנחנו ישבנו עם ספל קפה וצפינו."
                name="מיכל ואלון"
                location="חיפה"
              />
              <TestimonialCard
                quote="ניהלנו 300 אורחים בלי שגיאה אחת. ה-WhatsApp Center חסך לנו שעות של עבודה ועצבים."
                name="שירה ואיתן"
                location="ירושלים"
              />
            </div>
          </div>
        </section>

        <BotanicalDivider />

        {/* ── PRICING TEASER ───────────────────────────────────────── */}
        <section aria-labelledby="pricing-heading" style={{ padding: "40px 0 80px", textAlign: "center" }}>
          <div className="container">
            <h2 id="pricing-heading" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: C.dark, marginBottom: "10px" }}>
              תחילו בחינם
            </h2>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "16px", fontWeight: 300, color: C.muted, marginBottom: "32px" }}>
              ללא כרטיס אשראי · ללא מחויבות
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <GoldCTA href="/auth/register">התחילו עכשיו בחינם</GoldCTA>
            </div>
            <Link
              href="/pricing"
              style={{ fontFamily: "'Heebo', sans-serif", fontSize: "14px", color: C.goldText, textDecoration: "underline", textUnderlineOffset: "3px" }}
            >
              ראו את כל תוכניות המחיר
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/privacy" style={{ fontFamily: "'Heebo', sans-serif", fontSize: "13px", color: C.muted, textDecoration: "none" }}>פרטיות</Link>
            <Link href="/terms"   style={{ fontFamily: "'Heebo', sans-serif", fontSize: "13px", color: C.muted, textDecoration: "none" }}>תנאים</Link>
            <Link href="/contact" style={{ fontFamily: "'Heebo', sans-serif", fontSize: "13px", color: C.muted, textDecoration: "none" }}>צרו קשר</Link>
          </div>
          <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "13px", color: C.muted }}>© 2026 רגע לפני</p>
          <Link href="/" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "18px", fontWeight: 700, color: C.dark, textDecoration: "none" }}>
            רגע לפני
          </Link>
        </footer>

      </div>

      <LandingStickyCTA />
    </>
  );
}
