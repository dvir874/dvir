import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import DashboardDemo from "@/components/DashboardDemo";
import LiveInvitationDemo from "@/components/LiveInvitationDemo";
import LiveDashboardWidget from "@/components/LiveDashboardWidget";
import LiveSeatingWidget from "@/components/LiveSeatingWidget";
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
      <WhyUs />
      <DashboardDemo />
      <LiveInvitationDemo />
      <LiveDashboardWidget />
      <LiveSeatingWidget />
      <BookDemoCTA />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
    </main>
  );
}
