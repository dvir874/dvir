"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/* Analytics everywhere except the pages guests see.
 *
 * The privacy policy tells guests, in writing, that their pages carry no
 * third-party tracking: "איננו משתמשים בעוגיות מעקב ואיננו מפעילים כלי פרסום
 * או ניתוח של צד שלישי בדפי האורחים". GA4 was loaded from the root layout, so
 * it ran on every one of them and the statement was false.
 *
 * A guest never agreed to anything — their number was handed over by the
 * couple. The marketing site is a different matter: people arrive there by
 * choice.
 *
 * Guest routes are listed rather than inferred, so a new one is a deliberate
 * decision rather than an accident of URL shape.
 */
const GUEST_PREFIXES = ["/rsvp", "/gallery", "/memory", "/event", "/couple", "/send"];

export default function Analytics() {
  const pathname = usePathname() ?? "";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;
  if (GUEST_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });`}
      </Script>
    </>
  );
}
