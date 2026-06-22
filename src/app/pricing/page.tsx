import { Metadata } from 'next';
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'מחירים | רגע לפני',
  description: 'מחירים שקופים לניהול אורחים לחתונה — ללא הפתעות, ללא דמי מנוי חודשי.',
};

export default function PricingPage() {
  return (
    <main>
      <Header />
      <div className="pt-20">
        <Pricing />
        <FAQ />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
