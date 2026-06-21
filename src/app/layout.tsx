import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app'),
  title: {
    default: 'רגע לפני — ניהול אורחים חכם לחתונות ואירועים',
    template: '%s | רגע לפני',
  },
  description: 'מערכת ניהול אורחים לחתונות ואירועים — אישורי הגעה, תזכורות אוטומטיות, הושבה, תקציב ומתנות. מוכן תוך 48 שעות. שקט נפשי לכל הדרך.',
  keywords: [
    'ניהול אורחים לחתונה',
    'אישורי הגעה לחתונה',
    'תזכורות אוטומטיות לאורחים',
    'ניהול חתונה',
    'אפליקציה לחתונה',
    'רשימת מוזמנים לחתונה',
    'ניהול אירועים',
    'הושבה לחתונה',
    'דף אירוע דיגיטלי',
    'מערכת ניהול חתונה',
    'ניהול מוזמנים',
    'אישור הגעה דיגיטלי',
  ],
  authors: [{ name: 'רגע לפני' }],
  creator: 'רגע לפני',
  publisher: 'רגע לפני',
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app',
    siteName: 'רגע לפני',
    title: 'רגע לפני — ניהול אורחים חכם לחתונות',
    description: 'אישורי הגעה, תזכורות אוטומטיות, הושבה ותקציב — הכל במקום אחד. מוכן תוך 48 שעות.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'רגע לפני — ניהול אורחים לחתונה',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'רגע לפני — ניהול אורחים חכם לחתונות',
    description: 'אישורי הגעה, תזכורות אוטומטיות, הושבה ותקציב — הכל במקום אחד.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app',
    languages: { 'he-IL': process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app' },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F1E8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics 4 — set NEXT_PUBLIC_GA_ID in Vercel env vars */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Hotjar — set NEXT_PUBLIC_HOTJAR_ID in Vercel env vars */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}

      </head>
      <body className="bg-cream text-dark antialiased">
        {/* JSON-LD: LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "רגע לפני",
              "description": "מערכת ניהול אורחים לחתונות ואירועים — אישורי הגעה, תזכורות אוטומטיות, הושבה ותקציב.",
              "url": process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app",
              "telephone": "+972533318177",
              "priceRange": "$$",
              "image": `${process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app"}/og-image.png`,
              "areaServed": { "@type": "Country", "name": "Israel" },
              "availableLanguage": { "@type": "Language", "name": "Hebrew" },
              "serviceType": ["ניהול אורחים", "ניהול חתונה", "אישורי הגעה", "תזכורות אוטומטיות"],
              "sameAs": [],
            }),
          }}
        />
        {/* JSON-LD: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "רגע לפני",
              "url": process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
