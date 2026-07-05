import HeaderWarm from "@/components/HeaderWarm";
import HeroWarm from "@/components/HeroWarm";
import WhyUsWarm from "@/components/WhyUsWarm";
import HowItWorksWarm from "@/components/HowItWorksWarm";
import ComparisonWarm from "@/components/ComparisonWarm";
import ToolsWarm from "@/components/ToolsWarm";
import ProcessWarm from "@/components/ProcessWarm";
import EventTypesWarm from "@/components/EventTypesWarm";
import GalleryWarm from "@/components/GalleryWarm";
import AboutWarm from "@/components/AboutWarm";
import CTAWarm from "@/components/CTAWarm";
import FAQWarm from "@/components/FAQWarm";
import ContactWarm from "@/components/ContactWarm";
import FooterWarm from "@/components/FooterWarm";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function Home() {
  return (
    <main className="relative">
      <HeaderWarm />
      <HeroWarm />
      <WhyUsWarm />
      <div id="how"><HowItWorksWarm /></div>
      <ComparisonWarm />
      <ToolsWarm />
      <ProcessWarm />
      <div id="features"><EventTypesWarm /></div>
      <GalleryWarm />
      <AboutWarm />
      <CTAWarm />
      <div id="faq"><FAQWarm /></div>
      <div id="contact"><ContactWarm /></div>
      <FooterWarm />
      <StickyMobileCTA />
    </main>
  );
}
