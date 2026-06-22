import { Metadata } from 'next';
import Header from "@/components/Header";
import HowItWorks from "@/components/HowItWorks";
import BookDemoCTA from "@/components/BookDemoCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'איך זה עובד | רגע לפני',
  description: 'איך מערכת ניהול האורחים של רגע לפני עובדת — תהליך מהיר, פשוט, ומותאם לכל זוג.',
};

export default function HowItWorksPage() {
  return (
    <main>
      <Header />
      <div className="pt-20">
        <HowItWorks />
      </div>
      <BookDemoCTA />
      <Footer />
    </main>
  );
}
