import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';

const CATEGORY_DATA: Record<string, {
  slug: string;
  he: string;
  keywords: string[];
  emoji: string;
  features: string[];
  faq: Array<{ q: string; a: string }>;
}> = {
  wedding: {
    slug: 'wedding',
    he: 'חתונה',
    emoji: '💍',
    title: 'ניהול אורחים לחתונה — רגע לפני',
    description: 'מערכת ניהול אורחים לחתונה: אישורי הגעה דיגיטליים, תזכורות אוטומטיות בוואטסאפ, תכנון הושבה, מעקב תקציב ומתנות. מוכן תוך 48 שעות.',
    keywords: ['ניהול אורחים לחתונה', 'אישורי הגעה לחתונה', 'רשימת מוזמנים לחתונה', 'תכנון חתונה', 'ניהול חתונה דיגיטלי'],
    features: [
      'דף אירוע אישי עם אישורי הגעה',
      'תזכורות אוטומטיות בוואטסאפ',
      'תכנון הושבה לפי שולחנות',
      'מעקב תקציב ומתנות',
      'לוח בקרה זוגי בזמן אמת',
      'גלריית תמונות מהאירוע',
    ],
    faq: [
      { q: 'כמה זמן לוקח להקים מערכת ניהול אורחים לחתונה?', a: 'תוך 48 שעות הכל מוכן — דף אירוע, אישורי הגעה ותזכורות אוטומטיות.' },
      { q: 'איך האורחים מאשרים הגעה?', a: 'האורחים מקבלים לינק אישי — לוחצים, מאשרים, ומילאו את הטופס בשניות בלי להתקין כלום.' },
      { q: 'האם ניתן לשלוח תזכורות אוטומטיות לאורחים?', a: 'כן. המערכת שולחת תזכורת שבוע לפני ויום לפני האירוע דרך וואטסאפ.' },
      { q: 'האם ניתן לנהל הושבה?', a: 'כן. יש מערכת תכנון הושבה לפי שולחנות עם drag & drop.' },
    ],
  },
  birthday: {
    slug: 'birthday',
    he: 'יום הולדת',
    emoji: '🎂',
    title: 'ניהול אורחים ליום הולדת — רגע לפני',
    description: 'ניהול מוזמנים ואישורי הגעה ליום הולדת — דף אירוע דיגיטלי, תזכורות אוטומטיות בוואטסאפ. פשוט, מהיר, מקצועי.',
    keywords: ['ניהול אורחים יום הולדת', 'אישורי הגעה יום הולדת', 'ניהול מוזמנים יום הולדת'],
    features: ['דף אירוע אישי', 'אישורי הגעה דיגיטליים', 'תזכורות אוטומטיות', 'מעקב מוזמנים', 'לוח בקרה בזמן אמת'],
    faq: [
      { q: 'האם המערכת מתאימה גם ליום הולדת קטן?', a: 'כן, המערכת מתאימה לכל גודל אירוע — מ-10 אורחים ועד מאות.' },
      { q: 'איך שולחים את ההזמנה לאורחים?', a: 'שולחים לינק בוואטסאפ — האורחים רואים את דף האירוע ומאשרים הגעה בקליק.' },
    ],
  },
  barmitzva: {
    slug: 'barmitzva',
    he: 'בר מצווה',
    emoji: '✡️',
    title: 'ניהול אורחים לבר מצווה — רגע לפני',
    description: 'מערכת ניהול אורחים לבר מצווה: אישורי הגעה, תזכורות אוטומטיות, הושבה ומעקב מתנות. ליווי אישי לאורך כל הדרך.',
    keywords: ['ניהול אורחים בר מצווה', 'אישורי הגעה בר מצווה', 'ניהול בר מצווה'],
    features: ['דף אירוע לבר מצווה', 'אישורי הגעה', 'תזכורות בוואטסאפ', 'תכנון הושבה', 'מעקב מתנות'],
    faq: [
      { q: 'כמה אורחים ניתן לנהל?', a: 'אין הגבלה — המערכת מתאימה לאירועים קטנים ולאירועים של מאות אורחים.' },
      { q: 'האם ניתן לעקוב אחר מתנות?', a: 'כן, יש מערכת מעקב מתנות מלאה.' },
    ],
  },
  batmitzva: {
    slug: 'batmitzva',
    he: 'בת מצווה',
    emoji: '🌟',
    title: 'ניהול אורחים לבת מצווה — רגע לפני',
    description: 'ניהול מלא לבת מצווה: דף אירוע אישי, אישורי הגעה, תזכורות אוטומטיות ותכנון הושבה. מוכן תוך 48 שעות.',
    keywords: ['ניהול אורחים בת מצווה', 'אישורי הגעה בת מצווה', 'ניהול בת מצווה'],
    features: ['דף אירוע לבת מצווה', 'אישורי הגעה דיגיטליים', 'תזכורות אוטומטיות', 'תכנון הושבה', 'לוח בקרה'],
    faq: [
      { q: 'מה כולל ניהול בת מצווה?', a: 'דף אירוע אישי, אישורי הגעה, תזכורות שבוע ויום לפני, תכנון הושבה ומעקב מתנות.' },
    ],
  },
  hina: {
    slug: 'hina',
    he: 'חינה',
    emoji: '🌙',
    title: 'ניהול אורחים לחינה — רגע לפני',
    description: 'ניהול אורחים לחינה: אישורי הגעה, תזכורות אוטומטיות בוואטסאפ. פשוט ומהיר — מוכן תוך 48 שעות.',
    keywords: ['ניהול אורחים חינה', 'אישורי הגעה חינה', 'ניהול חינה'],
    features: ['דף אירוע לחינה', 'אישורי הגעה', 'תזכורות בוואטסאפ', 'מעקב מוזמנים'],
    faq: [{ q: 'האם המערכת מתאימה לחינה?', a: 'כן, המערכת מתאימה לכל סוג אירוע כולל חינה.' }],
  },
  brit: {
    slug: 'brit',
    he: 'ברית מילה',
    emoji: '👶',
    title: 'ניהול אורחים לברית מילה — רגע לפני',
    description: 'ניהול מוזמנים לברית מילה: אישורי הגעה דיגיטליים ותזכורות אוטומטיות. מהיר, פשוט, מקצועי.',
    keywords: ['ניהול אורחים ברית מילה', 'אישורי הגעה ברית', 'ניהול ברית'],
    features: ['דף אירוע לברית', 'אישורי הגעה', 'תזכורות', 'מעקב מוזמנים'],
    faq: [{ q: 'האם המערכת מתאימה לברית?', a: 'כן, המערכת מתאימה לאירועים קטנים ומהירים כמו ברית.' }],
  },
  brita: {
    slug: 'brita',
    he: 'ברית בנות',
    emoji: '🌸',
    title: 'ניהול אורחים לברית בנות — רגע לפני',
    description: 'ניהול אורחים לברית בנות: אישורי הגעה ותזכורות אוטומטיות. הכל מסודר, הכל ידוע.',
    keywords: ['ניהול אורחים ברית בנות', 'אישורי הגעה ברית בנות'],
    features: ['דף אירוע', 'אישורי הגעה', 'תזכורות', 'מעקב מוזמנים'],
    faq: [{ q: 'האם המערכת מתאימה לברית בנות?', a: 'כן, לכל סוג אירוע משפחתי.' }],
  },
};

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return Object.keys(CATEGORY_DATA).map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const data = CATEGORY_DATA[category];
  if (!data) return {};
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${BASE}/ניהול-אירועים/${category}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    alternates: { canonical: `${BASE}/ניהול-אירועים/${category}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const data = CATEGORY_DATA[category];
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `ניהול אורחים ל${data.he}`,
    "provider": { "@type": "LocalBusiness", "name": "רגע לפני" },
    "description": data.description,
    "url": `${BASE}/ניהול-אירועים/${category}`,
    "areaServed": { "@type": "Country", "name": "Israel" },
  };

  const G = {
    gold: "#C5A46D", olive: "#6B7B5A", cream: "#F6F1E8",
    ivory: "#FDFAF5", dark: "#333333", border: "rgba(197,164,109,0.18)",
  };

  return (
    <div dir="rtl" style={{ background: G.ivory, minHeight: "100vh", fontFamily: "Heebo, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg,${G.cream} 0%,#EDE6D6 100%)`, padding: "80px 20px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{data.emoji}</div>
          <p style={{ color: G.gold, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
            רגע לפני
          </p>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(28px,5vw,42px)", color: G.dark, fontWeight: 700, lineHeight: 1.3, marginBottom: 20 }}>
            ניהול אורחים ל{data.he}
          </h1>
          <p style={{ fontSize: 17, color: "rgba(51,51,51,0.65)", lineHeight: 1.7, marginBottom: 36 }}>
            {data.description}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#contact"
              style={{
                display: "inline-block", padding: "14px 32px", borderRadius: 14,
                background: `linear-gradient(135deg,${G.gold},#B8935A)`,
                color: "white", fontWeight: 700, fontSize: 16, textDecoration: "none",
              }}
            >
              התחל עכשיו — חינם
            </Link>
            <Link
              href="/event/demo"
              style={{
                display: "inline-block", padding: "14px 28px", borderRadius: 14,
                background: "white", border: `1.5px solid ${G.border}`,
                color: G.dark, fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}
            >
              ראה הדגמה
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 20px" }}>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 28, color: G.dark, textAlign: "center", marginBottom: 40, fontWeight: 700 }}>
          מה כולל ניהול {data.he}?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {data.features.map((f) => (
            <div key={f} style={{ background: "white", border: `1px solid ${G.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ color: G.gold, fontSize: 20, flexShrink: 0 }}>✦</span>
              <p style={{ color: G.dark, fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>{f}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px 80px" }}>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 28, color: G.dark, textAlign: "center", marginBottom: 36, fontWeight: 700 }}>
          שאלות נפוצות
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.faq.map((item) => (
            <div key={item.q} style={{ background: "white", border: `1px solid ${G.border}`, borderRadius: 16, padding: "20px 24px" }}>
              <p style={{ fontWeight: 700, color: G.dark, fontSize: 16, marginBottom: 8 }}>{item.q}</p>
              <p style={{ color: "rgba(51,51,51,0.6)", fontSize: 15, lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": data.faq.map((item) => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": { "@type": "Answer", "text": item.a },
              })),
            }),
          }}
        />
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg,${G.olive},#3A5030)`, padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", color: "white", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          מוכנים להתחיל?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 32 }}>
          מוכן תוך 48 שעות. ליווי אישי לאורך כל הדרך.
        </p>
        <Link
          href="/#contact"
          style={{
            display: "inline-block", padding: "16px 40px", borderRadius: 14,
            background: "white", color: G.olive, fontWeight: 700, fontSize: 17, textDecoration: "none",
          }}
        >
          השאירו פרטים
        </Link>
      </section>
    </div>
  );
}
