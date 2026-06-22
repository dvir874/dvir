import { Metadata } from 'next';
import Header from "@/components/Header";
import FeaturedDesigns from "@/components/FeaturedDesigns";
import ComparisonSection from "@/components/ComparisonSection";
import HowItWorks from "@/components/HowItWorks";
import EventCategories from "@/components/EventCategories";
import CTAStrip from "@/components/CTAStrip";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "פיצ'רים | רגע לפני",
  description: "כל הפיצ'רים של מערכת ניהול האורחים — אישורי הגעה, תזכורות, הושבה, תקציב ומתנות.",
};

export default function FeaturesPage() {
  return (
    <main>
      <Header />
      <div className="pt-20">
        <FeaturedDesigns />
        <ComparisonSection />
        <HowItWorks />
        <EventCategories />
        <CTAStrip />
      </div>
      <Footer />
    </main>
  );
}
