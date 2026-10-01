import type { Metadata } from "next";

/* The one page that keeps a canonical, now that the root layout no longer
   forces one on everybody. Relative, so metadataBase resolves it — and so a
   preview deployment does not announce the production URL as its own. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

import HeaderWarm from "@/components/HeaderWarm";
import HeroWarm from "@/components/HeroWarm";
import WhyUsLive from "@/components/WhyUsLive";
import GuestJourney from "@/components/GuestJourney";
import PackageWarm from "@/components/PackageWarm";
import HowItWorksWarm from "@/components/HowItWorksWarm";
import ComparisonWarm from "@/components/ComparisonWarm";
import EmotionalBand from "@/components/EmotionalBand";
import ToolsWarm from "@/components/ToolsWarm";
import ProcessWarm from "@/components/ProcessWarm";
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

      {/* the real guest experience, straight after the hero (Stitch 2ce3b8fb) */}
      <GuestJourney />

      <WhyUsLive />

      <div id="how"><FadeIn><HowItWorksWarm /></FadeIn></div>

      <FadeIn><ComparisonWarm /></FadeIn>

      {/* emotional beat */}
      <EmotionalBand
        variant="ink"
        quote="תפסיקו לרדוף אחרי בני דודים שלא ענו בוואטסאפ."
        sub="המערכת שולחת את התזכורות. אתם רק מקבלים את התשובות."
      />

      <div id="features"><FadeIn><ToolsWarm /></FadeIn></div>
      <FadeIn><ProcessWarm /></FadeIn>

      {/* emotional beat */}
      <EmotionalBand
        variant="cream"
        quote="ביום החתונה אתם צריכים להתרגש, לא לנהל אקסלים."
        sub="אנחנו לוקחים את הלוגיסטיקה. לכם נשאר הרגע."
      />

      <FadeIn><AboutWarm /></FadeIn>

      {/* qualitative trust — the person behind the product */}
      <TrustWarm />

      <FadeIn><CTAWarm /></FadeIn>
      <PackageWarm />
      <div id="faq"><FadeIn><FAQWarm /></FadeIn></div>
      <div id="contact"><FadeIn><ContactWarm /></FadeIn></div>

      <FooterWarm />
      <StickyMobileCTA />
    </main>
  );
}
