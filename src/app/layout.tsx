import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "רגע לפני | ניהול חתונה מלא — הזמנות, אורחים, הושבה ותקציב במקום אחד",
  description:
    "פלטפורמת ניהול חתונה עם ליווי אישי — הזמנות דיגיטליות, אישורי הגעה, תזכורות אוטומטיות בוואטסאפ, תכנון הושבה, מעקב תקציב ומתנות. כל מה שצריך לנהל את החתונה שלכם, במקום אחד.",
  keywords:
    "ניהול חתונה, הזמנות דיגיטליות, אישורי הגעה לחתונה, תכנון הושבה, תזכורות וואטסאפ חתונה, לוח בקרה חתונה, מעקב תקציב חתונה, הזמנה לחתונה, הזמנה לבר מצווה, הזמנה לבת מצווה, הזמנה לחינה, הזמנה לברית, רגע לפני, ניהול אירועים ישראל",
  authors: [{ name: "רגע לפני" }],
  metadataBase: new URL("https://ragalifnei.co.il"),
  openGraph: {
    title: "רגע לפני | ניהול חתונה מלא עם ליווי אישי",
    description:
      "תגיעו לחתונה שלכם רגועים ונינוחים — אנחנו מנהלים את הלוגיסטיקה. הזמנות, אורחים, הושבה, תקציב ומשימות — הכל במקום אחד.",
    locale: "he_IL",
    type: "website",
    siteName: "רגע לפני",
  },
  twitter: {
    card: "summary_large_image",
    title: "רגע לפני | ניהול חתונה מלא",
    description:
      "תגיעו לחתונה שלכם רגועים — אנחנו מנהלים את הלוגיסטיקה. הזמנות, אורחים, הושבה ותקציב במקום אחד.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ragalifnei.co.il",
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "רגע לפני",
              description:
                "פלטפורמת ניהול חתונה מלאה עם ליווי אישי — הזמנות דיגיטליות, אישורי הגעה, תכנון הושבה, מעקב תקציב ומתנות",
              telephone: "+972533318177",
              email: "dvir874@gmail.com",
              address: { "@type": "PostalAddress", addressCountry: "IL" },
              priceRange: "₪₪",
              url: "https://ragalifnei.co.il",
            }),
          }}
        />
      </head>
      <body className="bg-cream text-dark antialiased">{children}</body>
    </html>
  );
}
