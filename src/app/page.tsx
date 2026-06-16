import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedDesigns from "@/components/FeaturedDesigns";
import EventCategories from "@/components/EventCategories";
import Gallery from "@/components/Gallery";
import WhyUs from "@/components/WhyUs";
import HowItWorks from "@/components/HowItWorks";
import ComparisonSection from "@/components/ComparisonSection";
import DashboardDemo from "@/components/DashboardDemo";
import Pricing from "@/components/Pricing";
import BookDemoCTA from "@/components/BookDemoCTA";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import CTAStrip from "@/components/CTAStrip";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <FeaturedDesigns />
      <EventCategories />
      <Gallery />
      <WhyUs />
      <HowItWorks />
      <ComparisonSection />
      <DashboardDemo />
      <Pricing />
      <BookDemoCTA />
      <About />
      <FAQ />
      <CTAStrip />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
