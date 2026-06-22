import { Metadata } from 'next';
import Header from "@/components/Header";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'שאלות נפוצות | רגע לפני',
  description: 'תשובות לשאלות הכי נפוצות על מערכת ניהול האורחים של רגע לפני.',
};

export default function FAQPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 pb-16" style={{ background: '#FDFAF5', minHeight: '100vh' }}>
        <FAQ />
      </div>
      <Footer />
    </main>
  );
}
