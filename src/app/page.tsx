import HeaderWarm from "@/components/HeaderWarm";
import HeroWarm from "@/components/HeroWarm";
import WhyUsWarm from "@/components/WhyUsWarm";
import ShowcaseBand from "@/components/ShowcaseBand";
import HowItWorksWarm from "@/components/HowItWorksWarm";
import ComparisonWarm from "@/components/ComparisonWarm";
import EmotionalBand from "@/components/EmotionalBand";
import ToolsWarm from "@/components/ToolsWarm";
import ProcessWarm from "@/components/ProcessWarm";
import EventTypesWarm from "@/components/EventTypesWarm";
import GalleryWarm from "@/components/GalleryWarm";
import AboutWarm from "@/components/AboutWarm";
import TrustWarm from "@/components/TrustWarm";
import CTAWarm from "@/components/CTAWarm";
import FAQWarm from "@/components/FAQWarm";
import ContactWarm from "@/components/ContactWarm";
import FooterWarm from "@/components/FooterWarm";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <main className="relative">
      <HeaderWarm />
      <HeroWarm />

      <FadeIn><WhyUsWarm /></FadeIn>

      {/* dark full-bleed product showcase — the "wow" after the hero */}
      <ShowcaseBand />

      <div id="how"><FadeIn><HowItWorksWarm /></FadeIn></div>

      <FadeIn><ComparisonWarm /></FadeIn>

      {/* emotional beat */}
      <EmotionalBand
        variant="ink"
        quote="תפסיקו לרדוף אחרי בני דודים שלא ענו בוואטסאפ."
        sub="המערכת שולחת את התזכורות. אתם רק מקבלים את התשובות."
      />

      <FadeIn><ToolsWarm /></FadeIn>
      <FadeIn><ProcessWarm /></FadeIn>

      {/* emotional beat */}
      <EmotionalBand
        variant="cream"
        quote="ביום החתונה אתם צריכים להתרגש, לא לנהל אקסלים."
        sub="אנחנו לוקחים את הלוגיסטיקה. לכם נשאר הרגע."
      />

      <div id="features"><FadeIn><EventTypesWarm /></FadeIn></div>
      <FadeIn><GalleryWarm /></FadeIn>
      <FadeIn><AboutWarm /></FadeIn>

      {/* qualitative trust — the person behind the product */}
      <TrustWarm />

      <FadeIn><CTAWarm /></FadeIn>
      <div id="faq"><FadeIn><FAQWarm /></FadeIn></div>
      <div id="contact"><FadeIn><ContactWarm /></FadeIn></div>

      <FooterWarm />
      <StickyMobileCTA />
    </main>
  );
}
