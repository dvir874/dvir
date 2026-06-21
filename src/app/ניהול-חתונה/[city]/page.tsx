import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';

const CITIES: Record<string, { he: string; region: string }> = {
  'tel-aviv':       { he: 'תל אביב',       region: 'גוש דן' },
  'jerusalem':      { he: 'ירושלים',        region: 'ירושלים והסביבה' },
  'haifa':          { he: 'חיפה',           region: 'חיפה והצפון' },
  'beer-sheva':     { he: 'באר שבע',        region: 'הנגב' },
  'rishon-lezion':  { he: 'ראשון לציון',    region: 'גוש דן' },
  'petah-tikva':    { he: 'פתח תקווה',      region: 'גוש דן' },
  'ashdod':         { he: 'אשדוד',          region: 'שפלה' },
  'netanya':        { he: 'נתניה',          region: 'השרון' },
  'holon':          { he: 'חולון',          region: 'גוש דן' },
  'bnei-brak':      { he: 'בני ברק',        region: 'גוש דן' },
  'ramat-gan':      { he: 'רמת גן',         region: 'גוש דן' },
  'bat-yam':        { he: 'בת ים',          region: 'גוש דן' },
  'herzliya':       { he: 'הרצליה',         region: 'השרון' },
  'kfar-saba':      { he: 'כפר סבא',        region: 'השרון' },
  'modiin':         { he: 'מודיעין',        region: 'מרכז' },
};

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return Object.keys(CITIES).map((c) => ({ city: c }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) return {};
  const title = `ניהול אורחים לחתונה ב${data.he} — רגע לפני`;
  const description = `מערכת ניהול אורחים לחתונה ב${data.he}: אישורי הגעה דיגיטליים, תזכורות אוטומטיות בוואטסאפ, הושבה ותקציב. מוכן תוך 48 שעות.`;
  return {
    title,
    description,
    keywords: [`ניהול אורחים לחתונה ב${data.he}`, `חתונה ב${data.he}`, `ניהול חתונה ${data.he}`, `אישורי הגעה ${data.he}`],
    openGraph: { title, description, url: `${BASE}/ניהול-חתונה/${city}`, images: [{ url: '/og-image.png' }] },
    alternates: { canonical: `${BASE}/ניהול-חתונה/${city}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) notFound();

  const G = { gold: "#C5A46D", olive: "#6B7B5A", cream: "#F6F1E8", ivory: "#FDFAF5", dark: "#333333", border: "rgba(197,164,109,0.18)" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `ניהול אורחים לחתונה ב${data.he}`,
    "provider": { "@type": "LocalBusiness", "name": "רגע לפני", "areaServed": { "@type": "City", "name": data.he } },
    "description": `מערכת ניהול אורחים לחתונה ב${data.he}`,
    "url": `${BASE}/ניהול-חתונה/${city}`,
  };

  const FAQ = [
    { q: `האם השירות זמין ב${data.he}?`, a: `כן, השירות זמין בכל הארץ כולל ${data.he} ואזור ${data.region}. הכל מתנהל אונליין.` },
    { q: `כמה זמן לוקח להתחיל?`, a: `תוך 48 שעות הכל מוכן — דף אירוע, אישורי הגעה ותזכורות אוטומטיות.` },
    { q: `האם יש ליווי אישי?`, a: `כן, אנחנו מלווים אתכם בוואטסאפ לאורך כל התהליך.` },
  ];

  return (
    <div dir="rtl" style={{ background: G.ivory, minHeight: "100vh", fontFamily: "Heebo, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ background: `linear-gradient(160deg,${G.cream} 0%,#EDE6D6 100%)`, padding: "80px 20px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💍</div>
          <p style={{ color: G.gold, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
            רגע לפני — {data.region}
          </p>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(26px,5vw,40px)", color: G.dark, fontWeight: 700, lineHeight: 1.3, marginBottom: 20 }}>
            ניהול אורחים לחתונה ב{data.he}
          </h1>
          <p style={{ fontSize: 17, color: "rgba(51,51,51,0.65)", lineHeight: 1.7, marginBottom: 36 }}>
            אישורי הגעה דיגיטליים, תזכורות אוטומטיות בוואטסאפ, הושבה ותקציב — הכל במקום אחד. מוכן תוך 48 שעות.
          </p>
          <Link
            href="/#contact"
            style={{
              display: "inline-block", padding: "16px 40px", borderRadius: 14,
              background: `linear-gradient(135deg,${G.gold},#B8935A)`,
              color: "white", fontWeight: 700, fontSize: 17, textDecoration: "none",
            }}
          >
            התחל עכשיו
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 700, margin: "0 auto", padding: "60px 20px" }}>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 26, color: G.dark, textAlign: "center", marginBottom: 32, fontWeight: 700 }}>
          שאלות נפוצות — חתונות ב{data.he}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FAQ.map((item) => (
            <div key={item.q} style={{ background: "white", border: `1px solid ${G.border}`, borderRadius: 16, padding: "18px 22px" }}>
              <p style={{ fontWeight: 700, color: G.dark, fontSize: 15, marginBottom: 6 }}>{item.q}</p>
              <p style={{ color: "rgba(51,51,51,0.6)", fontSize: 14, lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          "mainEntity": FAQ.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
        }) }} />
      </section>

      <section style={{ background: `linear-gradient(135deg,${G.olive},#3A5030)`, padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", color: "white", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>
          מוכנים להתחיל?
        </h2>
        <Link href="/#contact" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 14, background: "white", color: G.olive, fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
          השאירו פרטים
        </Link>
      </section>
    </div>
  );
}
