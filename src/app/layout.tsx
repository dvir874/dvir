import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "רגע לפני | הזמנות דיגיטליות מעוצבות לחתונות ואירועים",
  description:
    "הזמנות דיגיטליות יוקרתיות בהתאמה אישית לחתונות, חינות, בר ובת מצווה ואירועים מיוחדים. שירות מהיר ומקצועי. מחיר החל מ-₪70.",
  keywords:
    "הזמנות דיגיטליות, הזמנה לחתונה, הזמנה לבר מצווה, הזמנה לבת מצווה, הזמנה ליום הולדת, הזמנה לחינה, הזמנה לברית מילה, הזמנה לברית בנות, עיצוב הזמנות, הזמנה אישית, רגע לפני, הזמנה דיגיטלית ישראל",
  authors: [{ name: "רגע לפני" }],
  metadataBase: new URL("https://ragalifnei.co.il"),
  openGraph: {
    title: "רגע לפני | הזמנות דיגיטליות יוקרתיות לכל אירוע",
    description:
      "הזמנות דיגיטליות יוקרתיות בהתאמה אישית לחתונות, חינות, בר ובת מצווה ואירועים מיוחדים. שירות מהיר ומקצועי.",
    locale: "he_IL",
    type: "website",
    siteName: "רגע לפני",
  },
  twitter: {
    card: "summary_large_image",
    title: "רגע לפני | הזמנות דיגיטליות",
    description:
      "הזמנות דיגיטליות יוקרתיות בהתאמה אישית לכל אירוע. מחיר החל מ-₪70.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "רגע לפני",
              description:
                "הזמנות דיגיטליות יוקרתיות בהתאמה אישית לכל אירוע",
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
