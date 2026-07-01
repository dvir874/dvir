import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import HowItWorks from "@/components/HowItWorks";
import ComparisonSection from "@/components/ComparisonSection";
import DashboardDemo from "@/components/DashboardDemo";
import TrustBar from "@/components/TrustBar";
import About from "@/components/About";
import WhatYouGet from "@/components/WhatYouGet";
import Testimonials from "@/components/Testimonials";
import BookDemoCTA from "@/components/BookDemoCTA";
import FAQ from "@/components/FAQ";
import CTAStrip from "@/components/CTAStrip";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Link from "next/link";
import { WA_URL_PRICING } from "@/lib/constants";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <WhyUs />
      <HowItWorks />
      <ComparisonSection />
      <DashboardDemo />
      <TrustBar />
      <About />
      <WhatYouGet />
      <Testimonials />

      {/* ── הזמנות CTA ── */}
      <section style={{ padding: "40px 20px", background: "#F6F1E8", textAlign: "center" }}>
        <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 15, color: "#8C7B6E", marginBottom: 12 }}>
          מחפשים עיצובי הזמנות?
        </p>
        <Link
          href="/invitations"
          style={{
            display: "inline-block",
            padding: "13px 32px",
            borderRadius: 9999,
            border: "2px solid #C5A46D",
            color: "#8B6914",
            fontFamily: "Frank Ruhl Libre, serif",
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          לכל העיצובים ←
        </Link>
      </section>

      {/* ── מחירים: דברו איתי ── */}
      <section id="pricing" style={{ padding: "64px 20px", background: "#FDFAF5", textAlign: "center" }}>
        <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, color: "#C5A46D", letterSpacing: "0.12em", marginBottom: 12 }}>
          מחירים
        </p>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: "clamp(28px,5vw,42px)", color: "#1C1008", marginBottom: 16, lineHeight: 1.2 }}>
          כל חתונה שונה.<br />המחיר גם כן.
        </h2>
        <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 17, color: "#8C7B6E", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
          אני בונה כל חבילה בהתאמה אישית — לפי מספר האורחים, הפיצ׳רים שאתם צריכים, ולו״ז האירוע. שניה אחת של שיחה מספיקה.
        </p>
        <a
          href={WA_URL_PRICING}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 40px",
            borderRadius: 9999,
            background: "#C5A46D",
            color: "#fff",
            fontFamily: "Frank Ruhl Libre, serif",
            fontWeight: 700,
            fontSize: 18,
            textDecoration: "none",
            boxShadow: "0 6px 24px rgba(197,164,109,0.38)",
          }}
        >
          💬 דברו איתי
        </a>
        <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: "#8C7B6E", marginTop: 14 }}>
          מענה תוך 24 שעות · ללא התחייבות
        </p>
      </section>

      <BookDemoCTA />
      <FAQ />
      <CTAStrip />
      <Contact />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
