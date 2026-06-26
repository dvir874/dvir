import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JourneyStrip from "@/components/JourneyStrip";
import WhatYouGet from "@/components/WhatYouGet";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import ComparisonSection from "@/components/ComparisonSection";
import BookDemoCTA from "@/components/BookDemoCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <JourneyStrip />
      <WhatYouGet />
      <WhyUs />
      <Testimonials />
      <ComparisonSection />
      <BookDemoCTA />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
    </main>
  );
}
